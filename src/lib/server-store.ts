import { Prisma } from "@prisma/client";
import type { TaskStatus } from "@/types/game";
import { db } from "./db";

// OPENPROJECT-1 only creates user-facing NiagaBot sessions. Specialist workspaces stay external.
export const MAIN_SESSION_KEY = "agent:main:main";
const MAIN_SESSION_LABEL = "NiagaBot Main Session";
const USER_FACING_SESSION_KEY_PATTERN = /^agent:main:[A-Za-z0-9_-]+$/;
const VALID_TASK_STATUSES = new Set<TaskStatus>([
  "submitted",
  "queued",
  "returning",
  "running",
  "stopped",
  "completed",
  "failed",
]);

interface SessionRow {
  session_key: string;
  label: string | null;
  created_at: string;
  updated_at: string;
  message_count: number | bigint | null;
  task_count: number | bigint | null;
}

interface TaskRow {
  task_id: string;
  message: string;
  status: string;
  session_key: string;
  seat_id: string | null;
  actor_name: string | null;
  agent_id: string | null;
  openclaw_id: string | null;
  result: string | null;
  created_at: string;
  completed_at: string | null;
  run_id: string | null;
}

export interface PersistedSessionRecord {
  key: string;
  label?: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  taskCount: number;
}

export interface PersistedTaskRecord {
  id: string;
  message: string;
  status: TaskStatus;
  sessionKey: string;
  seatId?: string;
  actorName?: string;
  agentId?: string;
  openclawId?: string;
  result?: string;
  createdAt: string;
  completedAt?: string;
  runId?: string;
}

let initPromise: Promise<void> | null = null;

export type OperatorSessionKeyResolution =
  | { sessionKey: string }
  | { error: string };

function toNumber(value: number | bigint | null | undefined): number {
  if (typeof value === "bigint") return Number(value);
  if (typeof value === "number") return value;
  return 0;
}

function mapSession(row: SessionRow): PersistedSessionRecord {
  return {
    key: row.session_key,
    label: row.label ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    messageCount: toNumber(row.message_count),
    taskCount: toNumber(row.task_count),
  };
}

function mapTask(row: TaskRow): PersistedTaskRecord {
  return {
    id: row.task_id,
    message: row.message,
    status: row.status as TaskStatus,
    sessionKey: row.session_key,
    seatId: row.seat_id ?? undefined,
    actorName: row.actor_name ?? undefined,
    agentId: row.agent_id ?? undefined,
    openclawId: row.openclaw_id ?? undefined,
    result: row.result ?? undefined,
    createdAt: row.created_at,
    completedAt: row.completed_at ?? undefined,
    runId: row.run_id ?? undefined,
  };
}

async function ensureTaskColumn(column: string, definition: string) {
  try {
    await db.$executeRawUnsafe(
      `ALTER TABLE openproject_tasks ADD COLUMN ${column} ${definition}`,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!/duplicate column name/i.test(message)) {
      throw error;
    }
  }
}

