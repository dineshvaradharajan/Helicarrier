import { appService } from "./app.service.js";
import { recipeService } from "./recipe.service.js";
import { themeService } from "./theme.service.js";
import { settingsService } from "./settings.service.js";
import type {
  AiProviderConfig,
  PipelineStage,
  ThemeColors,
  RecipeDefinition,
} from "@helicarrier/shared";

export interface ScaffoldConfig {
  stack: RecipeDefinition["stack"];
  scaffold: RecipeDefinition["scaffold"];
  theme: { id: string; name: string; label: string; colors: ThemeColors } | null;
  pipeline: PipelineStage[];
  provider: AiProviderConfig;
}

export class ScaffoldService {
  async getScaffoldConfig(appId: string): Promise<ScaffoldConfig> {
    const app = await appService.getById(appId);
    const recipe = await recipeService.getById(app.recipeId);

    let theme: ScaffoldConfig["theme"] = null;
    if (recipe.themeId) {
      try {
        const t = await themeService.getById(recipe.themeId);
        theme = {
          id: t.id,
          name: t.name,
          label: t.label,
          colors: t.colors,
        };
      } catch {
        // Theme may have been deleted
      }
    }

    const pipeline = (recipe.pipelineStages ?? []) as PipelineStage[];
    const provider = await settingsService.getAiProvider();

    return {
      stack: recipe.definition.stack,
      scaffold: recipe.definition.scaffold,
      theme,
      pipeline,
      provider,
    };
  }
}

export const scaffoldService = new ScaffoldService();
