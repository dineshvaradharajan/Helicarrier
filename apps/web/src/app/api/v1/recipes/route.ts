import { NextRequest } from "next/server";
import { recipeService, parseRecipeYaml } from "@helicarrier/core";
import {
  getApiSession,
  unauthorized,
  forbidden,
  badRequest,
} from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  const user = await getApiSession(request);
  if (!user) return unauthorized();

  const recipes = await recipeService.list();
  return Response.json(recipes);
}

export async function POST(request: NextRequest) {
  const user = await getApiSession(request);
  if (!user) return unauthorized();
  if (user.role !== "admin") return forbidden();

  try {
    const body = await request.json();

    let definition;
    if (body.yaml) {
      definition = parseRecipeYaml(body.yaml);
    } else if (body.definition) {
      definition = recipeService.validateDefinition(body.definition);
    } else {
      return badRequest("Provide either yaml or definition");
    }

    const recipe = await recipeService.create({
      name: definition.name,
      version: definition.version,
      definition,
      agentIds: definition.agents,
      themeId: body.themeId ?? null,
      pipelineStages: definition.pipeline ?? body.pipeline ?? [],
    });

    return Response.json(recipe, { status: 201 });
  } catch (err) {
    return badRequest(
      err instanceof Error ? err.message : "Invalid recipe",
    );
  }
}
