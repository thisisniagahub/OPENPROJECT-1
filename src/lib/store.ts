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
import { gameEvents } from "./events";
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

const DEFAULT_URL = typeof window !== "undefined" 
  ? (process.env.NEXT_PUBLIC_GATEWAY_URL || "ws://127.0.0.1:18789/")
  : "ws://127.0.0.1:18789/";
const DEFAULT_TOKEN = process.env.NEXT_PUBLIC_GATEWAY_TOKEN ?? "";

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

    client.onStatus((status) => {
      dispatchRef.current({ type: "SET_CONNECTION", status });
    });

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
  }, []);

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

    const unsubSeats = gameEvents.on("seats-discovered", (discovered: unknown[]) => {
      const mergedSeats = mergeDiscoveredSeats(
        discovered as Parameters<typeof mergeDiscoveredSeats>[0],
        seatConfigRef.current,
        seatsRef.current
      );
      dispatchRef.current({ type: "SYNC_SEATS", seats: mergedSeats });
    });

    if (savedConfig?.url) {
      const t = setTimeout(() => connectImpl(savedConfig), 80);
      return () => {
        clearTimeout(t);
        unsubSeats();
      };
    }
    return unsubSeats;
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    const sessionKey = activeSessionKeyRef.current ?? MAIN_SESSION_KEY;
    const actorName = seatId ? resolveSeatLabelForTask(seatsRef.current, seatId) : undefined;

    dispatchRef.current({
      type: "ADD_TASK",
      task: { taskId, message, status: "submitted", sessionKey, seatId, actorName, createdAt: new Date().toISOString() },
    });
    dispatchRef.current({
      type: "APPEND_CHAT",
      message: { id: chatId(), runId: taskId, role: "user", content: message, timestamp: new Date().toISOString(), sessionKey },
    });
    gameEvents.emit("task-assigned", taskId, message, seatId);
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
    { value: { state, connect, disconnect, assignTask, updateSeatConfig, newSession, switchSession } },
    children,
  );
}
