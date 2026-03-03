import { NextRequest } from "next/server";
import { themeService } from "@helicarrier/core";
import {
  getApiSession,
  unauthorized,
  forbidden,
  badRequest,
} from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  const user = await getApiSession(request);
  if (!user) return unauthorized();

  const themes = await themeService.list();
  return Response.json(themes);
}

export async function POST(request: NextRequest) {
  const user = await getApiSession(request);
  if (!user) return unauthorized();
  if (user.role !== "admin") return forbidden();

  try {
    const body = await request.json();
    const theme = await themeService.create(body);
    return Response.json(theme, { status: 201 });
  } catch (err) {
    return badRequest(err instanceof Error ? err.message : "Invalid theme");
  }
}
