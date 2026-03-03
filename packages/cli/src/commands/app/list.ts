import { Command, Flags } from "@oclif/core";
import { apiClient } from "../../lib/api-client.js";
import * as output from "../../lib/output.js";

export default class AppList extends Command {
  static description = "List your applications";

  static flags = {
    json: Flags.boolean({ description: "Output as JSON" }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(AppList);

    const apps = await apiClient.get<
      { id: string; name: string; slug: string; status: string }[]
    >("/apps");

    if (flags.json) {
      output.json(apps);
      return;
    }

    if (apps.length === 0) {
      console.log("No applications found.");
      return;
    }

    output.table(
      ["Name", "Slug", "Status", "ID"],
      apps.map((a) => [a.name, a.slug, a.status, a.id]),
    );
  }
}
