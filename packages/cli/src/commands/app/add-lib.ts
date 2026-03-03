import { Args, Command, Flags } from "@oclif/core";
import { apiClient } from "../../lib/api-client.js";
import * as output from "../../lib/output.js";

export default class AppAddLib extends Command {
  static description = "Add a library to an application";

  static args = {
    app: Args.string({ description: "Application ID", required: true }),
    library: Args.string({ description: "Library name", required: true }),
  };

  static flags = {
    json: Flags.boolean({ description: "Output as JSON" }),
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(AppAddLib);

    const result = await apiClient.post<{
      action: string;
      reason: string;
      approvalId?: string;
    }>(`/apps/${args.app}/libraries`, {
      library: args.library,
    });

    if (flags.json) {
      output.json(result);
      return;
    }

    switch (result.action) {
      case "auto_approved":
        output.success(`Library "${args.library}" added. ${result.reason}`);
        break;
      case "auto_rejected":
        output.error(`Library "${args.library}" rejected. ${result.reason}`);
        break;
      case "pending_approval":
        output.warn(
          `Library "${args.library}" requires approval. ${result.reason}`,
        );
        if (result.approvalId) {
          console.log(`  Approval ID: ${result.approvalId}`);
        }
        break;
    }
  }
}
