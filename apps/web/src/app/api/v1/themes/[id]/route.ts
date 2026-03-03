import { NextRequest } from "next/server";
import { themeService } from "@helicarrier/core";
import {
  getApiSession,
  unauthorized,
  forbidden,
  badRequest,
  notFound,
} from "@/lib/api-auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getApiSession(request);
  if (!user) return unauthorized();

  try {
    const { id } = await params;
    const theme = await themeService.getById(id);
    return Response.json(theme);
  } catch {
    return notFound("Theme not found");
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getApiSession(request);
  if (!user) return unauthorized();
  if (user.role !== "admin") return forbidden();

  try {
    const { id } = await params;
    const body = await request.json();
    const theme = await themeService.update(id, body);
    return Response.json(theme);
  } catch (err) {
    return badRequest(err instanceof Error ? err.message : "Update failed");
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getApiSession(request);
  if (!user) return unauthorized();
  if (user.role !== "admin") return forbidden();

  try {
    const { id } = await params;
    await themeService.delete(id);
    return Response.json({ success: true });
  } catch (err) {
    return badRequest(err instanceof Error ? err.message : "Delete failed");
  }
}
