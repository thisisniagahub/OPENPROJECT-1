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

// Boss character fallback (player-controlled)
export const BOSS_SPRITE_KEY = "character_09";
export const BOSS_SPRITE_PATH = "/characters/Premade_Character_48x48_09.png";

// Keep legacy exports for fallback/preload compatibility
export const SPRITE_KEY = BOSS_SPRITE_KEY;
export const SPRITE_PATH = BOSS_SPRITE_PATH;

export interface WorkerSpriteConfig {
  key: string;
  path: string;
  label: string;
  /** OPENPROJECT agent ID (e.g. "a1", "b3") */
  agentId?: string;
  /** Department (intel, content, commerce, ops, research, labs) */
  dept?: string;
  /** Agent code (e.g. "TIA", "CSA") */
  agentCode?: string;
  /** OpenClaw workspace agent ID */
  openclawId?: string;
  color?: string;
  personality?: string;
  catchphrases?: string[];
}

/**
 * OPENPROJECT Agency Workers — 24 agents across 6 departments.
 * Ported from niagabot-office/src/agents/agentData.js and expanded for
 * external social-growth-suite / brand-research-agent mappings plus the
 * NiagaBot/main entry agent.
 *
 * Character sprites cycle through Premade_Character_48x48_02..10.
 * Colors match department palette from niagabot-office constants.
 */
