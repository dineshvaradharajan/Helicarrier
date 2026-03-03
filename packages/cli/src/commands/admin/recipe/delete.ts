import { Args, Command } from "@oclif/core";
import { apiClient } from "../../../lib/api-client.js";
import * as output from "../../../lib/output.js";

export default class AdminRecipeDelete extends Command {
  static description = "Delete (deactivate) a recipe";

  static args = {
    id: Args.string({ description: "Recipe ID", required: true }),
  };

  async run(): Promise<void> {
    const { args } = await this.parse(AdminRecipeDelete);

    await apiClient.delete(`/recipes/${args.id}`);
    output.success(`Recipe ${args.id} deactivated`);
  }
}
