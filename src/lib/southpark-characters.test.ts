import { describe, it, expect } from "vitest";
import {
  SOUTH_PARK_CHARACTERS,
  getCharacterById,
  getRandomCatchphrase,
  getWorkingPhrase,
  getCompletionPhrase,
  getErrorPhrase,
  DEFAULT_CHARACTER,
} from "../lib/southpark-characters";

describe("South Park Characters", () => {
  describe("SOUTH_PARK_CHARACTERS", () => {
    it("should have 5 characters", () => {
      expect(SOUTH_PARK_CHARACTERS).toHaveLength(5);
    });

    it("should have required properties for each character", () => {
      SOUTH_PARK_CHARACTERS.forEach((character) => {
        expect(character).toHaveProperty("id");
        expect(character).toHaveProperty("name");
        expect(character).toHaveProperty("fullName");
        expect(character).toHaveProperty("spritePath");
        expect(character).toHaveProperty("color");
        expect(character).toHaveProperty("personality");
        expect(character).toHaveProperty("catchphrases");
        expect(character).toHaveProperty("skills");
        expect(character).toHaveProperty("voiceStyle");
        expect(character).toHaveProperty("bio");
      });
    });

    it("should have correct character IDs", () => {
      const ids = SOUTH_PARK_CHARACTERS.map((c) => c.id);
      expect(ids).toContain("stan");
      expect(ids).toContain("kyle");
      expect(ids).toContain("cartman");
      expect(ids).toContain("kenny");
      expect(ids).toContain("butters");
    });

    it("should have valid sprite paths", () => {
      SOUTH_PARK_CHARACTERS.forEach((character) => {
        expect(character.spritePath).toMatch(/^\/southpark\/[a-z]+\.png$/);
      });
    });

    it("should have valid colors (hex format)", () => {
      SOUTH_PARK_CHARACTERS.forEach((character) => {
        expect(character.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      });
    });

    it("should have at least one catchphrase per character", () => {
      SOUTH_PARK_CHARACTERS.forEach((character) => {
        expect(character.catchphrases.length).toBeGreaterThan(0);
      });
    });

    it("should have at least one skill per character", () => {
      SOUTH_PARK_CHARACTERS.forEach((character) => {
        expect(character.skills.length).toBeGreaterThan(0);
      });
    });
  });

  describe("getCharacterById", () => {
    it("should return correct character for valid ID", () => {
      const stan = getCharacterById("stan");
      expect(stan).toBeDefined();
      expect(stan?.name).toBe("Stan");
      expect(stan?.fullName).toBe("Stan Marsh");
    });

    it("should return undefined for invalid ID", () => {
      const invalid = getCharacterById("invalid");
      expect(invalid).toBeUndefined();
    });

    it("should return Cartman for cartman ID", () => {
      const cartman = getCharacterById("cartman");
      expect(cartman).toBeDefined();
      expect(cartman?.catchphrases).toContain("Respect my authoritah!");
    });
  });

  describe("getRandomCatchphrase", () => {
    it("should return a catchphrase for valid character", () => {
      const phrase = getRandomCatchphrase("kenny");
      expect(phrase).toBeDefined();
      expect(typeof phrase).toBe("string");
    });

    it("should return '...' for invalid character", () => {
      const phrase = getRandomCatchphrase("invalid");
      expect(phrase).toBe("...");
    });
  });

  describe("getWorkingPhrase", () => {
    it("should return a working phrase for each character", () => {
      const characters = ["stan", "kyle", "cartman", "kenny", "butters"];
      characters.forEach((id) => {
        const phrase = getWorkingPhrase(id);
        expect(phrase).toBeDefined();
        expect(typeof phrase).toBe("string");
        expect(phrase.length).toBeGreaterThan(0);
      });
    });
  });

  describe("getCompletionPhrase", () => {
    it("should return a completion phrase for each character", () => {
      const characters = ["stan", "kyle", "cartman", "kenny", "butters"];
      characters.forEach((id) => {
        const phrase = getCompletionPhrase(id);
        expect(phrase).toBeDefined();
        expect(typeof phrase).toBe("string");
      });
    });
  });

  describe("getErrorPhrase", () => {
    it("should return an error phrase for each character", () => {
      const characters = ["stan", "kyle", "cartman", "kenny", "butters"];
      characters.forEach((id) => {
        const phrase = getErrorPhrase(id);
        expect(phrase).toBeDefined();
        expect(typeof phrase).toBe("string");
      });
    });
  });

  describe("DEFAULT_CHARACTER", () => {
    it("should be Stan (first character)", () => {
      expect(DEFAULT_CHARACTER.id).toBe("stan");
    });
  });
});
