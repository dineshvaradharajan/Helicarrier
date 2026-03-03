import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db, approvals } from "@helicarrier/db";
import {
  type Approval,
  type ApprovalStatus,
  type ApprovalType,
  type ResolveApprovalInput,
  NotFoundError,
  ValidationError,
  resolveApprovalSchema,
} from "@helicarrier/shared";
import { recipeService } from "./recipe.service.js";
import { appService } from "./app.service.js";

export type LibraryCheckResult = {
  action: "auto_approved" | "auto_rejected" | "pending_approval";
  reason: string;
  approvalId?: string;
};

export class ApprovalService {
  async checkLibrary(
    appId: string,
    library: string,
    requesterId: string,
  ): Promise<LibraryCheckResult> {
    const app = await appService.getById(appId);
    const recipe = await recipeService.getById(app.recipeId);
    const definition = recipe.definition as {
      libraries?: { allowed?: string[]; denied?: string[] };
    };
    const denied = definition.libraries?.denied ?? [];
    const allowed = definition.libraries?.allowed ?? [];

    // Check denylist
    if (denied.includes(library)) {
      return {
        action: "auto_rejected",
        reason: `Library "${library}" is on the deny list for recipe "${recipe.name}"`,
      };
    }

    // Check allowlist (empty allowlist means anything not denied is ok)
    if (allowed.length > 0 && allowed.includes(library)) {
      return { action: "auto_approved", reason: `Library "${library}" is on the allow list` };
    }

    // If allowlist exists and library isn't on it, require approval
    if (allowed.length > 0) {
      const approval = await this.create({
        appId,
        requesterId,
        type: "library_addition",
        payload: { library },
      });
      return {
        action: "pending_approval",
        reason: `Library "${library}" requires admin approval`,
        approvalId: approval.id,
      };
    }

    // No allowlist restriction — auto approve
    return { action: "auto_approved", reason: `Library "${library}" is not restricted` };
  }

  async create(data: {
    appId: string;
    requesterId: string;
    type: ApprovalType;
    payload: Record<string, unknown>;
  }): Promise<Approval> {
    const id = nanoid();
    const [approval] = await db
      .insert(approvals)
      .values({
        id,
        appId: data.appId,
        requesterId: data.requesterId,
        type: data.type,
        status: "pending",
        payload: data.payload,
      })
      .returning();

    return approval as unknown as Approval;
  }

  async list(status?: ApprovalStatus): Promise<Approval[]> {
    let query = db.select().from(approvals);
    if (status) {
      query = query.where(eq(approvals.status, status)) as typeof query;
    }
    const result = await query;
    return result as unknown as Approval[];
  }

  async getById(id: string): Promise<Approval> {
    const [approval] = await db
      .select()
      .from(approvals)
      .where(eq(approvals.id, id))
      .limit(1);

    if (!approval) {
      throw new NotFoundError("Approval", id);
    }

    return approval as unknown as Approval;
  }

  async resolve(
    input: ResolveApprovalInput,
    resolverId: string,
  ): Promise<Approval> {
    const parsed = resolveApprovalSchema.parse(input);
    const approval = await this.getById(parsed.approvalId);

    if (approval.status !== "pending") {
      throw new ValidationError(
        `Approval is already ${approval.status}`,
      );
    }

    const [updated] = await db
      .update(approvals)
      .set({
        status: parsed.status,
        resolverId,
        resolvedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(approvals.id, parsed.approvalId))
      .returning();

    // If approved and it's a library addition, add the library
    if (parsed.status === "approved" && approval.type === "library_addition") {
      const payload = approval.payload as { library?: string };
      if (payload.library) {
        await appService.addLibrary(approval.appId, payload.library);
      }
    }

    return updated as unknown as Approval;
  }
}

export const approvalService = new ApprovalService();
