import { Args, Command, Flags } from "@oclif/core";
import { apiClient } from "../../lib/api-client.js";
import * as output from "../../lib/output.js";

export default class RecipeShow extends Command {
  static description = "Show recipe details";

  static args = {
    name: Args.string({ description: "Recipe name", required: true }),
  };

  static flags = {
    json: Flags.boolean({ description: "Output as JSON" }),
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(RecipeShow);

    const recipe = await apiClient.get<{
      id: string;
      name: string;
      version: string;
      definition: Record<string, unknown>;
      themeId?: string | null;
      pipelineStages?: Array<{
        name: string;
        type: string;
        required: boolean;
        order: number;
      }>;
    }>(`/recipes/${encodeURIComponent(args.name)}`);

    if (flags.json) {
      output.json(recipe);
    } else {
      console.log(`Recipe: ${recipe.name} (v${recipe.version})`);
      console.log(`  ID: ${recipe.id}`);

      if (recipe.themeId) {
        console.log(`  Theme ID: ${recipe.themeId}`);
      }

      if (recipe.pipelineStages && recipe.pipelineStages.length > 0) {
        console.log(`  Pipeline Stages:`);
        output.table(
          ["#", "Name", "Type", "Required"],
          recipe.pipelineStages.map((s, i) => [
            String(i + 1),
            s.name,
            s.type,
            s.required ? "Yes" : "No",
          ]),
        );
      }

      console.log(`\n  Definition:`);
      output.json(recipe.definition);
    }
  }
}
