import { describe, it, expect } from "vitest";
import {
  chatId,
  findTask,
  MAIN_SESSION_KEY,
  initialState,
} from "../lib/reducer";

describe("Reducer Utilities", () => {
  describe("chatId", () => {
    it("should generate unique IDs", () => {
      const id1 = chatId();
      const id2 = chatId();
      expect(id1).not.toBe(id2);
    });

    it("should generate string IDs", () => {
      const id = chatId();
      expect(typeof id).toBe("string");
    });

    it("should generate IDs with 'chat_' prefix", () => {
      const id = chatId();
      expect(id).toMatch(/^chat_/);
    });
  });

  describe("findTask", () => {
    it("should find task by runId", () => {
      const tasks = [
        { taskId: "task-1", runId: "run-123", status: "running", message: "", sessionKey: "", createdAt: Date.now() },
        { taskId: "task-2", runId: "run-456", status: "completed", message: "", sessionKey: "", createdAt: Date.now() },
      ];
      const found = findTask(tasks as any, "run-123");
      expect(found).toBeDefined();
      expect(found?.taskId).toBe("task-1");
    });

    it("should return undefined if not found", () => {
      const tasks = [
        { taskId: "task-1", runId: "run-123", status: "running", message: "", sessionKey: "", createdAt: Date.now() },
      ];
      const found = findTask(tasks as any, "nonexistent");
      expect(found).toBeUndefined();
    });

    it("should handle empty tasks array", () => {
      const found = findTask([], "run-123");
      expect(found).toBeUndefined();
    });
  });

  describe("MAIN_SESSION_KEY", () => {
    it("should be a non-empty string", () => {
      expect(MAIN_SESSION_KEY).toBeDefined();
      expect(typeof MAIN_SESSION_KEY).toBe("string");
      expect(MAIN_SESSION_KEY.length).toBeGreaterThan(0);
    });
  });
});

describe("Initial State", () => {
  it("should have correct initial state structure", () => {
    expect(initialState.connection).toBe("disconnected");
    expect(initialState.chatMessages).toEqual([]);
    expect(initialState.tasks).toEqual([]);
    expect(initialState.seats).toEqual([]);
    expect(initialState.sessions).toEqual([]);
  });

  it("should have undefined activeSessionKey", () => {
    expect(initialState.activeSessionKey).toBeUndefined();
  });

  it("should have sessionMetrics with fresh: false", () => {
    expect(initialState.sessionMetrics).toBeDefined();
    expect(initialState.sessionMetrics.fresh).toBe(false);
  });
});
