import { NextRequest } from "next/server";
import { approvalService, agentRunner, appService, recipeService } from "@helicarrier/core";
import {
  getApiSession,
  unauthorized,
  forbidden,
  badRequest,
} from "@/lib/api-auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getApiSession(request);
  if (!user) return unauthorized();
  if (user.role !== "admin") return forbidden();

  const { id } = await params;

  try {
    const body = await request.json();
    const approval = await approvalService.resolve(
      {
        approvalId: id,
        status: body.status,
        reason: body.reason,
      },
      user.id,
    );

    // If approved library addition, run compliance agents
    if (
      approval.status === "approved" &&
      approval.type === "library_addition"
    ) {
      try {
        const app = await appService.getById(approval.appId);
        const recipe = await recipeService.getById(app.recipeId);
        const agentIds = (recipe.agentIds ?? []) as string[];
        if (agentIds.length > 0) {
          await agentRunner.runForApp(
            approval.appId,
            agentIds,
            "approval_resolved",
          );
        }
      } catch {
        // Non-critical: compliance run failure shouldn't block approval
      }
    }

    return Response.json(approval);
  } catch (err) {
    return badRequest(
      err instanceof Error ? err.message : "Failed to resolve approval",
    );
  }
}
