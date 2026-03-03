import { eq, desc } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db, auditLog } from "@helicarrier/db";
import type { AuditLog } from "@helicarrier/shared";

export class AuditService {
  async log(entry: {
    actorId: string;
    action: string;
    resourceType: string;
    resourceId: string;
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    await db.insert(auditLog).values({
      id: nanoid(),
      actorId: entry.actorId,
      action: entry.action,
      resourceType: entry.resourceType,
      resourceId: entry.resourceId,
      metadata: entry.metadata ?? {},
    });
  }

  async list(filters?: {
    resourceType?: string;
    resourceId?: string;
    actorId?: string;
    limit?: number;
  }): Promise<AuditLog[]> {
    let query = db.select().from(auditLog).orderBy(desc(auditLog.createdAt));

    if (filters?.resourceType) {
      query = query.where(
        eq(auditLog.resourceType, filters.resourceType),
      ) as typeof query;
    }

    const result = await query.limit(filters?.limit ?? 100);
    return result as unknown as AuditLog[];
  }
}

export const auditService = new AuditService();
