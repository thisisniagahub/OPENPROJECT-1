"use client";

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useRef,
  useEffect,
  type Dispatch,
  type ReactNode,
} from "react";
import React from "react";
import type { SeatState, TaskItem, GatewayConfig } from "@/types/game";
import type { StudioSnapshot } from "@/types/game";
import { GatewayClient } from "./gateway";
import {
  cancelTask as cancelGatewayTask,
  getAvailableModels as getGatewayModels,
  setModel as setGatewayModel,
  wireGatewayClient,
} from "./gateway-handler";
import type { ModelChoice } from "./gateway-types";
import { gameEvents } from "./events";
import { getGatewayUrl, getGatewayToken } from "./env";
import {
  type PersistedSeatConfig,
  loadGatewayConfig,
  saveGatewayConfig,
  loadActiveSessionKey,
  saveActiveSessionKey,
  loadTasks,
  loadChat,
  loadSessions,
  loadSeatConfigs,
  saveTasks,
  saveChat,
  saveSessions,
  saveSeatConfigs,
} from "./persistence";
import {
  type Action,
  reducer,
  initialState,
  chatId,
  findTask,
  generateSessionKey,
  resolveSeatLabelForTask,
  mergeDiscoveredSeats,
  MAIN_SESSION_KEY,
  createEmptySessionMetrics,
} from "./reducer";

// ── Context ────────────────────────────────────────────

interface StudioContextValue {
  state: StudioSnapshot;
  connect: (config?: GatewayConfig) => void;
  disconnect: () => void;
  assignTask: (message: string, seatId?: string) => void;
  fetchModels: () => Promise<ModelChoice[]>;
  selectModel: (modelId: string) => Promise<boolean>;
  updateSeatConfig: (seatId: string, patch: Partial<SeatState>) => void;
  newSession: () => void;
  switchSession: (sessionKey: string) => void;
}

const StudioContext = createContext<StudioContextValue | null>(null);

export function useStudio(): StudioContextValue {
  const ctx = useContext(StudioContext);
  if (!ctx) throw new Error("useStudio must be used within StudioProvider");
  return ctx;
}

// ── Provider ───────────────────────────────────────────

const DEFAULT_URL = getGatewayUrl();
const DEFAULT_TOKEN = getGatewayToken();

export interface SeatRoutingTarget {
  seatId?: string;
  actorName?: string;
  agentId?: string;
  openclawId?: string;
}

export const USER_FACING_COMMANDER_LABEL = "NiagaBot";

export function buildNiagaBotSessionKey(): string {
  return MAIN_SESSION_KEY;
}

export function buildDelegationMessage(
  message: string,
  routingTarget?: SeatRoutingTarget,
): string {
  const trimmed = message.trim();
  if (!trimmed) return trimmed;

  if (!routingTarget?.seatId) {
    return trimmed;
  }

  const lines = [
    "<operator_dispatch>",
    "entry_agent: main",
    `seat_id: ${routingTarget.seatId}`,
  ];

  if (routingTarget.actorName) {
    lines.push(`preferred_specialist_label: ${routingTarget.actorName}`);
  }

  if (routingTarget.agentId) {
    lines.push(`preferred_visual_agent_id: ${routingTarget.agentId}`);
  }

  if (routingTarget.openclawId) {
    lines.push(`preferred_openclaw_id: ${routingTarget.openclawId}`);
    lines.push("instruction: Keep NiagaBot as the sole user-facing coordinator and delegate internally if appropriate.");
  } else {
    lines.push("instruction: No mapped OpenClaw specialist is attached to this seat. Handle directly unless a better internal delegate is obvious.");
  }

  lines.push("</operator_dispatch>", "", "<user_request>", trimmed, "</user_request>");
  return lines.join("\n");
}

export function resolveSeatRoutingTarget(
  seats: SeatState[],
  seatId?: string,
): SeatRoutingTarget {
  const seat = seatId
    ? seats.find((candidate) => candidate.seatId === seatId)
    : undefined;

  return {
    seatId: seat?.seatId ?? seatId,
    actorName: seat?.label ?? resolveSeatLabelForTask(seats, seatId),
    agentId: seat?.agentId,
    openclawId: seat?.openclawId,
  };
}

