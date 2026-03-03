import { NextRequest } from "next/server";
import { approvalService, appService, agentRunner } from "@helicarrier/core";
import {
  getApiSession,
  unauthorized,
  badRequest,
} from "@/lib/api-auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getApiSession(request);
  if (!user) return unauthorized();

  const { id } = await params;

  try {
    const body = await request.json();
    if (!body.library) return badRequest("library is required");

    const result = await approvalService.checkLibrary(
      id,
      body.library,
      user.id,
    );

    // If auto-approved, add the library and run agents
    if (result.action === "auto_approved") {
      const app = await appService.addLibrary(id, body.library);

      // Trigger compliance agents
      const recipe = await import("@helicarrier/core").then((m) =>
        m.recipeService.getById(app.recipeId),
      );
      const agentIds = (recipe.agentIds ?? []) as string[];
      if (agentIds.length > 0) {
        await agentRunner.runForApp(id, agentIds, "library_addition");
      }
    }

    return Response.json(result);
  } catch (err) {
    return badRequest(
      err instanceof Error ? err.message : "Failed to add library",
    );
  }
}
