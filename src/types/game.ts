// ─────────────────────────────────────────────────────────────────────────
// Studio Domain Types - Complete TypeScript definitions
// ─────────────────────────────────────────────────────────────────────────

// Connection status for gateway
export type ConnectionStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "error"
  | "auth_failed"
  | "unreachable"
  | "rate_limited";

// Direction facing for characters
export type Direction = "up" | "down" | "left" | "right";

// Seat facing direction
export type SeatFacing = Direction;

// Status of a seat (worker position)
export type SeatStatus = "empty" | "returning" | "running" | "done" | "failed";

// Task status
export type TaskStatus =
  | "submitted"
  | "queued"
  | "returning"
  | "running"
  | "stopped"
  | "completed"
  | "failed";

// Chat message role
export type ChatRole = "user" | "assistant" | "system" | "tool";

// ─────────────────────────────────────────────────────────────────────────
// Seat State
// ─────────────────────────────────────────────────────────────────────────

export interface SeatState {
  /** Unique seat identifier */
  seatId: string;
  /** Display label for the seat */
  label: string;
  /** Role/title of the worker */
  roleTitle?: string;
  /** Whether a worker is assigned to this seat */
  assigned?: boolean;
  /** Sprite key for the worker */
  spriteKey?: string;
  /** Path to sprite image */
  spritePath?: string;
  /** Spawn X position in pixels */
  spawnX?: number;
  /** Spawn Y position in pixels */
  spawnY?: number;
  /** Direction the worker faces when seated */
  spawnFacing?: SeatFacing;
  /** Current status of the seat */
  status: SeatStatus;
  /** Current task snippet being displayed */
  taskSnippet?: string;
  /** Current run ID if a task is running */
  runId?: string;
  /** When the current task started */
  startedAt?: string;
}

// ─────────────────────────────────────────────────────────────────────────
// Task Item
// ─────────────────────────────────────────────────────────────────────────

export interface TaskItem {
  /** Unique task identifier */
  taskId: string;
  /** Task message/prompt */
  message: string;
  /** Current status */
  status: TaskStatus;
  /** Associated run ID from gateway */
  runId?: string;
  /** Seat this task is assigned to */
  seatId?: string;
  /** Session key for grouping */
  sessionKey: string;
  /** Actor name (worker) handling this task */
  actorName?: string;
  /** Result/completion message */
  result?: string;
  /** When task was created */
  createdAt: string;
  /** When task completed */
  completedAt?: string;
}

// ─────────────────────────────────────────────────────────────────────────
// Chat Messages
// ─────────────────────────────────────────────────────────────────────────

export interface ChatMessageBase {
  /** Unique message identifier */
  id: string;
  /** Associated run ID */
  runId: string;
  /** When message was created */
  timestamp: string;
  /** Session key for grouping */
  sessionKey: string;
  /** Actor name (worker) if applicable */
  actorName?: string;
}

export interface TextChatMessage extends ChatMessageBase {
  /** Message role */
  role: "user" | "assistant" | "system";
  /** Message content */
  content: string;
  /** Whether message is still streaming */
  streaming?: boolean;
}

export interface ToolChatMessage extends ChatMessageBase {
  /** Message role (always tool) */
  role: "tool";
  /** Tool call content */
  content: string;
  /** Tool name */
  toolName: string;
  /** Tool input arguments */
  toolInput?: string;
  /** Tool output/result */
  toolOutput?: string;
}

export type ChatMessage = TextChatMessage | ToolChatMessage;

// Type guard for TextChatMessage
export function isTextMessage(msg: ChatMessage): msg is TextChatMessage {
  return msg.role !== "tool";
}

// Type guard for ToolChatMessage
export function isToolMessage(msg: ChatMessage): msg is ToolChatMessage {
  return msg.role === "tool";
}

// ─────────────────────────────────────────────────────────────────────────
// Gateway Configuration
// ─────────────────────────────────────────────────────────────────────────

export interface GatewayConfig {
  /** WebSocket URL for gateway */
  url: string;
  /** Authentication token */
  token: string;
}

