import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import {
  countSessions,
  createSession,
  deleteSession,
  getSession,
  listSessions,
} from "@/lib/server-store";

export const runtime = "nodejs";

// GET - List all sessions
export async function GET(request: NextRequest) {
  const authError = requireApiAuth(request);
  if (authError) return authError;

  const searchParams = request.nextUrl.searchParams;
  const limit = parseInt(searchParams.get("limit") || "20");
  const [sessions, total] = await Promise.all([
    listSessions(limit),
    countSessions(),
  ]);

  return NextResponse.json({
    sessions,
    total,
  });
}

// POST - Create a new session
export async function POST(request: NextRequest) {
  const authError = requireApiAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { label } = body;
    const session = await createSession(typeof label === "string" ? label : undefined);

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
  const authError = requireApiAuth(request);
  if (authError) return authError;

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

  const session = await getSession(sessionKey);
  if (!session) {
    return NextResponse.json(
      { error: `Session ${sessionKey} not found` },
      { status: 404 }
    );
  }

  await deleteSession(sessionKey);

  return NextResponse.json({
    success: true,
    message: `Session ${sessionKey} deleted`,
  });
}
