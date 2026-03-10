import { describe, it, expect, vi, beforeEach } from "vitest";
import { GatewayClient } from "@/lib/gateway";

/**
 * Unit tests for GatewayClient.
 * These test the public API surface without a real WebSocket connection.
 */

// Mock WebSocket since jsdom doesn't have a real one
vi.stubGlobal(
    "WebSocket",
    class MockWebSocket {
        static instances: MockWebSocket[] = [];
        static OPEN = 1;
        static CLOSED = 3;
        readyState = 3;
        sentMessages: string[] = [];
        onopen: (() => void) | null = null;
        onmessage: ((ev: unknown) => void) | null = null;
        onerror: ((ev: unknown) => void) | null = null;
        onclose: ((ev: unknown) => void) | null = null;
        constructor() {
            MockWebSocket.instances.push(this);
        }
        close() {
            this.readyState = 3;
            this.onclose?.({ code: 1000, reason: "" });
        }
        send(payload: string) {
            this.sentMessages.push(payload);
        }
    },
);

describe("GatewayClient", () => {
    let client: GatewayClient;

    beforeEach(() => {
        (WebSocket as unknown as { instances: unknown[] }).instances.length = 0;
        client = new GatewayClient("ws://test:18789", "test-token");
    });

    // ── Constructor ──────────────────────────────────────
    it("initializes with disconnected status", () => {
        expect(client.status).toBe("disconnected");
    });

    // ── Status helpers ───────────────────────────────────
    it("isHealthy returns false when disconnected", () => {
        expect(client.isHealthy()).toBe(false);
    });

    // ── Event system ─────────────────────────────────────
    it("on() returns an unsubscribe function", () => {
        const fn = vi.fn();
        const off = client.on("status", fn);
        expect(typeof off).toBe("function");
        off();
    });

    it("connect() returns a promise", () => {
        const result = client.connect();
        expect(result).toBeInstanceOf(Promise);
        // Clean up
        client.disconnect();
    });

    it("logs transport failures as warnings instead of console errors", async () => {
        const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
        const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

        (client as unknown as { debug: boolean }).debug = true;

        const connection = client.connect();
        const ws = (WebSocket as unknown as { instances: Array<{ onerror: ((ev: unknown) => void) | null }> }).instances[0];
        ws.onerror?.({});

        await expect(connection).rejects.toThrow("WebSocket connection error");
        expect(warnSpy).toHaveBeenCalledWith(
            "[Gateway] WebSocket transport error",
            expect.objectContaining({
                url: "ws://test:18789",
                status: "connecting",
            }),
        );
        expect(errorSpy).not.toHaveBeenCalled();
    });

    // ── Disconnect ───────────────────────────────────────
    it("disconnect sets status back to disconnected", () => {
        client.connect();
        client.disconnect();
        expect(client.status).toBe("disconnected");
    });

    // ── Convenience methods ──────────────────────────────
    describe("convenience methods", () => {
        it("sendChat() exists and is a function", () => {
            expect(typeof client.sendChat).toBe("function");
        });

        it("sendChat uses the provided session key for targeted routing", () => {
            const ws = new WebSocket("ws://test") as unknown as {
                readyState: number;
                sentMessages: string[];
            };
            ws.readyState = 1;
            (client as unknown as { ws: unknown }).ws = ws;

            void client.sendChat("route this", "agent:youtube-growth-agent:main");

            const frame = JSON.parse(ws.sentMessages[0]);
            expect(frame.method).toBe("chat.send");
            expect(frame.params.text).toBe("route this");
            expect(frame.params.sessionKey).toBe("agent:youtube-growth-agent:main");
        });

        it("getChatHistory() exists", () => {
            expect(typeof client.getChatHistory).toBe("function");
        });

        it("abortChat() exists", () => {
            expect(typeof client.abortChat).toBe("function");
        });

        it("getPresence() exists", () => {
            expect(typeof client.getPresence).toBe("function");
        });

        it("getHealth() exists", () => {
            expect(typeof client.getHealth).toBe("function");
        });

        it("getGatewayStatus() exists", () => {
            expect(typeof client.getGatewayStatus).toBe("function");
        });

        it("getSessions() exists", () => {
            expect(typeof client.getSessions).toBe("function");
        });
    });

    // ── Cleanup ──────────────────────────────────────────
    it("disconnect cleans up fully", () => {
        client.connect();
        client.disconnect();
        expect(client.status).toBe("disconnected");
    });
});
