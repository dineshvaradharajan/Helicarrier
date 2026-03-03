import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db, apps } from "@helicarrier/db";
import {
  type CreateAppInput,
  type App,
  NotFoundError,
  ConflictError,
  createAppSchema,
  type AppStatus,
} from "@helicarrier/shared";
import { recipeService } from "./recipe.service.js";
import { themeService } from "./theme.service.js";
import type { PipelineStage } from "@helicarrier/shared";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export class AppService {
  async create(input: CreateAppInput, ownerId: string): Promise<App> {
    const parsed = createAppSchema.parse(input);

    // Verify recipe exists
    const recipe = await recipeService.getById(parsed.recipeId);

    const slug = slugify(parsed.name);
    const existing = await db
      .select()
      .from(apps)
      .where(eq(apps.slug, slug))
      .limit(1);

    if (existing.length > 0) {
      throw new ConflictError(`App with slug "${slug}" already exists`);
    }

    // Build resolved config with theme + pipeline
    const resolvedConfig: Record<string, unknown> = { ...recipe.definition };

    if (recipe.themeId) {
      try {
        const theme = await themeService.getById(recipe.themeId);
        resolvedConfig.theme = {
          id: theme.id,
          name: theme.name,
          label: theme.label,
          colors: theme.colors,
        };
      } catch {
        // Theme may have been deleted
      }
    }

    const pipelineStages = (recipe.pipelineStages ?? []) as PipelineStage[];
    if (pipelineStages.length > 0) {
      resolvedConfig.pipeline = pipelineStages;
    }

    const id = nanoid();
    const [app] = await db
      .insert(apps)
      .values({
        id,
        name: parsed.name,
        slug,
        recipeId: parsed.recipeId,
        status: "active",
        resolvedConfig,
        additionalLibs: [],
        ownerId,
      })
      .returning();

    return app as unknown as App;
  }

  async list(ownerId?: string): Promise<App[]> {
    let query = db.select().from(apps);
    if (ownerId) {
      query = query.where(eq(apps.ownerId, ownerId)) as typeof query;
    }
    const result = await query;
    return result as unknown as App[];
  }

  async getById(id: string): Promise<App> {
    const [app] = await db
      .select()
      .from(apps)
      .where(eq(apps.id, id))
      .limit(1);

    if (!app) {
      throw new NotFoundError("App", id);
    }

    return app as unknown as App;
  }

  async updateStatus(id: string, status: AppStatus): Promise<App> {
    const [app] = await db
      .update(apps)
      .set({ status, updatedAt: new Date() })
      .where(eq(apps.id, id))
      .returning();

    if (!app) {
      throw new NotFoundError("App", id);
    }

    return app as unknown as App;
  }

  async addLibrary(id: string, library: string): Promise<App> {
    const app = await this.getById(id);
    const currentLibs = (app.additionalLibs ?? []) as string[];

    if (currentLibs.includes(library)) {
      throw new ConflictError(`Library "${library}" is already added`);
    }

    const [updated] = await db
      .update(apps)
      .set({
        additionalLibs: [...currentLibs, library],
        updatedAt: new Date(),
      })
      .where(eq(apps.id, id))
      .returning();

    return updated as unknown as App;
  }
}

export const appService = new AppService();
