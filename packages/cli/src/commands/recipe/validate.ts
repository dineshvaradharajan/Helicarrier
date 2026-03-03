import { Args, Command } from "@oclif/core";
import { readFileSync } from "node:fs";
import * as output from "../../lib/output.js";
import { apiClient } from "../../lib/api-client.js";

export default class RecipeValidate extends Command {
  static description = "Validate a recipe YAML file";

  static args = {
    file: Args.string({
      description: "Path to recipe YAML file",
      required: true,
    }),
  };

  async run(): Promise<void> {
    const { args } = await this.parse(RecipeValidate);

    const content = readFileSync(args.file, "utf-8");

    try {
      await apiClient.post("/recipes/validate", { yaml: content });
      output.success("Recipe is valid");
    } catch (err) {
      output.error(
        `Validation failed: ${err instanceof Error ? err.message : String(err)}`,
      );
      this.exit(1);
    }
  }
}
