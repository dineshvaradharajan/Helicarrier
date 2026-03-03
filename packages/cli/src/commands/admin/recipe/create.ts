import { Args, Command, Flags } from "@oclif/core";
import { readFileSync } from "node:fs";
import { apiClient } from "../../../lib/api-client.js";
import * as output from "../../../lib/output.js";

export default class AdminRecipeCreate extends Command {
  static description = "Create a new recipe from a YAML file";

  static args = {
    file: Args.string({
      description: "Path to recipe YAML file",
      required: true,
    }),
  };

  static flags = {
    json: Flags.boolean({ description: "Output as JSON" }),
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(AdminRecipeCreate);

    const content = readFileSync(args.file, "utf-8");

    const recipe = await apiClient.post<{
      id: string;
      name: string;
    }>("/recipes", { yaml: content });

    if (flags.json) {
      output.json(recipe);
    } else {
      output.success(`Recipe "${recipe.name}" created (${recipe.id})`);
    }
  }
}
