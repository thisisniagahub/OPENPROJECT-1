import { timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

function readBearerToken(request: NextRequest): string {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) return "";

  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() ?? "";
}

function secureCompare(expected: string, actual: string): boolean {
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(actual);

  if (expectedBuffer.length !== actualBuffer.length) return false;
  return timingSafeEqual(expectedBuffer, actualBuffer);
}

export function requireApiAuth(request: NextRequest) {
  const expectedToken = process.env.OPENPROJECT_API_TOKEN?.trim();
  if (!expectedToken) {
    return NextResponse.json(
      { error: "OPENPROJECT_API_TOKEN is not configured" },
      { status: 503 },
    );
  }

  const providedToken =
    request.headers.get("x-openproject-api-token")?.trim() ||
    readBearerToken(request);

  if (!providedToken || !secureCompare(expectedToken, providedToken)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      {
        status: 401,
        headers: { "WWW-Authenticate": 'Bearer realm="openproject-api"' },
      },
    );
  }

  return null;
}
