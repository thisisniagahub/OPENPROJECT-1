import { NextRequest, NextResponse } from "next/server";

// Health check endpoint
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: "ok",
    service: "agent-town-api",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    endpoints: [
      "GET /api/health - Health check",
      "GET /api/models - List available AI models",
      "POST /api/task - Create a new task",
      "GET /api/task - List tasks",
      "POST /api/session - Create session",
      "GET /api/session - List sessions",
    ],
  });
}
