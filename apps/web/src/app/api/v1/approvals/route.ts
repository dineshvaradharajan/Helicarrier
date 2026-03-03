import { NextRequest } from "next/server";
import { approvalService } from "@helicarrier/core";
import { getApiSession, unauthorized } from "@/lib/api-auth";
import type { ApprovalStatus } from "@helicarrier/shared";

export async function GET(request: NextRequest) {
  const user = await getApiSession(request);
  if (!user) return unauthorized();

  const url = new URL(request.url);
  const status = url.searchParams.get("status") as ApprovalStatus | null;

  const approvals = status
    ? await approvalService.list(status)
    : await approvalService.list();

  return Response.json(approvals);
}
