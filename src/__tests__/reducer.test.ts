import { describe, it, expect } from "vitest";
import {
    chatId,
    generateSessionKey,
    findTask,
    findAssignableSeatIndex,
    resolveSeatLabelForTask,
    createEmptySessionMetrics,
    mergeDiscoveredSeats,
    MAIN_SESSION_KEY,
} from "@/lib/reducer";
import type { SeatState, TaskItem } from "@/types/game";
import type { SeatDef } from "@/components/game/utils/MapHelpers";

// ── Helpers ────────────────────────────────────────────

function makeSeat(overrides: Partial<SeatState> = {}): SeatState {
    return {
        seatId: `seat_${Math.random().toString(36).slice(2)}`,
        label: "Test Seat",
        assigned: true,
        status: "empty",
        ...overrides,
    } as SeatState;
}

function makeTask(overrides: Partial<TaskItem> = {}): TaskItem {
    return {
        taskId: `task_${Date.now()}`,
        message: "test task",
        status: "submitted",
        sessionKey: MAIN_SESSION_KEY,
        createdAt: new Date().toISOString(),
        ...overrides,
    } as TaskItem;
}

function makeDiscoveredSeat(seatId: string, index: number): SeatDef {
    return { seatId, x: index * 48, y: 0, facing: "down", index };
}

// ── Tests ──────────────────────────────────────────────

describe("reducer helpers", () => {
    describe("chatId", () => {
        it("generates unique IDs", () => {
            const ids = new Set(Array.from({ length: 20 }, () => chatId()));
            expect(ids.size).toBe(20);
        });

        it("starts with 'chat_'", () => {
            expect(chatId()).toMatch(/^chat_/);
        });
    });

    describe("generateSessionKey", () => {
        it("starts with 'agent:main:'", () => {
            expect(generateSessionKey()).toMatch(/^agent:main:/);
        });

        it("generates unique keys", () => {
            const keys = new Set(
                Array.from({ length: 10 }, () => generateSessionKey()),
            );
            expect(keys.size).toBe(10);
        });
    });

    describe("MAIN_SESSION_KEY", () => {
        it("is the expected default key", () => {
            expect(MAIN_SESSION_KEY).toBe("agent:main:main");
        });
    });

    describe("createEmptySessionMetrics", () => {
        it("returns fresh=false", () => {
            const m = createEmptySessionMetrics();
            expect(m.fresh).toBe(false);
        });
    });

    describe("findTask", () => {
        it("finds by taskId", () => {
            const task = makeTask({ taskId: "abc" });
            expect(findTask([task], "abc")).toBe(task);
        });

        it("finds by runId", () => {
            const task = makeTask({ runId: "run_123" } as Partial<TaskItem>);
            expect(findTask([task], "run_123")).toBe(task);
        });

        it("returns undefined for no match", () => {
            expect(findTask([makeTask()], "nonexistent")).toBeUndefined();
        });
    });

    describe("findAssignableSeatIndex", () => {
        it("returns index of assigned empty seat", () => {
            const seats = [makeSeat({ assigned: true, status: "empty" })];
            expect(findAssignableSeatIndex(seats)).toBe(0);
        });

        it("skips running seats", () => {
            const seats = [
                makeSeat({ assigned: true, status: "running" }),
                makeSeat({ assigned: true, status: "empty" }),
            ];
            expect(findAssignableSeatIndex(seats)).toBe(1);
        });

        it("returns -1 when no seats available", () => {
            const seats = [makeSeat({ assigned: false, status: "empty" })];
            expect(findAssignableSeatIndex(seats)).toBe(-1);
        });
    });

    describe("resolveSeatLabelForTask", () => {
        it("returns label for specific seatId", () => {
            const seat = makeSeat({ seatId: "s1", label: "Agent TIA" });
            expect(resolveSeatLabelForTask([seat], "s1")).toBe("Agent TIA");
        });

        it("falls back to first assignable seat", () => {
            const seats = [
                makeSeat({ label: "First", assigned: true, status: "empty" }),
            ];
            expect(resolveSeatLabelForTask(seats)).toBe("First");
        });
    });

    describe("mergeDiscoveredSeats", () => {
        it("creates seats from discovered data with sprite fallbacks", () => {
            const discovered = [
                makeDiscoveredSeat("s1", 0),
                makeDiscoveredSeat("s2", 1),
            ];
            const seats = mergeDiscoveredSeats(discovered, [], []);
            expect(seats).toHaveLength(2);
            expect(seats[0].seatId).toBe("s1");
            expect(seats[0].spriteKey).toBeTruthy();
            expect(seats[0].agentId).toBeTruthy();
        });

        it("prefers stored config over fallback", () => {
            const discovered = [makeDiscoveredSeat("s1", 0)];
            const stored = [
                {
                    seatId: "s1",
                    label: "Custom Label",
                    assigned: true,
                    agentId: "g3",
                    openclawId: "youtube-growth-agent",
                },
            ];
            const seats = mergeDiscoveredSeats(discovered, stored, []);
            expect(seats[0].label).toBe("Custom Label");
            expect(seats[0].agentId).toBe("g3");
            expect(seats[0].openclawId).toBe("youtube-growth-agent");
            expect(seats[0].spriteKey).toBe("character_02");
        });
    });
});
