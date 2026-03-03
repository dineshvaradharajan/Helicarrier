import { NextRequest } from "next/server";
import { userService } from "@helicarrier/core";
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

  const users = await userService.list();
  return Response.json(users);
}

export async function POST(request: NextRequest) {
  const user = await getApiSession(request);
  if (!user) return unauthorized();
  if (user.role !== "admin") return forbidden();

  try {
    const body = await request.json();
    const newUser = await userService.create(body);
    return Response.json(newUser, { status: 201 });
  } catch (err) {
    return badRequest(
      err instanceof Error ? err.message : "Failed to create user",
    );
  }
}
