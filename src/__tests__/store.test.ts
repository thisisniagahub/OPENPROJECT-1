import { describe, expect, it } from "vitest";
import {
  buildDelegationMessage,
  buildNiagaBotSessionKey,
  canAutoConnectGateway,
  resolveSeatRoutingTarget,
} from "@/lib/store";
import type { SeatState } from "@/types/game";

function makeSeat(overrides: Partial<SeatState>): SeatState {
  return {
    seatId: overrides.seatId ?? "seat-1",
    label: overrides.label ?? "Seat 1",
    status: overrides.status ?? "empty",
    ...overrides,
  };
}

describe("store routing helpers", () => {
  it("always uses the NiagaBot main session as the operator entry point", () => {
    expect(buildNiagaBotSessionKey()).toBe("agent:main:main");
  });

  it("resolves the correct agent identity even when seats share the same sprite key", () => {
    const seats: SeatState[] = [
      makeSeat({
        seatId: "seat-intel",
        label: "Trend Intel",
        agentId: "a1",
        openclawId: "trend-intelligence-agent",
        spriteKey: "character_02",
      }),
      makeSeat({
        seatId: "seat-youtube",
        label: "YouTube Growth",
        agentId: "g3",
        openclawId: "youtube-growth-agent",
        spriteKey: "character_02",
      }),
    ];

    expect(resolveSeatRoutingTarget(seats, "seat-youtube")).toEqual({
      seatId: "seat-youtube",
      actorName: "YouTube Growth",
      agentId: "g3",
      openclawId: "youtube-growth-agent",
    });
  });

  it("wraps mapped seat tasks as NiagaBot delegation hints instead of direct specialist routing", () => {
    expect(
      buildDelegationMessage("Audit this campaign", {
        seatId: "seat-youtube",
        actorName: "YouTube Growth",
        agentId: "g3",
        openclawId: "youtube-growth-agent",
      }),
    ).toContain("preferred_openclaw_id: youtube-growth-agent");
  });

  it("leaves untargeted tasks unchanged", () => {
    expect(buildDelegationMessage("General update")).toBe("General update");
  });
});

describe("canAutoConnectGateway", () => {
  it("auto-connects only when the saved gateway does not require a runtime token", () => {
    expect(
      canAutoConnectGateway({
        url: "ws://gateway.example",
        token: "",
      }),
    ).toBe(true);

    expect(
      canAutoConnectGateway({
        url: "ws://gateway.example",
        token: "",
        requiresToken: true,
      }),
    ).toBe(false);

    expect(
      canAutoConnectGateway({
        url: "",
        token: "",
      }),
    ).toBe(false);

    expect(canAutoConnectGateway(null)).toBe(false);
  });
});
