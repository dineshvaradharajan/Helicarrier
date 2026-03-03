import { NextRequest } from "next/server";
import { recipeService, parseRecipeYaml } from "@helicarrier/core";
import {
  getApiSession,
  unauthorized,
  forbidden,
  notFound,
  badRequest,
} from "@/lib/api-auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getApiSession(request);
  if (!user) return unauthorized();

  const { id } = await params;

  try {
    // Try by ID first, then by name
    let recipe;
    try {
      recipe = await recipeService.getById(id);
    } catch {
      recipe = await recipeService.getByName(id);
    }
    return Response.json(recipe);
  } catch {
    return notFound("Recipe not found");
  }
}

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

    let definition;
    if (body.yaml) {
      definition = parseRecipeYaml(body.yaml);
    } else if (body.definition) {
      definition = recipeService.validateDefinition(body.definition);
    }

    const recipe = await recipeService.update(id, {
      ...(definition && { definition }),
      ...(body.version && { version: body.version }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
      ...(body.agentIds && { agentIds: body.agentIds }),
    });

    return Response.json(recipe);
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

  const { id } = await params;

  try {
    await recipeService.delete(id);
    return Response.json({ success: true });
  } catch {
    return notFound("Recipe not found");
  }
}
