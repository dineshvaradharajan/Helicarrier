import { NextRequest } from "next/server";
import { parseRecipeYaml } from "@helicarrier/core";
import { getApiSession, unauthorized, badRequest } from "@/lib/api-auth";

export async function POST(request: NextRequest) {
  const user = await getApiSession(request);
  if (!user) return unauthorized();

  try {
    const body = await request.json();
    if (!body.yaml) return badRequest("Provide yaml content");

    const definition = parseRecipeYaml(body.yaml);
    return Response.json({ valid: true, definition });
  } catch (err) {
    return badRequest(
      err instanceof Error ? err.message : "Invalid recipe",
    );
  }
}
