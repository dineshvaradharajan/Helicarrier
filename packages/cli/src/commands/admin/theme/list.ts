import { Command, Flags } from "@oclif/core";
import { apiClient } from "../../../lib/api-client.js";
import * as output from "../../../lib/output.js";

export default class AdminThemeList extends Command {
  static description = "List all themes";

  static flags = {
    json: Flags.boolean({ description: "Output as JSON" }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(AdminThemeList);

    const themes = await apiClient.get<
      Array<{
        id: string;
        name: string;
        label: string;
        colors: { primary: string };
        isDefault: boolean;
        isActive: boolean;
      }>
    >("/themes");

    if (flags.json) {
      output.json(themes);
    } else {
      output.table(
        ["Name", "Label", "Primary", "Default", "Active"],
        themes.map((t) => [
          t.name,
          t.label,
          t.colors.primary,
          t.isDefault ? "Yes" : "No",
          t.isActive ? "Yes" : "No",
        ]),
      );
    }
  }
}
