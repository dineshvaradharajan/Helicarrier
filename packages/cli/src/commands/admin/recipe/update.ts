import { Args, Command, Flags } from "@oclif/core";
import { readFileSync } from "node:fs";
import { apiClient } from "../../../lib/api-client.js";
import * as output from "../../../lib/output.js";

export default class AdminRecipeUpdate extends Command {
  static description = "Update an existing recipe";

  static args = {
    id: Args.string({ description: "Recipe ID", required: true }),
    file: Args.string({
      description: "Path to recipe YAML file",
      required: true,
    }),
  };

  static flags = {
    json: Flags.boolean({ description: "Output as JSON" }),
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(AdminRecipeUpdate);

    const content = readFileSync(args.file, "utf-8");

    const recipe = await apiClient.put<{
      id: string;
      name: string;
    }>(`/recipes/${args.id}`, { yaml: content });

    if (flags.json) {
      output.json(recipe);
    } else {
      output.success(`Recipe "${recipe.name}" updated`);
    }
  }
}
