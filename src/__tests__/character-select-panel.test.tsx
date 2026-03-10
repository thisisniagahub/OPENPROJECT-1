import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import CharacterSelectPanel from "@/components/hud/CharacterSelectPanel";

function countMatches(haystack: string, needle: RegExp): number {
  return haystack.match(needle)?.length ?? 0;
}

describe("CharacterSelectPanel", () => {
  it("shows the current selector header for the 24 operative roster", () => {
    const markup = renderToStaticMarkup(
      <CharacterSelectPanel
        isOpen
        onClose={() => {}}
        selectedCharacterId="a1"
        onSelect={() => {}}
      />,
    );

    expect(markup).toContain("OPERATIVE_DATABASE");
    expect(markup).toContain("TOTAL_UNITS: 24");
  });

  it("uses unique agent IDs for selection details even when sprite sheets are shared", () => {
    const markup = renderToStaticMarkup(
      <CharacterSelectPanel
        isOpen
        onClose={() => {}}
        selectedCharacterId="g3"
        onSelect={() => {}}
      />,
    );

    expect(countMatches(markup, /YouTube Growth/g)).toBe(2);
    expect(countMatches(markup, /Trend Intel/g)).toBe(1);
    expect(markup).toContain("g3");
    expect(markup).toContain("youtube-growth-agent");
    expect(markup).not.toContain("trend-intelligence-agent");
  });
});