async function ensureStoreReady() {
  if (!initPromise) {
    initPromise = (async () => {
      const now = new Date().toISOString();

      await db.$executeRawUnsafe("PRAGMA foreign_keys = ON");
      await db.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS openproject_sessions (
          session_key TEXT PRIMARY KEY,
          label TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          message_count INTEGER NOT NULL DEFAULT 0
        )
      `);
      await db.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS openproject_tasks (
          task_id TEXT PRIMARY KEY,
          message TEXT NOT NULL,
          status TEXT NOT NULL CHECK (status IN ('submitted', 'queued', 'returning', 'running', 'stopped', 'completed', 'failed')),
          session_key TEXT NOT NULL,
          seat_id TEXT,
          actor_name TEXT,
          agent_id TEXT,
          openclaw_id TEXT,
          result TEXT,
          created_at TEXT NOT NULL,
          completed_at TEXT,
          run_id TEXT,
          FOREIGN KEY (session_key) REFERENCES openproject_sessions(session_key) ON DELETE CASCADE
        )
      `);
      await ensureTaskColumn("agent_id", "TEXT");
      await ensureTaskColumn("openclaw_id", "TEXT");
      await db.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS idx_openproject_tasks_session_created
        ON openproject_tasks(session_key, created_at DESC)
      `);
      await db.$executeRaw`
        INSERT OR IGNORE INTO openproject_sessions (
          session_key,
          label,
          created_at,
          updated_at,
          message_count
        ) VALUES (${MAIN_SESSION_KEY}, ${MAIN_SESSION_LABEL}, ${now}, ${now}, 0)
      `;
    })().catch((error) => {
      initPromise = null;
      throw error;
    });
  }

  await initPromise;
}

function makeSessionQuery(whereClause: Prisma.Sql = Prisma.empty) {
  return Prisma.sql`
    SELECT
      s.session_key,
      s.label,
      s.created_at,
      s.updated_at,
      s.message_count,
      COUNT(t.task_id) AS task_count
    FROM openproject_sessions s
    LEFT JOIN openproject_tasks t ON t.session_key = s.session_key
    ${whereClause}
    GROUP BY s.session_key, s.label, s.created_at, s.updated_at, s.message_count
  `;
}

function buildTaskListQuery(filters: { sessionKey?: string; status?: TaskStatus }) {
  const clauses: Prisma.Sql[] = [];

  if (filters.sessionKey) {
    clauses.push(Prisma.sql`session_key = ${filters.sessionKey}`);
  }

  if (filters.status) {
    clauses.push(Prisma.sql`status = ${filters.status}`);
  }

  const whereClause =
    clauses.length > 0 ? Prisma.sql`WHERE ${Prisma.join(clauses, " AND ")}` : Prisma.empty;
  return { whereClause };
}

function randomSuffix(length: number) {
  return Math.random().toString(36).slice(2, 2 + length);
}

export function normalizeOperatorSessionKey(input: unknown): OperatorSessionKeyResolution {
  if (typeof input !== "string" || !input.trim()) {
    return { sessionKey: MAIN_SESSION_KEY };
  }

  const trimmed = input.trim();
  if (USER_FACING_SESSION_KEY_PATTERN.test(trimmed)) {
    return { sessionKey: trimmed };
  }

  return {
    error: `OPENPROJECT-1 only accepts NiagaBot session keys in the agent:main:* namespace. Received "${trimmed}".`,
  };
}

export function isTaskStatus(value: unknown): value is TaskStatus {
  return typeof value === "string" && VALID_TASK_STATUSES.has(value as TaskStatus);
}

export async function countSessions() {
  await ensureStoreReady();
  const rows = await db.$queryRaw<Array<{ count: number | bigint }>>`
    SELECT COUNT(*) AS count FROM openproject_sessions
  `;
  return toNumber(rows[0]?.count);
}

export async function listSessions(limit: number) {
  await ensureStoreReady();
  const safeLimit = Math.max(1, Math.min(limit, 100));
  const rows = await db.$queryRaw<SessionRow[]>(
    Prisma.sql`${makeSessionQuery()} ORDER BY datetime(s.created_at) DESC LIMIT ${safeLimit}`,
  );
  return rows.map(mapSession);
}

export async function getSession(sessionKey: string) {
  await ensureStoreReady();
  const rows = await db.$queryRaw<SessionRow[]>(
    Prisma.sql`${makeSessionQuery(Prisma.sql`WHERE s.session_key = ${sessionKey}`)} LIMIT 1`,
  );
  return rows[0] ? mapSession(rows[0]) : null;
}

export async function createSession(label?: string) {
  await ensureStoreReady();
  const totalSessions = await countSessions();
  const key = `agent:main:${Date.now()}_${randomSuffix(5)}`;
  const now = new Date().toISOString();
  const resolvedLabel = label?.trim() || `Session ${totalSessions + 1}`;

  await db.$executeRaw`
    INSERT INTO openproject_sessions (
      session_key,
      label,
      created_at,
      updated_at,
      message_count
    ) VALUES (${key}, ${resolvedLabel}, ${now}, ${now}, 0)
  `;

  return {
    key,
    label: resolvedLabel,
    createdAt: now,
    updatedAt: now,
    messageCount: 0,
    taskCount: 0,
  } satisfies PersistedSessionRecord;
}

export async function deleteSession(sessionKey: string) {
  await ensureStoreReady();
  await db.$executeRaw`DELETE FROM openproject_tasks WHERE session_key = ${sessionKey}`;
  const deleted = await db.$executeRaw`DELETE FROM openproject_sessions WHERE session_key = ${sessionKey}`;
  return deleted > 0;
}

export async function countTasks(filters: { sessionKey?: string; status?: TaskStatus } = {}) {
  await ensureStoreReady();
  const { whereClause } = buildTaskListQuery(filters);
  const rows = await db.$queryRaw<Array<{ count: number | bigint }>>(
    Prisma.sql`SELECT COUNT(*) AS count FROM openproject_tasks ${whereClause}`,
  );
  return toNumber(rows[0]?.count);
}

export async function listTasks(
  filters: { sessionKey?: string; status?: TaskStatus; limit: number },
) {
  await ensureStoreReady();
  const safeLimit = Math.max(1, Math.min(filters.limit, 200));
  const { whereClause } = buildTaskListQuery(filters);
  const rows = await db.$queryRaw<TaskRow[]>(
    Prisma.sql`
      SELECT
        task_id,
        message,
        status,
        session_key,
        seat_id,
        actor_name,
        agent_id,
        openclaw_id,
        result,
        created_at,
        completed_at,
        run_id
      FROM openproject_tasks
      ${whereClause}
      ORDER BY datetime(created_at) DESC
      LIMIT ${safeLimit}
    `,
  );
  return rows.map(mapTask);
}

export async function getTask(taskId: string) {
  await ensureStoreReady();
  const rows = await db.$queryRaw<TaskRow[]>(
    Prisma.sql`
      SELECT
        task_id,
        message,
        status,
        session_key,
        seat_id,
        actor_name,
        agent_id,
        openclaw_id,
        result,
        created_at,
        completed_at,
        run_id
      FROM openproject_tasks
      WHERE task_id = ${taskId}
      LIMIT 1
    `,
  );
  return rows[0] ? mapTask(rows[0]) : null;
}

export async function createTask(input: {
  message: string;
  sessionKey: string;
  seatId?: string;
  actorName?: string;
  agentId?: string;
  openclawId?: string;
}) {
  await ensureStoreReady();
  const session = await getSession(input.sessionKey);
  if (!session) return null;

  const id = `task_${Date.now()}_${randomSuffix(7)}`;
  const now = new Date().toISOString();

  await db.$executeRaw`
    INSERT INTO openproject_tasks (
      task_id,
      message,
      status,
      session_key,
      seat_id,
      actor_name,
      agent_id,
      openclaw_id,
      result,
      created_at,
      completed_at,
      run_id
    ) VALUES (
      ${id},
      ${input.message},
      ${"submitted"},
      ${input.sessionKey},
      ${input.seatId ?? null},
      ${input.actorName ?? null},
      ${input.agentId ?? null},
      ${input.openclawId ?? null},
      ${null},
      ${now},
      ${null},
      ${null}
    )
  `;
  await db.$executeRaw`
    UPDATE openproject_sessions SET updated_at = ${now} WHERE session_key = ${input.sessionKey}
  `;

  return {
    id,
    message: input.message,
    status: "submitted",
    sessionKey: input.sessionKey,
    seatId: input.seatId,
    actorName: input.actorName,
    agentId: input.agentId,
    openclawId: input.openclawId,
    createdAt: now,
  } satisfies PersistedTaskRecord;
}

export async function updateTask(input: {
  taskId: string;
  status?: TaskStatus;
  result?: string;
  runId?: string;
}) {
  await ensureStoreReady();
  const existing = await getTask(input.taskId);
  if (!existing) return null;

  const updates: Prisma.Sql[] = [];

  if (input.status !== undefined) {
    updates.push(Prisma.sql`status = ${input.status}`);
  }

  if (input.result !== undefined) {
    updates.push(Prisma.sql`result = ${input.result}`);
  }

  if (input.runId !== undefined) {
    updates.push(Prisma.sql`run_id = ${input.runId}`);
  }

  if (
    input.status === "completed" ||
    input.status === "failed" ||
    input.status === "stopped"
  ) {
    updates.push(Prisma.sql`completed_at = ${new Date().toISOString()}`);
  }

  if (updates.length === 0) {
    return existing;
  }

  await db.$executeRaw(
    Prisma.sql`UPDATE openproject_tasks SET ${Prisma.join(updates, ", ")} WHERE task_id = ${input.taskId}`,
  );

  return getTask(input.taskId);
}

export async function deleteTask(taskId: string) {
  await ensureStoreReady();
  const deleted = await db.$executeRaw`DELETE FROM openproject_tasks WHERE task_id = ${taskId}`;
  return deleted > 0;
}
