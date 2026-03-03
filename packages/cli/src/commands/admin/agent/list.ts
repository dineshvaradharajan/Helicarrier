import { Command, Flags } from "@oclif/core";
import { apiClient } from "../../../lib/api-client.js";
import * as output from "../../../lib/output.js";

export default class AdminAgentList extends Command {
  static description = "List available governance agents";

  static flags = {
    json: Flags.boolean({ description: "Output as JSON" }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(AdminAgentList);

    const agents = await apiClient.get<
      { id: string; name: string; description: string }[]
    >("/agents");

    if (flags.json) {
      output.json(agents);
      return;
    }

    output.table(
      ["ID", "Name", "Description"],
      agents.map((a) => [a.id, a.name, a.description]),
    );
  }
}
