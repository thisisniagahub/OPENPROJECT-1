import { describe, expect, it } from "vitest";
import {
  MAIN_SESSION_KEY,
  normalizeOperatorSessionKey,
} from "@/lib/server-store";

describe("normalizeOperatorSessionKey", () => {
  it("defaults missing session keys to the NiagaBot main session", () => {
    expect(normalizeOperatorSessionKey(undefined)).toEqual({
      sessionKey: MAIN_SESSION_KEY,
    });
    expect(normalizeOperatorSessionKey("   ")).toEqual({
      sessionKey: MAIN_SESSION_KEY,
    });
  });

  it("accepts user-facing NiagaBot session keys", () => {
    expect(normalizeOperatorSessionKey("agent:main:test123")).toEqual({
      sessionKey: "agent:main:test123",
    });
  });

  it("rejects direct specialist session keys", () => {
    const result = normalizeOperatorSessionKey("agent:youtube-growth-agent:main");
    expect("error" in result).toBe(true);
    if ("error" in result) {
      expect(result.error).toContain("agent:main:*");
    }
  });
});
