/**
 * Gateway event handler — wires GatewayClient events to store dispatch.
 * Full implementation for OpenClaw integration.
 */

import { gameEvents } from "./events";
import type { GatewayClient } from "./gateway";
import type { GatewayFrame } from "./gateway-types";
import type { ChatMessage, TaskItem, SessionMetrics } from "@/types/game";
import { chatId, findTask, MAIN_SESSION_KEY } from "./reducer";

// ── Types ─────────────────────────────────────────────────────────────

export interface ModelChoice {
  id: string;
  provider: string;
  contextWindow?: number;
}

export interface AgentEventPayload {
  runId: string;
  sessionId?: string;
  type: "start" | "delta" | "tool_start" | "tool_delta" | "tool_end" | "end" | "error";
  content?: string;
  delta?: string;
  toolName?: string;
  toolInput?: string;
  toolOutput?: string;
  error?: string;
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
  };
  model?: string;
  provider?: string;
}

export interface ChatEventPayload {
  runId: string;
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  toolName?: string;
  toolInput?: string;
  toolOutput?: string;
  timestamp?: string;
}

export interface SessionEventPayload {
  sessionKey: string;
  metrics?: SessionMetrics;
}

export interface HandlerRefs {
  dispatch: () => (action: unknown) => void;
  tasks: () => TaskItem[];
  seats: () => unknown[];
  activeSessionKey: () => string | undefined;
  setActiveSessionKey: (key?: string) => void;
  seenStarts: Set<string>;
  bubbleAccum: Map<string, string>;
  bubbleThrottleTimers: Map<string, ReturnType<typeof setTimeout>>;
  runActors: Map<string, string>;
  modelCatalog: { current: ModelChoice[] | null };
  sessionRefreshTimer: { current: ReturnType<typeof setTimeout> | null };
  taskCounter: { current: number };
}

// ── Constants ──────────────────────────────────────────────────────────

const BUBBLE_THROTTLE_MS = 300;
const MAX_BUBBLE_LENGTH = 80;

// ── Helper Functions ────────────────────────────────────────────────────

function truncateForBubble(text: string, maxLen = MAX_BUBBLE_LENGTH): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen - 3) + "...";
}

function emitBubble(
  runId: string,
  text: string,
  refs: HandlerRefs,
  ttl = 4000
) {
  const existing = refs.bubbleAccum.get(runId) || "";
  const combined = existing + text;
  refs.bubbleAccum.set(runId, combined);

  // Throttle bubble updates
  if (!refs.bubbleThrottleTimers.has(runId)) {
    const timer = setTimeout(() => {
      const final = refs.bubbleAccum.get(runId);
      if (final) {
        gameEvents.emit("task-bubble", runId, truncateForBubble(final), ttl);
      }
      refs.bubbleThrottleTimers.delete(runId);
    }, BUBBLE_THROTTLE_MS);
    refs.bubbleThrottleTimers.set(runId, timer);
  }
}

// ── Main Wire Function ──────────────────────────────────────────────────

