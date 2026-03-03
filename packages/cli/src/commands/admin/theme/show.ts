import { Args, Command, Flags } from "@oclif/core";
import { apiClient } from "../../../lib/api-client.js";
import * as output from "../../../lib/output.js";

export default class AdminThemeShow extends Command {
  static description = "Show theme details";

  static args = {
    id: Args.string({ description: "Theme ID", required: true }),
  };

  static flags = {
    json: Flags.boolean({ description: "Output as JSON" }),
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(AdminThemeShow);

    const theme = await apiClient.get<Record<string, unknown>>(
      `/themes/${args.id}`,
    );

    if (flags.json) {
      output.json(theme);
    } else {
      output.json(theme);
    }
  }
}
