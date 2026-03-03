import { Args, Command, Flags } from "@oclif/core";
import { apiClient } from "../../../lib/api-client.js";
import * as output from "../../../lib/output.js";

export default class AdminAgentRun extends Command {
  static description = "Run a governance agent on an application";

  static args = {
    "agent-id": Args.string({
      description: "Agent ID",
      required: true,
    }),
    "app-id": Args.string({
      description: "Application ID",
      required: true,
    }),
  };

  static flags = {
    json: Flags.boolean({ description: "Output as JSON" }),
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(AdminAgentRun);

    const result = await apiClient.post<Record<string, unknown>>(
      `/compliance/check`,
      {
        appId: args["app-id"],
        agentIds: [args["agent-id"]],
      },
    );

    if (flags.json) {
      output.json(result);
    } else {
      output.json(result);
    }
  }
}
