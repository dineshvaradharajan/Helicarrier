import { NextRequest } from "next/server";
import { appService } from "@helicarrier/core";
import { getApiSession, unauthorized, notFound } from "@/lib/api-auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getApiSession(request);
  if (!user) return unauthorized();

  const { id } = await params;

  try {
    const app = await appService.getById(id);
    return Response.json(app);
  } catch {
    return notFound("App not found");
  }
}
