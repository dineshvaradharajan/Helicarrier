import { Command, Flags } from "@oclif/core";
import { apiClient } from "../../lib/api-client.js";
import * as output from "../../lib/output.js";

export default class RecipeList extends Command {
  static description = "List available recipes";

  static flags = {
    json: Flags.boolean({ description: "Output as JSON" }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(RecipeList);

    const recipes = await apiClient.get<
      { id: string; name: string; version: string; isActive: boolean }[]
    >("/recipes");

    if (flags.json) {
      output.json(recipes);
      return;
    }

    if (recipes.length === 0) {
      console.log("No recipes found.");
      return;
    }

    output.table(
      ["Name", "Version", "Status", "ID"],
      recipes.map((r) => [
        r.name,
        r.version,
        r.isActive ? "active" : "inactive",
        r.id,
      ]),
    );
  }
}
