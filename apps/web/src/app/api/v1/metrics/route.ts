import { NextRequest } from "next/server";
import {
  recipeService,
  appService,
  approvalService,
  complianceService,
  userService,
} from "@helicarrier/core";
import { getApiSession, unauthorized } from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  const user = await getApiSession(request);
  if (!user) return unauthorized();

  const [recipes, apps, pendingApprovals, recentChecks, users] =
    await Promise.all([
      recipeService.list(),
      appService.list(),
      approvalService.list("pending"),
      complianceService.listAll(10),
      userService.list(),
    ]);

  const passRate =
    recentChecks.length > 0
      ? Math.round(
          (recentChecks.filter((c) => c.status === "pass").length /
            recentChecks.length) *
            100,
        )
      : 100;

  return Response.json({
    recipes: recipes.length,
    apps: apps.length,
    pendingApprovals: pendingApprovals.length,
    compliancePassRate: passRate,
    users: users.length,
  });
}
