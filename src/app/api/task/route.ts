import { NextRequest, NextResponse } from "next/server";

// In-memory task store (in production, use a database)
const taskStore = new Map<string, TaskRecord>();

interface TaskRecord {
  id: string;
  message: string;
  status: "pending" | "running" | "completed" | "failed" | "stopped";
  sessionKey: string;
  seatId?: string;
  actorName?: string;
  result?: string;
  createdAt: string;
  completedAt?: string;
  runId?: string;
}

function generateTaskId(): string {
  return `task_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// GET - List all tasks
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sessionKey = searchParams.get("sessionKey");
  const status = searchParams.get("status");
  const limit = parseInt(searchParams.get("limit") || "50");

  let tasks = Array.from(taskStore.values());

  // Filter by session
  if (sessionKey) {
    tasks = tasks.filter(t => t.sessionKey === sessionKey);
  }

  // Filter by status
  if (status) {
    tasks = tasks.filter(t => t.status === status);
  }

  // Sort by creation date (newest first)
  tasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Apply limit
  tasks = tasks.slice(0, limit);

  return NextResponse.json({
    tasks,
    total: taskStore.size,
    filtered: tasks.length,
  });
}

// POST - Create a new task
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, sessionKey, seatId, actorName } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "message is required and must be a string" },
        { status: 400 }
      );
    }

    const task: TaskRecord = {
      id: generateTaskId(),
      message,
      status: "pending",
      sessionKey: sessionKey || "agent:main:main",
      seatId,
      actorName,
      createdAt: new Date().toISOString(),
    };

    taskStore.set(task.id, task);

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
  try {
    const body = await request.json();
    const { taskId, status, result, runId } = body;

    if (!taskId) {
      return NextResponse.json(
        { error: "taskId is required" },
        { status: 400 }
      );
    }

    const task = taskStore.get(taskId);
    if (!task) {
      return NextResponse.json(
        { error: `Task ${taskId} not found` },
        { status: 404 }
      );
    }

    // Update task
    if (status) task.status = status;
    if (result !== undefined) task.result = result;
    if (runId !== undefined) task.runId = runId;
    if (status === "completed" || status === "failed" || status === "stopped") {
      task.completedAt = new Date().toISOString();
    }

    taskStore.set(taskId, task);

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
  const searchParams = request.nextUrl.searchParams;
  const taskId = searchParams.get("taskId");

  if (!taskId) {
    return NextResponse.json(
      { error: "taskId query parameter is required" },
      { status: 400 }
    );
  }

  if (!taskStore.has(taskId)) {
    return NextResponse.json(
      { error: `Task ${taskId} not found` },
      { status: 404 }
    );
  }

  taskStore.delete(taskId);

  return NextResponse.json({
    success: true,
    message: `Task ${taskId} deleted`,
  });
}
