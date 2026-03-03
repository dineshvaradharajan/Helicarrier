import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db, environments } from "@helicarrier/db";
import {
  type CreateEnvironmentInput,
  type Environment,
  type EnvironmentStatus,
  NotFoundError,
  createEnvironmentSchema,
} from "@helicarrier/shared";

export class EnvironmentService {
  async create(input: CreateEnvironmentInput): Promise<Environment> {
    const parsed = createEnvironmentSchema.parse(input);
    const id = nanoid();

    const [env] = await db
      .insert(environments)
      .values({
        id,
        name: parsed.name,
        type: parsed.type,
        provider: parsed.provider,
        config: parsed.config,
      })
      .returning();

    return env as unknown as Environment;
  }

  async list(): Promise<Environment[]> {
    const result = await db.select().from(environments);
    return result as unknown as Environment[];
  }

  async getById(id: string): Promise<Environment> {
    const [env] = await db
      .select()
      .from(environments)
      .where(eq(environments.id, id))
      .limit(1);

    if (!env) {
      throw new NotFoundError("Environment", id);
    }

    return env as unknown as Environment;
  }

  async updateStatus(
    id: string,
    status: EnvironmentStatus,
  ): Promise<Environment> {
    const [env] = await db
      .update(environments)
      .set({ status, updatedAt: new Date() })
      .where(eq(environments.id, id))
      .returning();

    if (!env) {
      throw new NotFoundError("Environment", id);
    }

    return env as unknown as Environment;
  }
}

export const environmentService = new EnvironmentService();
