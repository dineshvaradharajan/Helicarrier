import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db, themes } from "@helicarrier/db";
import {
  type CreateThemeInput,
  type Theme,
  type ThemeColors,
  NotFoundError,
  ConflictError,
  createThemeSchema,
} from "@helicarrier/shared";

export class ThemeService {
  async create(input: CreateThemeInput): Promise<Theme> {
    const parsed = createThemeSchema.parse(input);

    const existing = await db
      .select()
      .from(themes)
      .where(eq(themes.name, parsed.name))
      .limit(1);

    if (existing.length > 0) {
      throw new ConflictError(`Theme with name "${parsed.name}" already exists`);
    }

    const id = nanoid();
    const [theme] = await db
      .insert(themes)
      .values({
        id,
        name: parsed.name,
        label: parsed.label,
        colors: parsed.colors,
        isDefault: false,
        isActive: true,
      })
      .returning();

    return theme as unknown as Theme;
  }

  async list(activeOnly = true): Promise<Theme[]> {
    let query = db.select().from(themes);
    if (activeOnly) {
      query = query.where(eq(themes.isActive, true)) as typeof query;
    }
    const result = await query;
    return result as unknown as Theme[];
  }

  async getById(id: string): Promise<Theme> {
    const [theme] = await db
      .select()
      .from(themes)
      .where(eq(themes.id, id))
      .limit(1);

    if (!theme) {
      throw new NotFoundError("Theme", id);
    }

    return theme as unknown as Theme;
  }

  async update(
    id: string,
    data: Partial<{ label: string; colors: ThemeColors; isActive: boolean }>,
  ): Promise<Theme> {
    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (data.label !== undefined) updateData.label = data.label;
    if (data.colors !== undefined) updateData.colors = data.colors;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const [theme] = await db
      .update(themes)
      .set(updateData)
      .where(eq(themes.id, id))
      .returning();

    if (!theme) {
      throw new NotFoundError("Theme", id);
    }

    return theme as unknown as Theme;
  }

  async delete(id: string): Promise<void> {
    await this.update(id, { isActive: false });
  }
}

export const themeService = new ThemeService();