export function wireGatewayClient(client: GatewayClient, refs: HandlerRefs) {
  // Connection status
  client.onStatus((status) => {
    refs.dispatch()({ type: "SET_CONNECTION", status });
    
    if (status === "connected") {
      // Request model catalog on connect
      client.request("models.list", {}).then((res) => {
        const models = (res.payload as { models?: ModelChoice[] })?.models || [];
        refs.modelCatalog.current = models;
      }).catch(() => {});
    }
  });

  // Agent events - main execution stream
  client.on("agent", (payload: unknown) => {
    const p = payload as AgentEventPayload;
    const { runId, type } = p;
    if (!runId || !type) return;

    const task = findTask(refs.tasks(), runId);
    const sessionKey = task?.sessionKey ?? refs.activeSessionKey() ?? MAIN_SESSION_KEY;
    const actorName = refs.runActors.get(runId);

    switch (type) {
      case "start": {
        // Track start events to detect new runs
        if (!refs.seenStarts.has(runId)) {
          refs.seenStarts.add(runId);
          
          // Update task status
          refs.dispatch()({
            type: "UPDATE_TASK",
            taskId: runId,
            patch: { status: "running" },
          });
        }
        break;
      }

      case "delta": {
        const delta = p.delta || p.content || "";
        if (delta) {
          // Append to streaming message
          refs.dispatch()({
            type: "APPEND_DELTA",
            runId,
            delta,
            actorName,
          });

          // Show bubble
          emitBubble(runId, delta, refs);
        }
        break;
      }

      case "tool_start": {
        const toolName = p.toolName || "tool";
        
        // Add tool message
        refs.dispatch()({
          type: "APPEND_CHAT",
          message: {
            id: chatId(),
            runId,
            role: "tool",
            content: `Using ${toolName}...`,
            toolName,
            toolInput: p.toolInput,
            timestamp: new Date().toISOString(),
            sessionKey,
            actorName,
          } as ChatMessage,
        });

        // Show bubble
        emitBubble(runId, `[${toolName}]`, refs, 3000);
        break;
      }

      case "tool_end": {
        const toolName = p.toolName || "tool";
        
        // Update tool message with result
        if (p.toolOutput) {
          refs.dispatch()({
            type: "APPEND_CHAT",
            message: {
              id: chatId(),
              runId,
              role: "tool",
              content: `${toolName} completed`,
              toolName,
              toolOutput: p.toolOutput,
              timestamp: new Date().toISOString(),
              sessionKey,
              actorName,
            } as ChatMessage,
          });
        }
        break;
      }

      case "end": {
        // Finalize streaming message
        const content = p.content || "";
        refs.dispatch()({
          type: "FINALIZE_ASSISTANT",
          runId,
          content,
          actorName,
        });

        // Update task status
        refs.dispatch()({
          type: "UPDATE_TASK",
          taskId: runId,
          patch: { 
            status: "completed", 
            result: content,
            completedAt: new Date().toISOString(),
          },
        });

        // Update session metrics
        if (p.usage || p.model) {
          refs.dispatch()({
            type: "SET_SESSION_METRICS",
            metrics: {
              usedTokens: p.usage?.totalTokens,
              inputTokens: p.usage?.inputTokens,
              outputTokens: p.usage?.outputTokens,
              model: p.model,
              provider: p.provider,
              fresh: true,
              updatedAt: new Date().toISOString(),
            },
          });
        }

        // Emit completion event
        gameEvents.emit("task-completed", runId);

        // Clear bubble state
        refs.bubbleAccum.delete(runId);
        refs.seenStarts.delete(runId);
        break;
      }

      case "error": {
        const errorMsg = p.error || "Unknown error";
        
        refs.dispatch()({
          type: "APPEND_CHAT",
          message: {
            id: chatId(),
            runId,
            role: "system",
            content: `Error: ${errorMsg}`,
            timestamp: new Date().toISOString(),
            sessionKey,
          },
        });

        refs.dispatch()({
          type: "UPDATE_TASK",
          taskId: runId,
          patch: { 
            status: "failed", 
            result: errorMsg,
            completedAt: new Date().toISOString(),
          },
        });

        gameEvents.emit("task-failed", runId);
        
        refs.bubbleAccum.delete(runId);
        refs.seenStarts.delete(runId);
        break;
      }
    }
  });

  // Chat events - direct messages
  client.on("chat", (payload: unknown) => {
    const p = payload as ChatEventPayload;
    const { runId, role, content } = p;
    if (!runId || !role || !content) return;

    const task = findTask(refs.tasks(), runId);
    const sessionKey = task?.sessionKey ?? refs.activeSessionKey() ?? MAIN_SESSION_KEY;
    const actorName = refs.runActors.get(runId);

    refs.dispatch()({
      type: "APPEND_CHAT",
      message: {
        id: chatId(),
        runId,
        role,
        content,
        toolName: p.toolName,
        toolInput: p.toolInput,
        toolOutput: p.toolOutput,
        timestamp: p.timestamp || new Date().toISOString(),
        sessionKey,
        actorName,
      } as ChatMessage,
    });
  });

  // Session events
  client.on("session", (payload: unknown) => {
    const p = payload as SessionEventPayload;
    if (p.metrics) {
      refs.dispatch()({
        type: "SET_SESSION_METRICS",
        metrics: p.metrics,
      });
    }
  });

  // Handle final responses for long-running requests
  client.onFinalResponse((frame: unknown) => {
    const f = frame as GatewayFrame;
    if (!f.ok) {
      const runId = (f.payload as { runId?: string })?.runId;
      if (runId) {
        gameEvents.emit("task-failed", runId);
      }
    }
  });

  // Sub-agent events
  client.on("subagent", (payload: unknown) => {
    const p = payload as { parentRunId?: string; runId?: string; label?: string };
    if (p.parentRunId && p.runId && p.label) {
      gameEvents.emit("subagent-assigned", p.runId, p.parentRunId, p.label);
      refs.runActors.set(p.runId, p.label);
    }
  });
}

// ── Session Preview Loader ──────────────────────────────────────────────

export async function loadSessionPreview(
  client: GatewayClient,
  sessionKey: string,
): Promise<ChatMessage[]> {
  if (client.status !== "connected") return [];

  try {
    const res = await client.request("sessions.preview", {
      keys: [sessionKey],
      limit: 50,
    });

    const messages = (res.payload as { messages?: ChatMessage[] })?.messages || [];
    return messages.map((msg) => ({
      ...msg,
      sessionKey,
    }));
  } catch (err) {
    console.error("[Gateway] sessions.preview failed:", err);
    return [];
  }
}

// ── Model Selection ─────────────────────────────────────────────────────

export async function setModel(
  client: GatewayClient,
  modelId: string,
): Promise<boolean> {
  if (client.status !== "connected") return false;

  try {
    await client.request("model.set", { modelId });
    return true;
  } catch (err) {
    console.error("[Gateway] model.set failed:", err);
    return false;
  }
}

export async function getAvailableModels(
  client: GatewayClient,
): Promise<ModelChoice[]> {
  if (client.status !== "connected") return [];

  try {
    const res = await client.request("models.list", {});
    return (res.payload as { models?: ModelChoice[] })?.models || [];
  } catch (err) {
    console.error("[Gateway] models.list failed:", err);
    return [];
  }
}
