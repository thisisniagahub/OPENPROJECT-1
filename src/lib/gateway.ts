/**
 * OpenClaw Gateway WebSocket client.
 *
 * Protocol: frame-based RPC over WebSocket.
 *   - req/res for request-response
 *   - event for server-pushed updates
 *   - Handshake: connect.challenge -> connect -> hello-ok
 *
 * Features:
 *   - Automatic reconnection with exponential backoff
 *   - Typed event dispatching
 *   - Request timeout management
 *   - Connection health monitoring (heartbeat)
 *   - Graceful degradation
 */

import type { GatewayFrame } from "./gateway-types";
import { getGatewayUrl, getGatewayToken, isDebugEnabled } from "./env";

type Listener = (payload: unknown) => void;

interface PendingRequest {
  resolve: (res: GatewayFrame) => void;
  reject: (err: Error) => void;
  timer: ReturnType<typeof setTimeout>;
}

export type GatewayStatus = 
  | "disconnected" 
  | "connecting" 
  | "connected" 
  | "error" 
  | "auth_failed" 
  | "unreachable" 
  | "rate_limited"
  | "handshaking";

// ── Configuration ───────────────────────────────────────────────────────

const RECONNECT_BASE_MS = 1000;
const RECONNECT_MAX_MS = 30000;
const RECONNECT_FACTOR = 2;
const RECONNECT_MAX_ATTEMPTS = 5;
const HANDSHAKE_TIMEOUT_MS = 15000;
const DEFAULT_REQUEST_TIMEOUT_MS = 30000;
const HEARTBEAT_INTERVAL_MS = 30000;
const HEARTBEAT_TIMEOUT_MS = 10000;

let counter = 0;
function nextId(): string {
  return `aw_${++counter}_${Date.now()}`;
}

// ── Gateway Client Class ─────────────────────────────────────────────────

export class GatewayClient {
  private ws: WebSocket | null = null;
  private pending = new Map<string, PendingRequest>();
  private eventListeners = new Map<string, Set<Listener>>();
  private statusListeners = new Set<(s: GatewayStatus) => void>();
  private _status: GatewayStatus = "disconnected";
  private url: string;
  private token: string;

  private connectReject: ((err: Error) => void) | null = null;
  private connectSettled = false;

  /** Reconnection state */
  private autoReconnect = false;
  private reconnectAttempt = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private intentionalClose = false;

  /** Heartbeat state */
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private heartbeatTimeout: ReturnType<typeof setTimeout> | null = null;
  private lastPongTime = 0;

  /** Debug logging */
  private debug: boolean;

  constructor(url?: string, token?: string) {
    this.url = url ?? getGatewayUrl();
    this.token = token ?? getGatewayToken();
    this.debug = isDebugEnabled();
  }

  get status(): GatewayStatus {
    return this._status;
  }

  private setStatus(s: GatewayStatus) {
    if (this._status === s) return; // No change
    this._status = s;
    if (this.debug) {
      console.log(`[Gateway] Status: ${s}`);
    }
    this.statusListeners.forEach((fn) => fn(s));
  }

  onStatus(fn: (s: GatewayStatus) => void): () => void {
    this.statusListeners.add(fn);
    return () => this.statusListeners.delete(fn);
  }

