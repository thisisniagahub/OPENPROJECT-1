import { NextRequest, NextResponse } from "next/server";

// In-memory session store (in production, use a database)
const sessionStore = new Map<string, SessionRecord>();

interface SessionRecord {
  key: string;
  label?: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  taskCount: number;
}

function generateSessionKey(): string {
  return `agent:main:${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

// Initialize default session
sessionStore.set("agent:main:main", {
  key: "agent:main:main",
  label: "Main Session",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  messageCount: 0,
  taskCount: 0,
});

// GET - List all sessions
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const limit = parseInt(searchParams.get("limit") || "20");

  const sessions = Array.from(sessionStore.values())
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);

  return NextResponse.json({
    sessions,
    total: sessionStore.size,
  });
}

// POST - Create a new session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { label } = body;

    const session: SessionRecord = {
      key: generateSessionKey(),
      label: label || `Session ${sessionStore.size + 1}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messageCount: 0,
      taskCount: 0,
    };

    sessionStore.set(session.key, session);

    return NextResponse.json({
      success: true,
      session,
      message: "Session created successfully",
    }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}

// DELETE - Remove a session
export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sessionKey = searchParams.get("sessionKey");

  if (!sessionKey) {
    return NextResponse.json(
      { error: "sessionKey query parameter is required" },
      { status: 400 }
    );
  }

  // Don't allow deleting the main session
  if (sessionKey === "agent:main:main") {
    return NextResponse.json(
      { error: "Cannot delete the main session" },
      { status: 403 }
    );
  }

  if (!sessionStore.has(sessionKey)) {
    return NextResponse.json(
      { error: `Session ${sessionKey} not found` },
      { status: 404 }
    );
  }

  sessionStore.delete(sessionKey);

  return NextResponse.json({
    success: true,
    message: `Session ${sessionKey} deleted`,
  });
}
