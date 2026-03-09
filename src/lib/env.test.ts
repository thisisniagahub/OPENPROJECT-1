import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock process.env
const originalEnv = process.env;

describe("Environment Module", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("getGatewayUrl", () => {
    it("should return default URL when env not set", async () => {
      delete process.env.NEXT_PUBLIC_GATEWAY_URL;
      const { getGatewayUrl } = await import("../lib/env");
      // Default is ws://127.0.0.1:18789
      expect(getGatewayUrl()).toBe("ws://127.0.0.1:18789");
    });

    it("should return env URL when set", async () => {
      process.env.NEXT_PUBLIC_GATEWAY_URL = "wss://custom.gateway.com";
      const { getGatewayUrl } = await import("../lib/env");
      expect(getGatewayUrl()).toBe("wss://custom.gateway.com");
    });
  });

  describe("getGatewayToken", () => {
    it("should return empty string when env not set", async () => {
      delete process.env.NEXT_PUBLIC_GATEWAY_TOKEN;
      const { getGatewayToken } = await import("../lib/env");
      expect(getGatewayToken()).toBe("");
    });

    it("should return env token when set", async () => {
      process.env.NEXT_PUBLIC_GATEWAY_TOKEN = "test-token-123";
      const { getGatewayToken } = await import("../lib/env");
      expect(getGatewayToken()).toBe("test-token-123");
    });
  });

  describe("isDebugEnabled", () => {
    it("should return false when debug not set", async () => {
      delete process.env.NEXT_PUBLIC_DEBUG;
      const { isDebugEnabled } = await import("../lib/env");
      expect(isDebugEnabled()).toBe(false);
    });

    it("should return true when debug is 'true'", async () => {
      process.env.NEXT_PUBLIC_DEBUG = "true";
      const { isDebugEnabled } = await import("../lib/env");
      expect(isDebugEnabled()).toBe(true);
    });

    it("should return false when debug is not 'true'", async () => {
      process.env.NEXT_PUBLIC_DEBUG = "false";
      const { isDebugEnabled } = await import("../lib/env");
      expect(isDebugEnabled()).toBe(false);
    });
  });

  describe("isSoundEnabled", () => {
    it("should return true by default", async () => {
      delete process.env.NEXT_PUBLIC_ENABLE_SOUND;
      const { isSoundEnabled } = await import("../lib/env");
      expect(isSoundEnabled()).toBe(true);
    });
  });

  describe("isMusicEnabled", () => {
    it("should return true by default", async () => {
      delete process.env.NEXT_PUBLIC_ENABLE_MUSIC;
      const { isMusicEnabled } = await import("../lib/env");
      expect(isMusicEnabled()).toBe(true);
    });
  });
});
