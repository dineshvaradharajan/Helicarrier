import { NextRequest } from "next/server";
import { auth } from "./auth";
import { authService } from "@helicarrier/core";
import type { User } from "@helicarrier/shared";

export async function getApiSession(
  request: NextRequest,
): Promise<User | null> {
  // Try bearer token first (CLI clients)
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    try {
      return await authService.validateApiKey(token);
    } catch {
      return null;
    }
  }

  // Fall back to session cookie (dashboard)
  const session = await auth();
  if (session?.user?.id) {
    try {
      return await authService.getUserById(session.user.id);
    } catch {
      return null;
    }
  }

  return null;
}

export function unauthorized() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}

export function forbidden() {
  return Response.json({ error: "Forbidden" }, { status: 403 });
}

export function badRequest(message: string) {
  return Response.json({ error: message }, { status: 400 });
}

export function notFound(message: string) {
  return Response.json({ error: message }, { status: 404 });
}
