/**
 * Gateway event handler — wires GatewayClient events to store dispatch.
 * Full implementation for OpenClaw integration with type safety.
 */

import { gameEvents } from "./events";
import type { GatewayClient } from "./gateway";
import type { GatewayFrame } from "./gateway-types";
import type { ChatMessage, TaskItem, SessionMetrics } from "@/types/game";
import { chatId, findTask, MAIN_SESSION_KEY } from "./reducer";
import { isDebugEnabled } from "./env";

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

// ── Type Guards ────────────────────────────────────────────────────────

function isAgentEventPayload(payload: unknown): payload is AgentEventPayload {
  if (typeof payload !== "object" || payload === null) return false;
  const p = payload as Record<string, unknown>;
  return typeof p["runId"] === "string" && typeof p["type"] === "string";
}

function isChatEventPayload(payload: unknown): payload is ChatEventPayload {
  if (typeof payload !== "object" || payload === null) return false;
  const p = payload as Record<string, unknown>;
  return typeof p["runId"] === "string" && 
         typeof p["role"] === "string" && 
         typeof p["content"] === "string";
}

function isSessionEventPayload(payload: unknown): payload is SessionEventPayload {
  if (typeof payload !== "object" || payload === null) return false;
  const p = payload as Record<string, unknown>;
  return typeof p["sessionKey"] === "string";
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

function safeDispatch(refs: HandlerRefs, action: unknown) {
  try {
    refs.dispatch()(action);
  } catch (err) {
    if (isDebugEnabled()) {
      console.error("[GatewayHandler] Dispatch error:", err);
    }
  }
}

// ── Main Wire Function ──────────────────────────────────────────────────

export function wireGatewayClient(client: GatewayClient, refs: HandlerRefs) {
  const debug = isDebugEnabled();

  // Connection status
  client.onStatus((status) => {
    safeDispatch(refs, { type: "SET_CONNECTION", status });
    
    if (status === "connected") {
      // Request model catalog on connect
      client.request("models.list", {}).then((res) => {
        const payload = res.payload as { models?: ModelChoice[] } | undefined;
        const models = payload?.models || [];
        refs.modelCatalog.current = models;
        
        if (debug) {
          console.log(`[GatewayHandler] Loaded ${models.length} models`);
        }
      }).catch((err) => {
        if (debug) {
          console.warn("[GatewayHandler] Failed to load models:", err.message);
        }
      });
    }
  });

  // Agent events - main execution stream
  client.on("agent", (payload: unknown) => {
    if (!isAgentEventPayload(payload)) {
      if (debug) {
        console.warn("[GatewayHandler] Invalid agent event payload:", payload);
      }
      return;
    }

    const { runId, type } = payload;
    const task = findTask(refs.tasks(), runId);
    const sessionKey = task?.sessionKey ?? refs.activeSessionKey() ?? MAIN_SESSION_KEY;
    const actorName = refs.runActors.get(runId);

    if (debug) {
      console.log(`[GatewayHandler] Agent event: ${type} for ${runId}`);
    }

    switch (type) {
      case "start": {
        // Track start events to detect new runs
        if (!refs.seenStarts.has(runId)) {
          refs.seenStarts.add(runId);
          
          // Update task status
          safeDispatch(refs, {
            type: "UPDATE_TASK",
            taskId: runId,
            patch: { status: "running" },
          });

          // Show bubble
          emitBubble(runId, "Starting...", refs, 2000);
        }
        break;
      }

      case "delta": {
        const delta = payload.delta || payload.content || "";
        if (delta) {
          // Append to streaming message
          safeDispatch(refs, {
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
        const toolName = payload.toolName || "tool";
        
        // Add tool message
        safeDispatch(refs, {
          type: "APPEND_CHAT",
          message: {
            id: chatId(),
            runId,
            role: "tool",
            content: `Using ${toolName}...`,
            toolName,
            toolInput: payload.toolInput,
            timestamp: new Date().toISOString(),
            sessionKey,
            actorName,
          } as ChatMessage,
        });

        // Show bubble
        emitBubble(runId, `[${toolName}]`, refs, 3000);
        break;
      }

      case "tool_delta": {
        const delta = payload.delta || payload.content || "";
        if (delta) {
          emitBubble(runId, delta, refs);
        }
        break;
      }

      case "tool_end": {
        const toolName = payload.toolName || "tool";
        
        // Update tool message with result
        if (payload.toolOutput) {
          safeDispatch(refs, {
            type: "APPEND_CHAT",
            message: {
              id: chatId(),
              runId,
              role: "tool",
              content: `${toolName} completed`,
              toolName,
              toolOutput: payload.toolOutput,
              timestamp: new Date().toISOString(),
              sessionKey,
              actorName,
            } as ChatMessage,
          });
        }

        emitBubble(runId, `✓ ${toolName}`, refs, 2000);
        break;
      }

      case "end": {
        // Finalize streaming message
        const content = payload.content || "";
        safeDispatch(refs, {
          type: "FINALIZE_ASSISTANT",
          runId,
          content,
          actorName,
        });

        // Update task status
        safeDispatch(refs, {
          type: "UPDATE_TASK",
          taskId: runId,
          patch: { 
            status: "completed", 
            result: content,
            completedAt: new Date().toISOString(),
          },
        });

        // Update session metrics
        if (payload.usage || payload.model) {
          safeDispatch(refs, {
            type: "SET_SESSION_METRICS",
            metrics: {
              usedTokens: payload.usage?.totalTokens,
              inputTokens: payload.usage?.inputTokens,
              outputTokens: payload.usage?.outputTokens,
              model: payload.model,
              provider: payload.provider,
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
        refs.runActors.delete(runId);
        break;
      }

      case "error": {
        const errorMsg = payload.error || "Unknown error";
        
        safeDispatch(refs, {
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

        safeDispatch(refs, {
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
        refs.runActors.delete(runId);
        break;
      }
    }
  });

  // Chat events - direct messages
  client.on("chat", (payload: unknown) => {
    if (!isChatEventPayload(payload)) {
      if (debug) {
        console.warn("[GatewayHandler] Invalid chat event payload:", payload);
      }
      return;
    }

    const { runId, role, content } = payload;
    const task = findTask(refs.tasks(), runId);
    const sessionKey = task?.sessionKey ?? refs.activeSessionKey() ?? MAIN_SESSION_KEY;
    const actorName = refs.runActors.get(runId);

    safeDispatch(refs, {
      type: "APPEND_CHAT",
      message: {
        id: chatId(),
        runId,
        role,
        content,
        toolName: payload.toolName,
        toolInput: payload.toolInput,
        toolOutput: payload.toolOutput,
        timestamp: payload.timestamp || new Date().toISOString(),
        sessionKey,
        actorName,
      } as ChatMessage,
    });
  });

  // Session events
  client.on("session", (payload: unknown) => {
    if (!isSessionEventPayload(payload)) {
      if (debug) {
        console.warn("[GatewayHandler] Invalid session event payload:", payload);
      }
      return;
    }

    if (payload.metrics) {
      safeDispatch(refs, {
        type: "SET_SESSION_METRICS",
        metrics: payload.metrics,
      });
    }
  });

  // Handle final responses for long-running requests
  client.onFinalResponse((frame: unknown) => {
    const f = frame as GatewayFrame;
    if (!f.ok) {
      const payload = f.payload as { runId?: string } | undefined;
      const runId = payload?.runId;
      if (runId) {
        gameEvents.emit("task-failed", runId);
      }
    }
  });

  // Sub-agent events
  client.on("subagent", (payload: unknown) => {
    const p = payload as { parentRunId?: string; runId?: string; label?: string } | null;
    if (p?.parentRunId && p.runId && p.label) {
      gameEvents.emit("subagent-assigned", p.runId, p.parentRunId, p.label);
      refs.runActors.set(p.runId, p.label);
      
      if (debug) {
        console.log(`[GatewayHandler] Sub-agent assigned: ${p.label} (${p.runId})`);
      }
    }
  });

  // Connection state events
  client.on("connect.state", (payload: unknown) => {
    const p = payload as { state?: string; reason?: string } | null;
    if (debug) {
      console.log(`[GatewayHandler] Connect state: ${p?.state} - ${p?.reason}`);
    }
  });

  if (debug) {
    console.log("[GatewayHandler] Wired all event handlers");
  }
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

    const payload = res.payload as { messages?: ChatMessage[] } | undefined;
    const messages = payload?.messages || [];
    return messages.map((msg) => ({
      ...msg,
      sessionKey,
    }));
  } catch (err) {
    const error = err as Error;
    if (isDebugEnabled()) {
      console.error("[Gateway] sessions.preview failed:", error.message);
    }
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
    const error = err as Error;
    if (isDebugEnabled()) {
      console.error("[Gateway] model.set failed:", error.message);
    }
    return false;
  }
}

export async function getAvailableModels(
  client: GatewayClient,
): Promise<ModelChoice[]> {
  if (client.status !== "connected") return [];

  try {
    const res = await client.request("models.list", {});
    const payload = res.payload as { models?: ModelChoice[] } | undefined;
    return payload?.models || [];
  } catch (err) {
    const error = err as Error;
    if (isDebugEnabled()) {
      console.error("[Gateway] models.list failed:", error.message);
    }
    return [];
  }
}

// ── Task Operations ─────────────────────────────────────────────────────

export async function cancelTask(
  client: GatewayClient,
  runId: string,
): Promise<boolean> {
  if (client.status !== "connected") return false;

  try {
    await client.request("task.cancel", { runId });
    return true;
  } catch (err) {
    const error = err as Error;
    if (isDebugEnabled()) {
      console.error("[Gateway] task.cancel failed:", error.message);
    }
    return false;
  }
}

export async function getTaskStatus(
  client: GatewayClient,
  runId: string,
): Promise<{ status: string; progress?: number } | null> {
  if (client.status !== "connected") return null;

  try {
    const res = await client.request("task.status", { runId });
    const payload = res.payload as { status?: string; progress?: number } | undefined;
    return payload ?? null;
  } catch (err) {
    const error = err as Error;
    if (isDebugEnabled()) {
      console.error("[Gateway] task.status failed:", error.message);
    }
    return null;
  }
}
