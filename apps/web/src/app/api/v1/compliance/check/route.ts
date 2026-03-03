import { NextRequest } from "next/server";
import { agentRunner, appService, recipeService, agentRegistry } from "@helicarrier/core";
import { getApiSession, unauthorized, badRequest } from "@/lib/api-auth";

export async function POST(request: NextRequest) {
  const user = await getApiSession(request);
  if (!user) return unauthorized();

  try {
    const body = await request.json();
    if (!body.appId) return badRequest("appId is required");

    let agentIds = body.agentIds as string[] | undefined;

    if (!agentIds || agentIds.length === 0) {
      // Use agents from the app's recipe
      const app = await appService.getById(body.appId);
      const recipe = await recipeService.getById(app.recipeId);
      agentIds = (recipe.agentIds ?? []) as string[];
    }

    if (agentIds.length === 0) {
      agentIds = agentRegistry.list().map((a) => a.id);
    }

    const results = await agentRunner.runForApp(
      body.appId,
      agentIds,
      user.id,
    );

    return Response.json(results);
  } catch (err) {
    return badRequest(
      err instanceof Error ? err.message : "Compliance check failed",
    );
  }
}
