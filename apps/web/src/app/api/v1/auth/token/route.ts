import { NextRequest } from "next/server";
import { getApiSession, unauthorized } from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  const user = await getApiSession(request);
  if (!user) return unauthorized();

  return Response.json({
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    role: user.role,
  });
}

export async function POST(request: NextRequest) {
  const user = await getApiSession(request);
  if (!user) return unauthorized();

  return Response.json({
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    role: user.role,
  });
}