export const WORKER_SPRITES: WorkerSpriteConfig[] = [
  // ── Intel Department (3 agents) ──
  { key: "character_02", path: "/characters/Premade_Character_48x48_02.png", label: "Trend Intel", agentId: "a1", dept: "intel", agentCode: "TIA", openclawId: "trend-intelligence-agent", color: "#4fc3f7", personality: "Trend detection specialist — scans TikTok, IG, X for viral patterns", catchphrases: ["Trend detected!", "This is going viral...", "Hashtag analysis done!"] },
  { key: "character_03", path: "/characters/Premade_Character_48x48_03.png", label: "Competitor Spy", agentId: "a2", dept: "intel", agentCode: "CSA", color: "#4fc3f7", personality: "Competitor monitoring — strategy analysis and gap detection", catchphrases: ["Scanning competitors...", "Gap detected!", "Strategy report ready."] },
  { key: "character_04", path: "/characters/Premade_Character_48x48_04.png", label: "Audience Profiler", agentId: "a3", dept: "intel", agentCode: "APA", color: "#4fc3f7", personality: "Demographic analysis, interest mapping, behavior prediction", catchphrases: ["Profiling audience...", "Demographic mapped!", "Pattern emerging~"] },
  // ── Content Department (4 agents) ──
  { key: "character_05", path: "/characters/Premade_Character_48x48_05.png", label: "TikTok Viral", agentId: "b1", dept: "content", agentCode: "TVA", openclawId: "tiktok-viral-agent", color: "#ff6eb4", personality: "Script writing, hook optimization, sound selection for TikTok", catchphrases: ["Script ready!", "This hook slaps!", "Sound selected~"] },
  { key: "character_06", path: "/characters/Premade_Character_48x48_06.png", label: "Instagram Growth", agentId: "b2", dept: "content", agentCode: "IGA", openclawId: "instagram-reels-agent", color: "#ff6eb4", personality: "Reel concepts, carousel design, caption writing for Instagram", catchphrases: ["Reel concept done!", "Caption optimized~", "Carousel designed!"] },
  { key: "character_06", path: "/characters/Premade_Character_48x48_06.png", label: "Hook & Script", agentId: "b3", dept: "content", agentCode: "HSA", openclawId: "hook-script-agent", color: "#ff6eb4", personality: "Copywriting, A/B testing, emotional triggers across all platforms", catchphrases: ["Hook written!", "A/B test launched~", "Emotional trigger set!"] },
  { key: "character_05", path: "/characters/Premade_Character_48x48_05.png", label: "Email Copy", agentId: "b4", dept: "content", agentCode: "ECA", color: "#ff6eb4", personality: "Email sequences, subject lines, CTA optimization", catchphrases: ["Subject line ready!", "CTA optimized~", "Email sequence done!"] },
  // ── Commerce Department (4 agents) ──
  { key: "character_09", path: "/characters/Premade_Character_48x48_09.png", label: "Affiliate Scout", agentId: "c1", dept: "commerce", agentCode: "ASA", openclawId: "affiliate-product-scout-agent", color: "#ffb347", personality: "Program discovery, commission optimization on Shopee/Lazada", catchphrases: ["Affiliate found!", "Commission optimized~", "Partner vetted!"] },
  { key: "character_06", path: "/characters/Premade_Character_48x48_06.png", label: "Shopee Optimizer", agentId: "c2", dept: "commerce", agentCode: "SOA", openclawId: "shopee-commerce-agent", color: "#ffb347", personality: "Listing optimization, keyword targeting, price monitoring on Shopee", catchphrases: ["Listing optimized!", "Keywords targeted~", "Price tracked!"] },
  { key: "character_02", path: "/characters/Premade_Character_48x48_02.png", label: "TikTok Shop", agentId: "c3", dept: "commerce", agentCode: "TSA", openclawId: "tiktok-shop-agent", color: "#ffb347", personality: "Product showcase, live selling, shop management on TikTok Shop", catchphrases: ["Shop updated!", "Live selling ready~", "Product listed!"] },
  { key: "character_03", path: "/characters/Premade_Character_48x48_03.png", label: "Budget Tracker", agentId: "c4", dept: "commerce", agentCode: "BTA", color: "#ffb347", personality: "Expense tracking, ROI calculation, budget optimization", catchphrases: ["Budget tracked!", "ROI calculated~", "Expenses logged!"] },
  // ── Ops Department (2 agents) ──
  { key: "character_04", path: "/characters/Premade_Character_48x48_04.png", label: "Scheduler", agentId: "d1", dept: "ops", agentCode: "SCA", openclawId: "scheduler-publisher-agent", color: "#8c9eff", personality: "Queue management, priority routing, conflict resolution for OpenClaw", catchphrases: ["Queue managed!", "Priority set~", "Conflict resolved!"] },
  { key: "character_05", path: "/characters/Premade_Character_48x48_05.png", label: "Fallback Guard", agentId: "d2", dept: "ops", agentCode: "FGA", color: "#8c9eff", personality: "Error recovery, state preservation, alert management for OpenClaw", catchphrases: ["Recovery active!", "State preserved~", "Alert handled!"] },
  // ── Research Department (1 agent) ──
  { key: "character_06", path: "/characters/Premade_Character_48x48_06.png", label: "Brand Research", agentId: "e1", dept: "research", agentCode: "BRA", openclawId: "brand-research-agent", color: "#80cbc4", personality: "Brand audit, market signals, competitor deep-dive, sentiment analysis", catchphrases: ["Researching...", "Signal detected!", "Sentiment analyzed~"] },
  // ── Labs Department (2 agents) ──
  { key: "character_07", path: "/characters/Premade_Character_48x48_07.png", label: "Prompt Eng", agentId: "f1", dept: "labs", agentCode: "PEA", color: "#b388ff", personality: "Prompt design, chain optimization, model evaluation", catchphrases: ["Prompt crafted!", "Chain optimized~", "Model evaluated!"] },
  { key: "character_08", path: "/characters/Premade_Character_48x48_08.png", label: "A/B Test", agentId: "f2", dept: "labs", agentCode: "ABA", openclawId: "analytics-optimizer-agent", color: "#b388ff", personality: "Experiment design, statistical analysis, result documentation", catchphrases: ["Experiment launched!", "Stats analyzed~", "Results documented!"] },
  // ── Social Growth Suite Expansion (8 agents) ──
  { key: "character_09", path: "/characters/Premade_Character_48x48_09.png", label: "Command Center", agentId: "g1", dept: "ops", agentCode: "SCC", openclawId: "main", color: "#8c9eff", personality: "Default orchestrator — clarifies goals, delegates to specialists, synthesizes results", catchphrases: ["Delegating task...", "Routing to specialist~", "Mission coordinated!"] },
  { key: "character_10", path: "/characters/Premade_Character_48x48_10.png", label: "Facebook Dist", agentId: "g2", dept: "content", agentCode: "FDA", openclawId: "facebook-distribution-agent", color: "#ff6eb4", personality: "Facebook content distribution, audience targeting, engagement optimization", catchphrases: ["Post scheduled!", "Audience targeted~", "Engagement boosted!"] },
  { key: "character_02", path: "/characters/Premade_Character_48x48_02.png", label: "YouTube Growth", agentId: "g3", dept: "content", agentCode: "YGA", openclawId: "youtube-growth-agent", color: "#ff6eb4", personality: "YouTube growth packaging, thumbnail strategy, SEO optimization", catchphrases: ["Video optimized!", "Thumbnail ready~", "SEO boosted!"] },
  { key: "character_03", path: "/characters/Premade_Character_48x48_03.png", label: "Compliance Gate", agentId: "g4", dept: "commerce", agentCode: "ACG", openclawId: "affiliate-compliance-gate-agent", color: "#ffb347", personality: "Compliance checks, approval gates, policy enforcement for affiliates", catchphrases: ["Compliance checked!", "Policy verified~", "Approved!"] },
  { key: "character_04", path: "/characters/Premade_Character_48x48_04.png", label: "Content Factory", agentId: "g5", dept: "content", agentCode: "CCF", openclawId: "commerce-content-factory-agent", color: "#ff6eb4", personality: "Commerce content pack generation, product visuals, sales copy", catchphrases: ["Content pack ready!", "Visuals generated~", "Sales copy done!"] },
  { key: "character_05", path: "/characters/Premade_Character_48x48_05.png", label: "Sales Optimizer", agentId: "g6", dept: "commerce", agentCode: "CSO", openclawId: "commerce-sales-optimizer-agent", color: "#ffb347", personality: "Conversion optimization, sales funnel analysis, revenue maximization", catchphrases: ["Funnel optimized!", "Conversion up~", "Revenue maximized!"] },
  { key: "character_06", path: "/characters/Premade_Character_48x48_06.png", label: "Visual Director", agentId: "g7", dept: "content", agentCode: "VPD", openclawId: "visual-prompt-director-agent", color: "#ff6eb4", personality: "Image and video prompt direction, visual consistency across platforms", catchphrases: ["Visual ready!", "Prompt directed~", "Consistency locked!"] },
  { key: "character_07", path: "/characters/Premade_Character_48x48_07.png", label: "Canva Growth", agentId: "g8", dept: "content", agentCode: "CGO", openclawId: "canva-growth-operator-agent", color: "#ff6eb4", personality: "Canva design, lead capture, proposal assets, inbound growth operations", catchphrases: ["Design ready!", "Lead captured~", "Proposal asset done!"] },
];