  on(event: string, fn: Listener): () => void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(fn);
    return () => this.eventListeners.get(event)?.delete(fn);
  }

  /**
   * Connect to the gateway.
   * Returns a promise that resolves with the hello-ok frame.
   */
  connect(): Promise<GatewayFrame> {
    this.autoReconnect = true;
    this.reconnectAttempt = 0;
    this.intentionalClose = false;
    return this.connectOnce();
  }

  private connectOnce(): Promise<GatewayFrame> {
    return new Promise((resolve, reject) => {
      if (this.ws) {
        this.ws.close();
        this.ws = null;
      }

      this.setStatus("connecting");
      this.connectSettled = false;
      this.connectReject = reject;

      if (this.debug) {
        console.log(`[Gateway] Connecting to ${this.url}...`);
      }

      let ws: WebSocket;
      try {
        ws = new WebSocket(this.url);
      } catch (err) {
        this.setStatus("error");
        reject(new Error(`Invalid WebSocket URL: ${this.url}`));
        return;
      }
      this.ws = ws;

      // Connection timeout
      const connectionTimeout = setTimeout(() => {
        if (!this.connectSettled) {
          this.setStatus("unreachable");
          this.rejectConnect(new Error("Connection timeout"));
          ws.close();
        }
      }, HANDSHAKE_TIMEOUT_MS);

      ws.onopen = () => {
        clearTimeout(connectionTimeout);
        this.setStatus("handshaking");
        // Wait for connect.challenge event from server
        if (this.debug) {
          console.log("[Gateway] WebSocket opened, waiting for challenge...");
        }
      };

      ws.onmessage = (ev: MessageEvent) => {
        let frame: GatewayFrame;
        try {
          frame = JSON.parse(typeof ev.data === "string" ? ev.data : "{}");
        } catch (err) {
          if (this.debug) {
            console.warn("[Gateway] Failed to parse message:", ev.data);
          }
          return;
        }

        if (this.debug && frame.event !== "pong") {
          console.log("[Gateway] Received:", frame);
        }

        this.handleFrame(frame, (res) => {
          if (!this.connectSettled) {
            this.connectSettled = true;
            this.connectReject = null;
            this.reconnectAttempt = 0;
            this.startHeartbeat();
            resolve(res);
          }
        });
      };

      ws.onerror = (ev) => {
        clearTimeout(connectionTimeout);
        if (this.debug) {
          console.error("[Gateway] WebSocket error:", ev);
        }
        // Don't overwrite terminal states set by handshake failure
        if (this._status !== "auth_failed" && this._status !== "unreachable" && this._status !== "rate_limited") {
          this.setStatus("error");
        }
        this.rejectConnect(new Error("WebSocket connection error"));
      };

      ws.onclose = (ev) => {
        clearTimeout(connectionTimeout);
        const wasConnected = this._status === "connected";
        
        if (this.debug) {
          console.log(`[Gateway] WebSocket closed: code=${ev.code}, reason=${ev.reason}`);
        }

        this.stopHeartbeat();

        // Don't overwrite terminal states set by handshake failure
        if (this._status !== "auth_failed" && this._status !== "unreachable" && this._status !== "rate_limited") {
          this.setStatus("disconnected");
        }
        this.rejectConnect(new Error(`Connection closed: ${ev.reason || "unknown"}`));
        this.clearPending();

        if (!this.intentionalClose && this.autoReconnect) {
          this.scheduleReconnect(wasConnected);
        }
      };
    });
  }

  // ── Heartbeat ───────────────────────────────────────────────────────────

  private startHeartbeat() {
    this.stopHeartbeat();
    this.lastPongTime = Date.now();

    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState !== WebSocket.OPEN) return;

      // Send ping
      this.ws.send(JSON.stringify({ type: "event", event: "ping" }));

      // Set timeout for pong
      this.heartbeatTimeout = setTimeout(() => {
        const elapsed = Date.now() - this.lastPongTime;
        if (elapsed > HEARTBEAT_TIMEOUT_MS) {
          if (this.debug) {
            console.warn("[Gateway] Heartbeat timeout, reconnecting...");
          }
          this.ws?.close();
        }
      }, HEARTBEAT_TIMEOUT_MS);
    }, HEARTBEAT_INTERVAL_MS);

    // Listen for pong
    const pongHandler = (payload: unknown) => {
      this.lastPongTime = Date.now();
      if (this.heartbeatTimeout) {
        clearTimeout(this.heartbeatTimeout);
        this.heartbeatTimeout = null;
      }
    };
    this.on("pong", pongHandler);
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout);
      this.heartbeatTimeout = null;
    }
  }

  // ── Reconnection ────────────────────────────────────────────────────────

  private scheduleReconnect(wasConnected: boolean) {
    if (this.reconnectTimer) return;

    // If we were previously connected, reset attempt counter for faster retry
    if (wasConnected) {
      this.reconnectAttempt = 0;
    }

    if (this.reconnectAttempt >= RECONNECT_MAX_ATTEMPTS) {
      this.autoReconnect = false;
      this.setStatus("unreachable");
      return;
    }

    const delay = Math.min(
      RECONNECT_BASE_MS * Math.pow(RECONNECT_FACTOR, this.reconnectAttempt),
      RECONNECT_MAX_MS,
    );
    this.reconnectAttempt++;

    if (this.debug) {
      console.log(`[Gateway] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempt}/${RECONNECT_MAX_ATTEMPTS})`);
    }

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (!this.autoReconnect || this.intentionalClose) return;

      this.connectOnce().catch(() => {
        // Error handled by onclose -> scheduleReconnect
      });
    }, delay);
  }

  private rejectConnect(err: Error) {
    if (!this.connectSettled) {
      this.connectSettled = true;
      this.connectReject?.(err);
      this.connectReject = null;
    }
  }

  private clearPending() {
    for (const [, p] of this.pending) {
      p.reject(new Error("Connection closed"));
      clearTimeout(p.timer);
    }
    this.pending.clear();
  }

  // ── Frame Handling ──────────────────────────────────────────────────────

  private handleFrame(frame: GatewayFrame, onConnected?: (res: GatewayFrame) => void) {
    // Handle pong separately
    if (frame.event === "pong") {
      this.lastPongTime = Date.now();
      return;
    }

    if (frame.type === "event") {
      if (frame.event === "connect.challenge") {
        this.sendConnectHandshake();
        return;
      }

      if (frame.event) {
        const listeners = this.eventListeners.get(frame.event);
        if (listeners) {
          listeners.forEach((fn) => fn(frame.payload));
        }
      }
      // Fire wildcard listeners
      const wildcard = this.eventListeners.get("*");
      if (wildcard) {
        wildcard.forEach((fn) => fn(frame));
      }
      return;
    }

    if (frame.type === "res" && frame.id) {
      const pending = this.pending.get(frame.id);
      if (pending) {
        clearTimeout(pending.timer);
        this.pending.delete(frame.id);

        if (frame.ok) {
          if (frame.payload?.type === "hello-ok") {
            this.setStatus("connected");
            onConnected?.(frame);
          }
          pending.resolve(frame);
        } else {
          pending.reject(
            new Error(frame.error?.message ?? "Request failed"),
          );
        }
        return;
      }

      if (frame.ok && frame.payload?.type === "hello-ok") {
        this.setStatus("connected");
        onConnected?.(frame);
        return;
      }

      // Gateway sends a second res frame for long-running requests
      // (first = "accepted", second = final "ok"/"error"). Route it
      // as an internal event so the store can update task status.
      const listeners = this.eventListeners.get("__final_res__");
      if (listeners) {
        listeners.forEach((fn) => fn(frame));
      }
    }
  }

  private sendConnectHandshake() {
    const id = nextId();
    const frame: GatewayFrame = {
      type: "req",
      id,
      method: "connect",
      params: {
        minProtocol: 3,
        maxProtocol: 3,
        client: {
          id: "gateway-client",
          displayName: "Agent Town",
          version: "1.0.0",
          platform: "web",
          mode: "backend",
          instanceId: `aw-${Date.now()}`,
        },
        auth: { token: this.token },
        role: "operator",
        scopes: ["operator.read", "operator.write", "operator.admin"],
        locale: "en-US",
      },
    };

    if (this.debug) {
      console.log("[Gateway] Sending handshake:", frame);
    }

    const timer = setTimeout(() => {
      this.pending.delete(id);
      this.setStatus("error");
      this.rejectConnect(new Error("Handshake timeout (15s)"));
    }, HANDSHAKE_TIMEOUT_MS);

    this.pending.set(id, {
      resolve: () => {},
      reject: (err) => {
        // Server explicitly rejected the handshake — stop retrying immediately.
        this.autoReconnect = false;
        const isRateLimited = /rate.limit|too many/i.test(err.message);
        const isAuthFailed = /auth|token|unauthorized|forbidden/i.test(err.message);
        
        if (isRateLimited) {
          this.setStatus("rate_limited");
        } else if (isAuthFailed) {
          this.setStatus("auth_failed");
        } else {
          this.setStatus("error");
        }
        this.rejectConnect(err);
      },
      timer,
    });

    this.ws?.send(JSON.stringify(frame));
  }

  // ── Public API ──────────────────────────────────────────────────────────

  /**
   * Send a request to the gateway.
   * @param method The method name
   * @param params The parameters
   * @param timeoutMs Timeout in milliseconds
   */
  async request(
    method: string,
    params?: Record<string, unknown>,
    timeoutMs = DEFAULT_REQUEST_TIMEOUT_MS,
  ): Promise<GatewayFrame> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error("Not connected");
    }

    const id = nextId();

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`Timeout: ${method}`));
      }, timeoutMs);

      this.pending.set(id, { resolve, reject, timer });

      const frame: GatewayFrame = { type: "req", id, method, params };
      
      if (this.debug) {
        console.log("[Gateway] Sending request:", frame);
      }
      
      this.ws!.send(JSON.stringify(frame));
    });
  }

  /**
   * Subscribe to final responses for long-running requests.
   */
  onFinalResponse(fn: (frame: GatewayFrame) => void): () => void {
    return this.on("__final_res__", fn as Listener);
  }

  /**
   * Disconnect from the gateway.
   */
  disconnect() {
    this.intentionalClose = true;
    this.autoReconnect = false;

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.connectSettled = true;
    this.connectReject = null;

    this.stopHeartbeat();

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.clearPending();
    this.setStatus("disconnected");
  }

  /**
   * Update the gateway URL and token.
   * Will reconnect if currently connected.
   */
  updateConfig(url: string, token: string) {
    const wasConnected = this._status === "connected";
    this.url = url;
    this.token = token;
    
    if (wasConnected) {
      this.intentionalClose = false;
      this.disconnect();
      this.connect().catch(() => {});
    }
  }

  /**
   * Check if the connection is healthy.
   */
  isHealthy(): boolean {
    return this._status === "connected" && 
           this.ws?.readyState === WebSocket.OPEN &&
           (Date.now() - this.lastPongTime) < HEARTBEAT_TIMEOUT_MS * 2;
  }
}
