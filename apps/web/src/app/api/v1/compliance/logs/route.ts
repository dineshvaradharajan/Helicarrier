import { NextRequest } from "next/server";
import { complianceService } from "@helicarrier/core";
import { getApiSession, unauthorized } from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  const user = await getApiSession(request);
  if (!user) return unauthorized();

  const url = new URL(request.url);
  const appId = url.searchParams.get("appId");

  const checks = appId
    ? await complianceService.listByApp(appId)
    : await complianceService.listAll();

  return Response.json(checks);
}
