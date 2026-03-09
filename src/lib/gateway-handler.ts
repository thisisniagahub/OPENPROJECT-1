/**
 * Gateway event handler — wires GatewayClient events to store dispatch.
 * Simplified version for the merged project.
 */

import type { GatewayClient } from "./gateway";
import type { GatewayFrame } from "./gateway-types";

export interface ModelChoice {
  id: string;
  provider: string;
  contextWindow?: number;
}

export interface HandlerRefs {
  dispatch: () => (action: unknown) => void;
  tasks: () => unknown[];
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

export function wireGatewayClient(client: GatewayClient, refs: HandlerRefs) {
  client.onStatus((status) => {
    refs.dispatch()({ type: "SET_CONNECTION", status });
  });

  client.on("agent", (payload: unknown) => {
    const p = payload as Record<string, unknown>;
    const runId = p.runId as string | undefined;
    if (!runId) return;
    
    // Handle agent events
    console.log("[Gateway] agent event:", runId, p);
  });

  client.on("chat", (payload: unknown) => {
    const p = payload as Record<string, unknown>;
    const runId = p.runId as string | undefined;
    if (!runId) return;
    
    // Handle chat events
    console.log("[Gateway] chat event:", runId, p);
  });

  client.onFinalResponse((frame: unknown) => {
    const f = frame as GatewayFrame;
    console.log("[Gateway] final response:", f);
  });
}

export async function loadSessionPreview(
  client: GatewayClient,
  sessionKey: string,
): Promise<unknown[]> {
  if (client.status !== "connected") return [];
  
  try {
    const res = await client.request("sessions.preview", {
      keys: [sessionKey],
      limit: 50,
    });
    console.log("[Gateway] session preview:", res);
    return [];
  } catch (err) {
    console.error("[Gateway] sessions.preview failed:", err);
    return [];
  }
}
