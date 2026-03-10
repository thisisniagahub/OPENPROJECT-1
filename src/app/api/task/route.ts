import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import {
  countTasks,
  createTask,
  deleteTask,
  getSession,
  getTask,
  isTaskStatus,
  listTasks,
  normalizeOperatorSessionKey,
  updateTask,
} from "@/lib/server-store";

export const runtime = "nodejs";

// GET - List all tasks
export async function GET(request: NextRequest) {
  const authError = requireApiAuth(request);
  if (authError) return authError;

  const searchParams = request.nextUrl.searchParams;
  const sessionKey = searchParams.get("sessionKey");
  const statusParam = searchParams.get("status");
  const limit = parseInt(searchParams.get("limit") || "50");

  if (statusParam && !isTaskStatus(statusParam)) {
    return NextResponse.json(
      { error: `Unsupported status "${statusParam}"` },
      { status: 400 },
    );
  }

  const status = statusParam && isTaskStatus(statusParam) ? statusParam : undefined;
  const [tasks, total, filtered] = await Promise.all([
    listTasks({ sessionKey: sessionKey ?? undefined, status, limit }),
    countTasks(),
    countTasks({ sessionKey: sessionKey ?? undefined, status }),
  ]);

  return NextResponse.json({
    tasks,
    total,
    filtered,
  });
}

// POST - Create a new task
export async function POST(request: NextRequest) {
  const authError = requireApiAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { message, sessionKey, seatId, actorName, agentId, openclawId } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "message is required and must be a string" },
        { status: 400 }
      );
    }

    const sessionResolution = normalizeOperatorSessionKey(sessionKey);
    if ("error" in sessionResolution) {
      return NextResponse.json(
        { error: sessionResolution.error },
        { status: 400 },
      );
    }

    const resolvedSessionKey = sessionResolution.sessionKey;
    const session = await getSession(resolvedSessionKey);
    if (!session) {
      return NextResponse.json(
        { error: `Session ${resolvedSessionKey} not found` },
        { status: 404 },
      );
    }

    const task = await createTask({
      message: message.trim(),
      sessionKey: resolvedSessionKey,
      seatId: typeof seatId === "string" ? seatId : undefined,
      actorName: typeof actorName === "string" ? actorName : undefined,
      agentId: typeof agentId === "string" ? agentId : undefined,
      openclawId: typeof openclawId === "string" ? openclawId : undefined,
    });
    if (!task) {
      return NextResponse.json(
        { error: "Failed to create task" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      task,
      message: "Task created successfully",
    }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}

// PATCH - Update task status
export async function PATCH(request: NextRequest) {
  const authError = requireApiAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { taskId, status, result, runId } = body;

    if (!taskId) {
      return NextResponse.json(
        { error: "taskId is required" },
        { status: 400 }
      );
    }

    if (status !== undefined && !isTaskStatus(status)) {
      return NextResponse.json(
        { error: `Unsupported status "${status}"` },
        { status: 400 },
      );
    }

    const task = await updateTask({
      taskId,
      status,
      result: typeof result === "string" ? result : result === null ? "" : undefined,
      runId: typeof runId === "string" ? runId : undefined,
    });
    if (!task) {
      return NextResponse.json(
        { error: `Task ${taskId} not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      task,
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}

// DELETE - Remove a task
export async function DELETE(request: NextRequest) {
  const authError = requireApiAuth(request);
  if (authError) return authError;

  const searchParams = request.nextUrl.searchParams;
  const taskId = searchParams.get("taskId");

  if (!taskId) {
    return NextResponse.json(
      { error: "taskId query parameter is required" },
      { status: 400 }
    );
  }

  const task = await getTask(taskId);
  if (!task) {
    return NextResponse.json(
      { error: `Task ${taskId} not found` },
      { status: 404 }
    );
  }

  await deleteTask(taskId);

  return NextResponse.json({
    success: true,
    message: `Task ${taskId} deleted`,
  });
}