export function canAutoConnectGateway(
  config: GatewayConfig | null | undefined,
): boolean {
  return Boolean(config?.url && !config.requiresToken);
}

export function StudioProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const dispatchRef = useRef<Dispatch<Action>>(dispatch);
  dispatchRef.current = dispatch;
  const tasksRef = useRef<TaskItem[]>(state.tasks);
  tasksRef.current = state.tasks;
  const seatsRef = useRef<SeatState[]>(state.seats);
  seatsRef.current = state.seats;
  const seatConfigRef = useRef<PersistedSeatConfig[]>([]);

  const clientRef = useRef<GatewayClient | null>(null);
  const configRef = useRef<GatewayConfig>({ url: DEFAULT_URL, token: DEFAULT_TOKEN });
  const activeSessionKeyRef = useRef<string | undefined>(undefined);
  const taskCounterRef = useRef(0);
  const sessionMetricsRef = useRef(state.sessionMetrics);
  sessionMetricsRef.current = state.sessionMetrics;
  const pendingTaskMessagesRef = useRef<Map<string, string>>(new Map());

  // Gateway handler refs
  const seenStartsRef = useRef<Set<string>>(new Set());
  const bubbleAccumRef = useRef<Map<string, string>>(new Map());
  const bubbleThrottleTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const runActorsRef = useRef<Map<string, string>>(new Map());
  const modelCatalogRef = useRef<{ current: ModelChoice[] | null }>({ current: null });
  const sessionRefreshTimerRef = useRef<{ current: ReturnType<typeof setTimeout> | null }>({ current: null });

  const setActiveSessionKey = useCallback((sessionKey?: string) => {
    activeSessionKeyRef.current = sessionKey;
    dispatchRef.current({ type: "SET_ACTIVE_SESSION", sessionKey });
  }, []);

  // ── Connect implementation ──

  const connectImpl = useCallback((cfg: GatewayConfig) => {
    if (clientRef.current) {
      clientRef.current.disconnect();
    }

    configRef.current = cfg;

    const client = new GatewayClient(cfg.url, cfg.token);
    clientRef.current = client;

    // Wire gateway client to store
    const handlerRefs: import("./gateway-handler").HandlerRefs = {
      dispatch: () => (action: unknown) => dispatchRef.current(action as Action),
      tasks: () => tasksRef.current,
      seats: () => seatsRef.current,
      activeSessionKey: () => activeSessionKeyRef.current,
      setActiveSessionKey,
      seenStarts: seenStartsRef.current,
      bubbleAccum: bubbleAccumRef.current,
      bubbleThrottleTimers: bubbleThrottleTimersRef.current,
      runActors: runActorsRef.current,
      modelCatalog: modelCatalogRef.current,
      sessionRefreshTimer: sessionRefreshTimerRef.current,
      taskCounter: taskCounterRef,
    };
    wireGatewayClient(client, handlerRefs);

    client
      .connect()
      .then(() => {
        saveGatewayConfig(cfg);
        dispatchRef.current({
          type: "APPEND_CHAT",
          message: {
            id: chatId(), runId: "", role: "system",
            content: `Connected to ${cfg.url}`,
            timestamp: new Date().toISOString(),
            sessionKey: activeSessionKeyRef.current ?? MAIN_SESSION_KEY,
          },
        });
      })
      .catch((err) => {
        console.warn("[Gateway] connect failed:", err.message);
        dispatchRef.current({ type: "SET_CONNECTION", status: "error" });
        dispatchRef.current({
          type: "APPEND_CHAT",
          message: {
            id: chatId(), runId: "", role: "system",
            content: `Connection failed: ${err.message}`,
            timestamp: new Date().toISOString(),
            sessionKey: activeSessionKeyRef.current ?? MAIN_SESSION_KEY,
          },
        });
      });
  }, [setActiveSessionKey]);

  // ── Bootstrap: restore state + auto-connect ──

  useEffect(() => {
    const savedConfig = loadGatewayConfig();
    if (savedConfig) configRef.current = savedConfig;

    const savedActiveKey = loadActiveSessionKey();
    const fallbackSessionKey = savedActiveKey ?? MAIN_SESSION_KEY;
    const tasks = loadTasks(fallbackSessionKey);
    const chat = loadChat(fallbackSessionKey);
    const sessions = loadSessions();
    const seatConfigs = loadSeatConfigs();
    seatConfigRef.current = seatConfigs;
    if (savedActiveKey) {
      activeSessionKeyRef.current = savedActiveKey;
    }
    if (tasks.length > 0 || chat.length > 0 || sessions.length > 0) {
      dispatch({ type: "RESTORE", tasks, chatMessages: chat, sessions });
    }
    if (savedActiveKey) {
      dispatch({ type: "SET_ACTIVE_SESSION", sessionKey: savedActiveKey });
    }

    const unsubSeats = gameEvents.on("seats-discovered", (discovered) => {
      const mergedSeats = mergeDiscoveredSeats(
        discovered,
        seatConfigRef.current,
        seatsRef.current
      );
      dispatchRef.current({ type: "SYNC_SEATS", seats: mergedSeats });
    });

    const unsubTaskRouted = gameEvents.on("task-routed", (taskId, seatId, actorName) => {
      dispatchRef.current({
        type: "UPDATE_TASK",
        taskId,
        patch: { seatId, actorName },
      });
    });

    const unsubTaskStaged = gameEvents.on("task-staged", (taskId, stage, seatId) => {
      dispatchRef.current({
        type: "UPDATE_TASK",
        taskId,
        patch: { status: stage, seatId },
      });

      if (stage === "returning" && seatId) {
        dispatchRef.current({
          type: "ASSIGN_SEAT",
          runId: taskId,
          taskSnippet: pendingTaskMessagesRef.current.get(taskId) ?? "Working...",
          seatId,
        });
      }
    });

    const unsubTaskBound = gameEvents.on("task-bound", (taskId, runId) => {
      dispatchRef.current({ type: "BIND_SEAT_RUN", taskId, runId });
      dispatchRef.current({
        type: "UPDATE_TASK",
        taskId,
        patch: { runId },
      });

      const actorName = runActorsRef.current.get(taskId);
      if (actorName) {
        runActorsRef.current.delete(taskId);
        runActorsRef.current.set(runId, actorName);
        dispatchRef.current({ type: "SET_RUN_ACTOR", runId, actorName });
      }

      const pendingMessage = pendingTaskMessagesRef.current.get(taskId);
      if (pendingMessage) {
        pendingTaskMessagesRef.current.delete(taskId);
        pendingTaskMessagesRef.current.set(runId, pendingMessage);
      }
    });

    const unsubTaskReady = gameEvents.on("task-ready", async (taskId, message, seatId) => {
      const client = clientRef.current;
      const task = findTask(tasksRef.current, taskId);
      const sessionKey = task?.sessionKey ?? activeSessionKeyRef.current ?? MAIN_SESSION_KEY;

      if (seatId) {
        dispatchRef.current({
          type: "ASSIGN_SEAT",
          runId: taskId,
          taskSnippet: pendingTaskMessagesRef.current.get(taskId) ?? message,
          seatId,
        });
      }

      if (!client || client.status !== "connected") {
        const timestamp = new Date().toISOString();
        dispatchRef.current({
          type: "UPDATE_TASK",
          taskId,
          patch: {
            status: "failed",
            result: "Gateway is not connected",
            completedAt: timestamp,
          },
        });
        dispatchRef.current({
          type: "APPEND_CHAT",
          message: {
            id: chatId(),
            runId: taskId,
            role: "system",
            content: "Task failed: gateway is not connected.",
            timestamp,
            sessionKey,
          },
        });
        gameEvents.emit("task-failed", taskId);
        return;
      }

      try {
        const gatewaySessionKey = task?.gatewaySessionKey ?? sessionKey;
        const routedSeatId = task?.seatId ?? seatId;
        const routingTarget: SeatRoutingTarget = {
          seatId: routedSeatId,
          actorName: task?.actorName,
          agentId: task?.agentId,
          openclawId: task?.openclawId,
        };
        const outboundMessage = buildDelegationMessage(message, routingTarget);

        if (routedSeatId && task?.openclawId) {
          dispatchRef.current({
            type: "APPEND_CHAT",
            message: {
              id: chatId(),
              runId: taskId,
              role: "system",
              content: `NiagaBot will coordinate this request and may delegate it to ${task?.actorName ?? task.openclawId} (${task.openclawId}).`,
              timestamp: new Date().toISOString(),
              sessionKey,
            },
          });
        } else if (routedSeatId && !task?.openclawId) {
          dispatchRef.current({
            type: "APPEND_CHAT",
            message: {
              id: chatId(),
              runId: taskId,
              role: "system",
              content: `Seat ${task?.actorName ?? routedSeatId} has no OpenClaw mapping. NiagaBot will handle it directly in the current session.`,
              timestamp: new Date().toISOString(),
              sessionKey,
            },
          });
        }

        const res = await client.sendChat(outboundMessage, gatewaySessionKey);
        const payload = res.payload as { runId?: string; status?: string } | undefined;
        const runId = payload?.runId;

        if (runId && runId !== taskId) {
          gameEvents.emit("task-bound", taskId, runId);
        }

        dispatchRef.current({
          type: "UPDATE_TASK",
          taskId,
          patch: {
            runId: runId ?? task?.runId,
            seatId: routedSeatId,
            status: payload?.status === "running" ? "running" : "queued",
          },
        });
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to send task");
        const timestamp = new Date().toISOString();
        dispatchRef.current({
          type: "UPDATE_TASK",
          taskId,
          patch: {
            status: "failed",
            result: error.message,
            completedAt: timestamp,
          },
        });
        dispatchRef.current({
          type: "APPEND_CHAT",
          message: {
            id: chatId(),
            runId: taskId,
            role: "system",
            content: `Task failed: ${error.message}`,
            timestamp,
            sessionKey,
          },
        });
        gameEvents.emit("task-failed", taskId);
      }
    });

    const unsubTaskAborted = gameEvents.on("task-aborted", (runId) => {
      dispatchRef.current({
        type: "UPDATE_TASK",
        taskId: runId,
        patch: {
          status: "stopped",
          completedAt: new Date().toISOString(),
        },
      });
      dispatchRef.current({ type: "SET_SEAT_STATUS", runId, status: "empty" });
      runActorsRef.current.delete(runId);
      pendingTaskMessagesRef.current.delete(runId);
    });

    const unsubTaskCompleted = gameEvents.on("task-completed", (runId) => {
      dispatchRef.current({ type: "SET_SEAT_STATUS", runId, status: "empty" });
      runActorsRef.current.delete(runId);
      pendingTaskMessagesRef.current.delete(runId);
    });

    const unsubTaskFailed = gameEvents.on("task-failed", (runId) => {
      dispatchRef.current({ type: "SET_SEAT_STATUS", runId, status: "empty" });
      runActorsRef.current.delete(runId);
      pendingTaskMessagesRef.current.delete(runId);
    });

    const unsubStopTask = gameEvents.on("stop-task", async (runId) => {
      const client = clientRef.current;
      if (!client || client.status !== "connected") return;
      const stopped = await cancelGatewayTask(client, runId);
      if (stopped) {
        gameEvents.emit("task-aborted", runId);
      }
    });

    let autoConnectTimer: ReturnType<typeof setTimeout> | null = null;
    if (canAutoConnectGateway(savedConfig)) {
      autoConnectTimer = setTimeout(() => connectImpl(savedConfig!), 80);
    }

    return () => {
      if (autoConnectTimer) clearTimeout(autoConnectTimer);
      unsubSeats();
      unsubTaskRouted();
      unsubTaskStaged();
      unsubTaskBound();
      unsubTaskReady();
      unsubTaskAborted();
      unsubTaskCompleted();
      unsubTaskFailed();
      unsubStopTask();
    };
  }, []);

  // ── Persist tasks + chat + sessions ──

  useEffect(() => {
    saveTasks(state.tasks);
    saveChat(state.chatMessages);
    saveSessions(state.sessions);
  }, [state.tasks, state.chatMessages, state.sessions]);

  useEffect(() => {
    const configs: PersistedSeatConfig[] = state.seats.map((seat) => ({
      seatId: seat.seatId,
      label: seat.label,
      roleTitle: seat.roleTitle,
      assigned: seat.assigned,
      agentId: seat.agentId,
      openclawId: seat.openclawId,
      spriteKey: seat.spriteKey,
      spritePath: seat.spritePath,
    }));
    seatConfigRef.current = configs;
    saveSeatConfigs(configs);
    gameEvents.emit("seat-configs-updated", state.seats);
  }, [state.seats]);

  // ── Cleanup ──

  useEffect(() => {
    return () => {
      clientRef.current?.disconnect();
    };
  }, []);

  // ── Public API ──

  const connect = useCallback(
    (config?: GatewayConfig) => {
      connectImpl(config ?? configRef.current);
    },
    [connectImpl],
  );

  const disconnect = useCallback(() => {
    clientRef.current?.disconnect();
    clientRef.current = null;
    pendingTaskMessagesRef.current.clear();
    runActorsRef.current.clear();
    setActiveSessionKey(undefined);
    dispatchRef.current({ type: "SET_SESSION_METRICS", metrics: createEmptySessionMetrics() });
  }, [setActiveSessionKey]);

  const updateSeatConfig = useCallback((seatId: string, patch: Partial<SeatState>) => {
    dispatchRef.current({ type: "UPDATE_SEAT_CONFIG", seatId, patch });
  }, []);

  const assignTask = useCallback((message: string, seatId?: string) => {
    const client = clientRef.current;
    if (!client || client.status !== "connected") return;

    const taskId = `aw_task_${++taskCounterRef.current}_${Date.now()}`;
    const sessionKey = activeSessionKeyRef.current ?? buildNiagaBotSessionKey();
    const routingTarget = resolveSeatRoutingTarget(seatsRef.current, seatId);
    pendingTaskMessagesRef.current.set(taskId, message);
    runActorsRef.current.set(taskId, USER_FACING_COMMANDER_LABEL);

    dispatchRef.current({
      type: "ADD_TASK",
      task: {
        taskId,
        message,
        status: "submitted",
        sessionKey,
        gatewaySessionKey: sessionKey,
        seatId: routingTarget.seatId,
        actorName: routingTarget.actorName,
        agentId: routingTarget.agentId,
        openclawId: routingTarget.openclawId,
        createdAt: new Date().toISOString(),
      },
    });
    dispatchRef.current({
      type: "APPEND_CHAT",
      message: { id: chatId(), runId: taskId, role: "user", content: message, timestamp: new Date().toISOString(), sessionKey },
    });
    gameEvents.emit("task-assigned", taskId, message, seatId);
  }, []);

  const fetchModels = useCallback(async () => {
    const client = clientRef.current;
    if (!client) return modelCatalogRef.current.current ?? [];

    const models = await getGatewayModels(client);
    if (models.length > 0) {
      modelCatalogRef.current.current = models;
    }
    return models.length > 0 ? models : modelCatalogRef.current.current ?? [];
  }, []);

  const selectModel = useCallback(async (modelId: string) => {
    const client = clientRef.current;
    if (!client) return false;

    const ok = await setGatewayModel(client, modelId);
    if (ok) {
      dispatchRef.current({
        type: "SET_SESSION_METRICS",
        metrics: {
          ...sessionMetricsRef.current,
          model: modelId,
          updatedAt: new Date().toISOString(),
        },
      });
    }
    return ok;
  }, []);

  const newSession = useCallback(() => {
    const newKey = generateSessionKey();
    const record = {
      key: newKey,
      label: `Session ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
      createdAt: new Date().toISOString(),
    };

    dispatchRef.current({ type: "NEW_SESSION", session: record });
    activeSessionKeyRef.current = newKey;
    saveActiveSessionKey(newKey);
  }, []);

  const switchSession = useCallback(async (sessionKey: string) => {
    if (sessionKey === activeSessionKeyRef.current) return;

    saveActiveSessionKey(sessionKey);
    dispatchRef.current({ type: "SWITCH_SESSION", sessionKey });
    activeSessionKeyRef.current = sessionKey;
  }, []);

  return React.createElement(
    StudioContext.Provider,
    {
      value: {
        state,
        connect,
        disconnect,
        assignTask,
        fetchModels,
        selectModel,
        updateSeatConfig,
        newSession,
        switchSession,
      },
    },
    children,
  );
}
