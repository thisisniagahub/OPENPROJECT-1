import { beforeEach, describe, it, expect, vi } from "vitest";
import {
    WORKER_SPRITES,
    ALL_WORKER_SPRITES,
    CHARACTER_STORAGE_KEY,
    DEFAULT_OPERATIVE_AGENT_ID,
    getCharacterConfig,
    getSelectedCharacter,
    getWorkerSpriteByAgentId,
    getRandomCatchphrase,
    setSelectedCharacter,
    BOSS_SPRITE_KEY,
    BOSS_SPRITE_PATH,
    FRAME_WIDTH,
    FRAME_HEIGHT,
    SHEET_COLUMNS,
    IDLE_ANIMS,
    WALK_ANIMS,
    ALL_ANIMS,
} from "@/components/game/config/animations";


// Local storage is now mocked globally in vitest.config.ts / test-setup.ts

describe("animations", () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    // ── Sprite registry ──────────────────────────────────
    it("WORKER_SPRITES has exactly 24 entries", () => {
        expect(WORKER_SPRITES).toHaveLength(24);
    });

    it("ALL_WORKER_SPRITES is the same array as WORKER_SPRITES", () => {
        expect(ALL_WORKER_SPRITES).toBe(WORKER_SPRITES);
    });

    it("each sprite has key, path, and label", () => {
        for (const sprite of WORKER_SPRITES) {
            expect(sprite.key).toBeTruthy();
            expect(sprite.path).toMatch(/\.png$/);
            expect(sprite.label).toBeTruthy();
        }
    });

    it("uses texture keys that match the referenced sprite sheet path", () => {
        for (const sprite of WORKER_SPRITES) {
            const pathSuffix = sprite.path.match(/_(\d+)\.png$/)?.[1];
            const keySuffix = sprite.key.match(/_(\d+)$/)?.[1];
            expect(keySuffix).toBe(pathSuffix);
        }
    });

    it("sprite keys use at least 9 unique character sheets", () => {
        const keys = WORKER_SPRITES.map((s) => s.key);
        // 24 agents reuse 9 character sprite sheets (cycling through _02 to _10)
        expect(new Set(keys).size).toBeGreaterThanOrEqual(9);
    });

    it("each sprite has OPENPROJECT agent metadata", () => {
        for (const sprite of WORKER_SPRITES) {
            expect(sprite.agentId).toBeTruthy();
            expect(sprite.dept).toBeTruthy();
            expect(sprite.agentCode).toMatch(/^[A-Z]{2,4}$/);
            expect(sprite.color).toMatch(/^#[0-9a-f]{6}$/);
        }
    });

    // ── Boss constants ───────────────────────────────────
    it("BOSS_SPRITE_KEY and PATH are defined", () => {
        expect(BOSS_SPRITE_KEY).toBe("character_09");
        expect(BOSS_SPRITE_PATH).toMatch(/\.png$/);
    });

    // ── Frame constants ──────────────────────────────────
    it("frame dimensions are reasonable", () => {
        expect(FRAME_WIDTH).toBe(48);
        expect(FRAME_HEIGHT).toBe(96);
        expect(SHEET_COLUMNS).toBe(56);
    });

    // ── Animation definitions ────────────────────────────
    it("has 4 idle and 4 walk anims (one per direction)", () => {
        expect(IDLE_ANIMS).toHaveLength(4);
        expect(WALK_ANIMS).toHaveLength(4);
    });

    it("ALL_ANIMS combines idle + walk", () => {
        expect(ALL_ANIMS).toHaveLength(IDLE_ANIMS.length + WALK_ANIMS.length);
    });

    it("each AnimDef has proper shape", () => {
        for (const anim of ALL_ANIMS) {
            expect(typeof anim.key).toBe("string");
            expect(anim.start).toBeLessThanOrEqual(anim.end);
            expect(anim.frameRate).toBeGreaterThan(0);
            expect(anim.repeat).toBe(-1);
        }
    });

    // ── getCharacterConfig ───────────────────────────────
    describe("getCharacterConfig", () => {
        it("returns config for a valid agent ID", () => {
            const first = WORKER_SPRITES[0];
            const config = getCharacterConfig(first.agentId!);
            expect(config).toBeDefined();
            expect(config!.agentId).toBe(first.agentId);
        });

        it("returns undefined for unknown key", () => {
            expect(getCharacterConfig("nonexistent_99")).toBeUndefined();
        });

        it("keeps duplicate sprite sheets uniquely addressable by agent ID", () => {
            expect(getWorkerSpriteByAgentId("g3")?.label).toBe("YouTube Growth");
            expect(getCharacterConfig("g3")?.label).toBe("YouTube Growth");
            expect(getCharacterConfig("character_02")?.label).toBe("Trend Intel");
        });
    });

    // ── getRandomCatchphrase ─────────────────────────────
    describe("getRandomCatchphrase", () => {
        it("returns catchphrase for sprite with catchphrases", () => {
            const withCatch = WORKER_SPRITES.find(
                (s) => s.catchphrases && s.catchphrases.length > 0,
            );
            if (withCatch) {
                const phrase = getRandomCatchphrase(withCatch.key);
                expect(withCatch.catchphrases).toContain(phrase);
            }
        });

        it("returns '...' for unknown sprite", () => {
            expect(getRandomCatchphrase("nonexistent_99")).toBe("...");
        });
    });

    // ── Operative persistence ────────────────────────────
    describe("selected operative persistence", () => {
        it("defaults to the first unique operative ID", () => {
            localStorage.clear();
            expect(getSelectedCharacter()).toBe(DEFAULT_OPERATIVE_AGENT_ID);
        });

        it("normalizes legacy sprite-key storage into a unique agent ID", () => {
            localStorage.setItem(CHARACTER_STORAGE_KEY, "character_02");
            expect(getSelectedCharacter()).toBe("a1");
        });

        it("persists selected operative using agent IDs", () => {
            setSelectedCharacter("g3");
            expect(localStorage.getItem(CHARACTER_STORAGE_KEY)).toBe("g3");
            expect(getSelectedCharacter()).toBe("g3");
        });
    });
});
