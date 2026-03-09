/**
 * Character spritesheet animation configuration.
 *
 * All Premade_Character_48x48_XX.png sheets share the same layout:
 *   48×96 frames, 56 cols × ~20 rows
 *     Row 0: preview/idle thumbnails
 *     Row 1: idle — right(6) · up(6) · left(6) · down(6)
 *     Row 2: walk — right(6) · up(6) · left(6) · down(6)
 * 
 * South Park characters follow similar layout for animation frames.
 */

export const FRAME_WIDTH = 48;
export const FRAME_HEIGHT = 96;
export const SHEET_COLUMNS = 56;

const FRAMES_PER_DIR = 6;

/** Pixel/sec movement speed */
export const MOVE_SPEED = 160;

export interface AnimDef {
  key: string;
  start: number;
  end: number;
  frameRate: number;
  repeat: number;
}

// Boss character (player-controlled) — male character
export const BOSS_SPRITE_KEY = "character_09";
export const BOSS_SPRITE_PATH = "/characters/Premade_Character_48x48_09.png";

// Keep legacy exports for Player.ts compatibility
export const SPRITE_KEY = BOSS_SPRITE_KEY;
export const SPRITE_PATH = BOSS_SPRITE_PATH;

export interface WorkerSpriteConfig {
  key: string;
  path: string;
  label: string;
  isSouthPark?: boolean;
  color?: string;
}

// Default worker sprites
export const WORKER_SPRITES: WorkerSpriteConfig[] = [
  { key: "character_02", path: "/characters/Premade_Character_48x48_02.png", label: "Alice" },
  { key: "character_03", path: "/characters/Premade_Character_48x48_03.png", label: "Bob" },
  { key: "character_04", path: "/characters/Premade_Character_48x48_04.png", label: "Carol" },
  { key: "character_05", path: "/characters/Premade_Character_48x48_05.png", label: "Dave" },
  { key: "character_06", path: "/characters/Premade_Character_48x48_06.png", label: "Eve" },
];

// South Park character sprites
export const SOUTH_PARK_SPRITES: WorkerSpriteConfig[] = [
  { key: "southpark_stan", path: "/southpark/stan.png", label: "Stan Marsh", isSouthPark: true, color: "#3B82F6" },
  { key: "southpark_kyle", path: "/southpark/kyle.png", label: "Kyle Broflovski", isSouthPark: true, color: "#22C55E" },
  { key: "southpark_cartman", path: "/southpark/cartman.png", label: "Eric Cartman", isSouthPark: true, color: "#EF4444" },
  { key: "southpark_kenny", path: "/southpark/kenny.png", label: "Kenny McCormick", isSouthPark: true, color: "#F97316" },
  { key: "southpark_butters", path: "/southpark/butters.png", label: "Butters Stotch", isSouthPark: true, color: "#06B6D4" },
];

// All available worker sprites
export const ALL_WORKER_SPRITES: WorkerSpriteConfig[] = [
  ...WORKER_SPRITES,
  ...SOUTH_PARK_SPRITES,
];

// Character storage key
export const CHARACTER_STORAGE_KEY = "agent-town:selected-character";

// Get selected character from localStorage
export function getSelectedCharacter(): string {
  if (typeof window === "undefined") return "character_02";
  return localStorage.getItem(CHARACTER_STORAGE_KEY) || "character_02";
}

// Set selected character in localStorage
export function setSelectedCharacter(characterId: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(CHARACTER_STORAGE_KEY, characterId);
  }
}

const directions = ["right", "up", "left", "down"] as const;
export type Direction = (typeof directions)[number];

export function makeAnims(spriteKey: string, prefix: string, row: number, frameRate: number): AnimDef[] {
  return directions.map((dir, i) => ({
    key: `${spriteKey}:${prefix}-${dir}`,
    start: row * SHEET_COLUMNS + i * FRAMES_PER_DIR,
    end: row * SHEET_COLUMNS + i * FRAMES_PER_DIR + FRAMES_PER_DIR - 1,
    frameRate,
    repeat: -1,
  }));
}

// Boss anims (legacy format without spriteKey prefix for backward compat)
function rowAnims(prefix: string, row: number, frameRate: number): AnimDef[] {
  return directions.map((dir, i) => ({
    key: `${prefix}-${dir}`,
    start: row * SHEET_COLUMNS + i * FRAMES_PER_DIR,
    end: row * SHEET_COLUMNS + i * FRAMES_PER_DIR + FRAMES_PER_DIR - 1,
    frameRate,
    repeat: -1,
  }));
}

// South Park character animation definitions (simplified 4-frame per direction)
export function makeSouthParkAnims(spriteKey: string, frameRate: number = 8): AnimDef[] {
  const anims: AnimDef[] = [];
  const baseFrame = 0;
  
  directions.forEach((dir, i) => {
    // Idle animation
    anims.push({
      key: `${spriteKey}:idle-${dir}`,
      start: baseFrame + i * FRAMES_PER_DIR,
      end: baseFrame + i * FRAMES_PER_DIR + 3,
      frameRate: frameRate,
      repeat: -1,
    });
    
    // Walk animation
    anims.push({
      key: `${spriteKey}:walk-${dir}`,
      start: baseFrame + i * FRAMES_PER_DIR,
      end: baseFrame + i * FRAMES_PER_DIR + 5,
      frameRate: frameRate + 2,
      repeat: -1,
    });
  });
  
  return anims;
}

export const IDLE_ANIMS = rowAnims("idle", 1, 8);
export const WALK_ANIMS = rowAnims("walk", 2, 10);
export const ALL_ANIMS: AnimDef[] = [...IDLE_ANIMS, ...WALK_ANIMS];

// Generate all South Park animations
export function getAllSouthParkAnims(): AnimDef[] {
  return SOUTH_PARK_SPRITES.flatMap(sprite => makeSouthParkAnims(sprite.key, 8));
}