// All available worker sprites (single unified list — no more South Park)
export const ALL_WORKER_SPRITES: WorkerSpriteConfig[] = WORKER_SPRITES;

// Character storage key
export const CHARACTER_STORAGE_KEY = "agent-town:selected-character";
export const OPERATIVE_CHANGED_EVENT = "agent-town:operative-changed";
export const DEFAULT_OPERATIVE_AGENT_ID =
  WORKER_SPRITES.find((sprite) => sprite.agentId)?.agentId ?? "a1";

export function getWorkerSpriteByAgentId(agentId: string): WorkerSpriteConfig | undefined {
  return ALL_WORKER_SPRITES.find((sprite) => sprite.agentId === agentId);
}

function normalizeStoredOperativeId(value: string | null | undefined): string {
  if (!value) return DEFAULT_OPERATIVE_AGENT_ID;
  const byAgentId = getWorkerSpriteByAgentId(value);
  if (byAgentId?.agentId) return byAgentId.agentId;

  const legacyBySpriteKey = ALL_WORKER_SPRITES.find(
    (sprite) => sprite.key === value && sprite.agentId,
  );
  return legacyBySpriteKey?.agentId ?? DEFAULT_OPERATIVE_AGENT_ID;
}

// Get selected operative from localStorage
export function getSelectedCharacter(): string {
  if (typeof window === "undefined") return DEFAULT_OPERATIVE_AGENT_ID;
  return normalizeStoredOperativeId(localStorage.getItem(CHARACTER_STORAGE_KEY));
}

// Set selected operative in localStorage
export function setSelectedCharacter(characterId: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(
      CHARACTER_STORAGE_KEY,
      normalizeStoredOperativeId(characterId),
    );
  }
}

// Get character config by unique agent ID, with sprite-key fallback for legacy callers
export function getCharacterConfig(id: string): WorkerSpriteConfig | undefined {
  return getWorkerSpriteByAgentId(id) ?? ALL_WORKER_SPRITES.find((sprite) => sprite.key === id);
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

export const IDLE_ANIMS = rowAnims("idle", 1, 8);
export const WALK_ANIMS = rowAnims("walk", 2, 10);
export const ALL_ANIMS: AnimDef[] = [...IDLE_ANIMS, ...WALK_ANIMS];

// Get random catchphrase for character
export function getRandomCatchphrase(characterKey: string): string {
  const config = getCharacterConfig(characterKey);
  if (!config?.catchphrases?.length) return "...";
  return config.catchphrases[Math.floor(Math.random() * config.catchphrases.length)];
}
