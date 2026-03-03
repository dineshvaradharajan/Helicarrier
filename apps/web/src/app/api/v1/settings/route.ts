import { NextRequest } from "next/server";
import { settingsService } from "@helicarrier/core";
import {
  getApiSession,
  unauthorized,
  forbidden,
  badRequest,
} from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  const user = await getApiSession(request);
  if (!user) return unauthorized();
  if (user.role !== "admin") return forbidden();

  const all = await settingsService.getAll();
  return Response.json(all);
}

export async function PUT(request: NextRequest) {
  const user = await getApiSession(request);
  if (!user) return unauthorized();
  if (user.role !== "admin") return forbidden();

  try {
    const body = await request.json();

    if (!body.key || body.value === undefined) {
      return badRequest("key and value are required");
    }

    const setting = await settingsService.set(body.key, body.value);
    return Response.json(setting);
  } catch (err) {
    return badRequest(err instanceof Error ? err.message : "Update failed");
  }
}
