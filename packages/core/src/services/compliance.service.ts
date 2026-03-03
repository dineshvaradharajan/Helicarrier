import { eq, desc } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db, complianceChecks } from "@helicarrier/db";
import type {
  ComplianceCheck,
  ComplianceFinding,
  ComplianceStatus,
} from "@helicarrier/shared";

export class ComplianceService {
  async record(data: {
    appId: string;
    agentId: string;
    status: ComplianceStatus;
    findings: ComplianceFinding[];
    score: number | null;
    triggeredBy: string;
  }): Promise<ComplianceCheck> {
    const id = nanoid();
    const [check] = await db
      .insert(complianceChecks)
      .values({
        id,
        appId: data.appId,
        agentId: data.agentId,
        status: data.status,
        findings: data.findings,
        score: data.score,
        triggeredBy: data.triggeredBy,
      })
      .returning();

    return check as unknown as ComplianceCheck;
  }

  async listByApp(appId: string): Promise<ComplianceCheck[]> {
    const result = await db
      .select()
      .from(complianceChecks)
      .where(eq(complianceChecks.appId, appId))
      .orderBy(desc(complianceChecks.createdAt));

    return result as unknown as ComplianceCheck[];
  }

  async listAll(limit = 50): Promise<ComplianceCheck[]> {
    const result = await db
      .select()
      .from(complianceChecks)
      .orderBy(desc(complianceChecks.createdAt))
      .limit(limit);

    return result as unknown as ComplianceCheck[];
  }

  async getById(id: string): Promise<ComplianceCheck> {
    const [check] = await db
      .select()
      .from(complianceChecks)
      .where(eq(complianceChecks.id, id))
      .limit(1);

    if (!check) {
      throw new Error(`Compliance check not found: ${id}`);
    }

    return check as unknown as ComplianceCheck;
  }
}

export const complianceService = new ComplianceService();
