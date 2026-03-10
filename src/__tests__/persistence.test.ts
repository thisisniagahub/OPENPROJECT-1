import { beforeEach, describe, expect, it, vi } from "vitest";
import { LS_CONFIG, LS_SEAT_CONFIG } from "@/lib/constants";
import {
  type PersistedSeatConfig,
  loadGatewayConfig,
  loadSeatConfigs,
  saveGatewayConfig,
  saveSeatConfigs,
} from "@/lib/persistence";

describe("persistence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("gateway config", () => {
    it("stores only the gateway URL and drops the runtime token", () => {
      saveGatewayConfig({
        url: "ws://gateway.example",
        token: "super-secret-token",
      });

      expect(localStorage.getItem(LS_CONFIG)).toBe(
        JSON.stringify({ url: "ws://gateway.example", requiresToken: true }),
      );
      expect(loadGatewayConfig()).toEqual({
        url: "ws://gateway.example",
        token: "",
        requiresToken: true,
      });
    });

    it("returns null when no gateway URL was persisted", () => {
      expect(loadGatewayConfig()).toBeNull();
    });
  });

  describe("seat configs", () => {
    it("round-trips unique agent and OpenClaw identities even when sprite keys repeat", () => {
      const configs: PersistedSeatConfig[] = [
        {
          seatId: "seat-intel",
          label: "Trend Intel",
          assigned: true,
          agentId: "a1",
          openclawId: "trend-intelligence-agent",
          spriteKey: "character_02",
          spritePath: "/characters/Premade_Character_48x48_02.png",
        },
        {
          seatId: "seat-youtube",
          label: "YouTube Growth",
          assigned: true,
          agentId: "g3",
          openclawId: "youtube-growth-agent",
          spriteKey: "character_02",
          spritePath: "/characters/Premade_Character_48x48_02.png",
        },
      ];

      saveSeatConfigs(configs);

      expect(localStorage.getItem(LS_SEAT_CONFIG)).toBe(JSON.stringify(configs));
      expect(loadSeatConfigs()).toEqual(configs);
    });
  });
});
