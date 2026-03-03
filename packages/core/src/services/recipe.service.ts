import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db, recipes } from "@helicarrier/db";
import {
  type CreateRecipeInput,
  type Recipe,
  type RecipeDefinition,
  type PipelineStage,
  NotFoundError,
  ConflictError,
  createRecipeSchema,
  recipeDefinitionSchema,
} from "@helicarrier/shared";

export class RecipeService {
  async create(input: CreateRecipeInput): Promise<Recipe> {
    const parsed = createRecipeSchema.parse(input);

    const existing = await db
      .select()
      .from(recipes)
      .where(eq(recipes.name, parsed.name))
      .limit(1);

    if (existing.length > 0) {
      throw new ConflictError(
        `Recipe with name "${parsed.name}" already exists`,
      );
    }

    const id = nanoid();
    const [recipe] = await db
      .insert(recipes)
      .values({
        id,
        name: parsed.name,
        version: parsed.version,
        definition: parsed.definition,
        agentIds: parsed.agentIds,
        themeId: parsed.themeId ?? null,
        pipelineStages: parsed.pipelineStages ?? [],
      })
      .returning();

    return recipe as unknown as Recipe;
  }

  async list(activeOnly = true): Promise<Recipe[]> {
    let query = db.select().from(recipes);
    if (activeOnly) {
      query = query.where(eq(recipes.isActive, true)) as typeof query;
    }
    const result = await query;
    return result as unknown as Recipe[];
  }

  async getById(id: string): Promise<Recipe> {
    const [recipe] = await db
      .select()
      .from(recipes)
      .where(eq(recipes.id, id))
      .limit(1);

    if (!recipe) {
      throw new NotFoundError("Recipe", id);
    }

    return recipe as unknown as Recipe;
  }

  async getByName(name: string): Promise<Recipe> {
    const [recipe] = await db
      .select()
      .from(recipes)
      .where(eq(recipes.name, name))
      .limit(1);

    if (!recipe) {
      throw new NotFoundError("Recipe", name);
    }

    return recipe as unknown as Recipe;
  }

  async update(
    id: string,
    data: Partial<{
      definition: RecipeDefinition;
      version: string;
      isActive: boolean;
      agentIds: string[];
      themeId: string | null;
      pipelineStages: PipelineStage[];
    }>,
  ): Promise<Recipe> {
    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (data.definition !== undefined) updateData.definition = data.definition;
    if (data.version !== undefined) updateData.version = data.version;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.agentIds !== undefined) updateData.agentIds = data.agentIds;
    if (data.themeId !== undefined) updateData.themeId = data.themeId;
    if (data.pipelineStages !== undefined) updateData.pipelineStages = data.pipelineStages;

    const [recipe] = await db
      .update(recipes)
      .set(updateData)
      .where(eq(recipes.id, id))
      .returning();

    if (!recipe) {
      throw new NotFoundError("Recipe", id);
    }

    return recipe as unknown as Recipe;
  }

  async delete(id: string): Promise<void> {
    const result = await db.delete(recipes).where(eq(recipes.id, id));
    if (result.length === 0) {
      // soft-delete: deactivate instead
      await this.update(id, { isActive: false });
    }
  }

  validateDefinition(definition: unknown): RecipeDefinition {
    return recipeDefinitionSchema.parse(definition);
  }
}

export const recipeService = new RecipeService();
