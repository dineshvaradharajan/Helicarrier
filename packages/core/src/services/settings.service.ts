import { eq } from "drizzle-orm";
import { db, settings } from "@helicarrier/db";
import {
  type AiProviderConfig,
  type Setting,
  aiProviderConfigSchema,
} from "@helicarrier/shared";

export class SettingsService {
  async get(key: string): Promise<Setting | null> {
    const [row] = await db
      .select()
      .from(settings)
      .where(eq(settings.key, key))
      .limit(1);

    if (!row) return null;
    return row as unknown as Setting;
  }

  async set(key: string, value: unknown): Promise<Setting> {
    const [row] = await db
      .insert(settings)
      .values({ key, value, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: settings.key,
        set: { value, updatedAt: new Date() },
      })
      .returning();

    return row as unknown as Setting;
  }

  async getAll(): Promise<Setting[]> {
    const rows = await db.select().from(settings);
    return rows as unknown as Setting[];
  }

  async getAiProvider(): Promise<AiProviderConfig> {
    const setting = await this.get("ai_provider");
    if (!setting) {
      return { provider: "claude", model: "claude-sonnet-4-20250514" };
    }
    return aiProviderConfigSchema.parse(setting.value);
  }

  async setAiProvider(config: AiProviderConfig): Promise<Setting> {
    const parsed = aiProviderConfigSchema.parse(config);
    return this.set("ai_provider", parsed);
  }
}

export const settingsService = new SettingsService();
