import { NextRequest } from "next/server";
import { appService, recipeService, scaffoldService } from "@helicarrier/core";
import {
  getApiSession,
  unauthorized,
  badRequest,
} from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  const user = await getApiSession(request);
  if (!user) return unauthorized();

  const apps =
    user.role === "admin"
      ? await appService.list()
      : await appService.list(user.id);

  return Response.json(apps);
}

export async function POST(request: NextRequest) {
  const user = await getApiSession(request);
  if (!user) return unauthorized();

  try {
    const body = await request.json();

    // Resolve recipe by name or ID
    let recipeId = body.recipeId ?? body.recipe;
    if (!recipeId) return badRequest("recipe is required");

    try {
      const recipe = await recipeService.getByName(recipeId);
      recipeId = recipe.id;
    } catch {
      // Assume it's already an ID
    }

    const app = await appService.create(
      { name: body.name, recipeId },
      user.id,
    );

    // Enrich response with theme + pipeline
    let scaffold = null;
    try {
      scaffold = await scaffoldService.getScaffoldConfig(app.id);
    } catch {
      // Non-critical — app still created
    }

    return Response.json(
      { ...app, theme: scaffold?.theme ?? null, pipeline: scaffold?.pipeline ?? [] },
      { status: 201 },
    );
  } catch (err) {
    return badRequest(err instanceof Error ? err.message : "Failed to create app");
  }
}
