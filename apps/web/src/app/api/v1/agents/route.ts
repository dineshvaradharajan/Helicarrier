import { NextRequest } from "next/server";
import { agentRegistry } from "@helicarrier/core";
import { getApiSession, unauthorized } from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  const user = await getApiSession(request);
  if (!user) return unauthorized();

  const agents = agentRegistry.list().map((a) => ({
    id: a.id,
    name: a.name,
    description: a.description,
  }));

  return Response.json(agents);
}
