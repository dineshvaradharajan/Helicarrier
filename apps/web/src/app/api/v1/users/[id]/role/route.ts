import { NextRequest } from "next/server";
import { userService } from "@helicarrier/core";
import {
  getApiSession,
  unauthorized,
  forbidden,
  badRequest,
} from "@/lib/api-auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getApiSession(request);
  if (!user) return unauthorized();
  if (user.role !== "admin") return forbidden();

  const { id } = await params;

  try {
    const body = await request.json();
    if (!body.role) return badRequest("role is required");

    const updated = await userService.assignRole(id, body.role);
    return Response.json(updated);
  } catch (err) {
    return badRequest(
      err instanceof Error ? err.message : "Failed to update role",
    );
  }
}
