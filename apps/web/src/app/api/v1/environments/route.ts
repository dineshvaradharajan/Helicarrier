import { NextRequest } from "next/server";
import { environmentService } from "@helicarrier/core";
import {
  getApiSession,
  unauthorized,
  forbidden,
  badRequest,
} from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  const user = await getApiSession(request);
  if (!user) return unauthorized();

  const environments = await environmentService.list();
  return Response.json(environments);
}

export async function POST(request: NextRequest) {
  const user = await getApiSession(request);
  if (!user) return unauthorized();
  if (user.role !== "admin") return forbidden();

  try {
    const body = await request.json();
    const env = await environmentService.create(body);
    return Response.json(env, { status: 201 });
  } catch (err) {
    return badRequest(
      err instanceof Error ? err.message : "Failed to create environment",
    );
  }
}