// ─────────────────────────────────────────────────────────────────────────
// Session Types
// ─────────────────────────────────────────────────────────────────────────

export interface SessionMetrics {
  /** Tokens used in current session */
  usedTokens?: number;
  /** Maximum context tokens */
  maxContextTokens?: number;
  /** Input tokens used */
  inputTokens?: number;
  /** Output tokens used */
  outputTokens?: number;
  /** Whether context is fresh (not from cache) */
  fresh: boolean;
  /** Current model name */
  model?: string;
  /** Provider name */
  provider?: string;
  /** When metrics were last updated */
  updatedAt?: string;
}

export interface SessionRecord {
  /** Unique session key */
  key: string;
  /** Display label */
  label?: string;
  /** When session was created */
  createdAt: string;
}

// ─────────────────────────────────────────────────────────────────────────
// Studio Snapshot (Main State)
// ─────────────────────────────────────────────────────────────────────────

export interface StudioSnapshot {
  /** Gateway connection status */
  connection: ConnectionStatus;
  /** All seats in the office */
  seats: SeatState[];
  /** All tasks */
  tasks: TaskItem[];
  /** All chat messages */
  chatMessages: ChatMessage[];
  /** Currently active session key */
  activeSessionKey?: string;
  /** Current session metrics */
  sessionMetrics: SessionMetrics;
  /** All sessions */
  sessions: SessionRecord[];
}

// ─────────────────────────────────────────────────────────────────────────
// Worker Types (Game-specific)
// ─────────────────────────────────────────────────────────────────────────

export type WorkerStatus = "idle" | "working" | "done" | "failed";

export interface WorkerState {
  /** Worker identifier */
  id: string;
  /** Seat ID this worker is assigned to */
  seatId: string;
  /** Worker name/label */
  label: string;
  /** Current status */
  status: WorkerStatus;
  /** Current X position in pixels */
  x: number;
  /** Current Y position in pixels */
  y: number;
  /** Direction worker is facing */
  facing: Direction;
  /** Sprite key for rendering */
  spriteKey: string;
  /** Current run ID if working */
  runId?: string;
  /** Current task message */
  taskMessage?: string;
}

// ─────────────────────────────────────────────────────────────────────────
// POI (Points of Interest) Types
// ─────────────────────────────────────────────────────────────────────────

export interface POI {
  /** POI identifier */
  id: string;
  /** Type of POI (water, coffee, printer, etc.) */
  type: string;
  /** X position in pixels */
  x: number;
  /** Y position in pixels */
  y: number;
  /** Interaction radius */
  radius?: number;
}

// ─────────────────────────────────────────────────────────────────────────
// Game Events
// ─────────────────────────────────────────────────────────────────────────

export interface GameEventMap {
  "seats-discovered": SeatState[];
  "seat-configs-updated": SeatState[];
  "task-assigned": [taskId: string, message: string, seatId?: string];
  "task-ready": [taskId: string, message: string, seatId?: string];
  "task-routed": [taskId: string, seatId: string, actorName: string];
  "task-staged": [taskId: string, stage: string, seatId?: string];
  "task-bound": [taskId: string, runId: string];
  "task-bubble": [runId: string, text: string, ttl?: number];
  "task-completed": string;
  "task-failed": string;
  "task-aborted": string;
  "stop-task": [runId: string, seatId?: string];
  "subagent-assigned": [runId: string, parentRunId: string, label: string];
  "open-terminal": [seatId?: string];
  "open-terminal-queue": [seatId: string];
  "terminal-closed": void;
}

// ─────────────────────────────────────────────────────────────────────────
// API Response Types
// ─────────────────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface TaskListResponse {
  tasks: TaskItem[];
  total: number;
  filtered: number;
}

export interface SessionListResponse {
  sessions: SessionRecord[];
  total: number;
}

export interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  contextWindow?: number;
  description?: string;
}

export interface ModelsListResponse {
  models: ModelInfo[];
  total: number;
  defaultModel?: string;
}
