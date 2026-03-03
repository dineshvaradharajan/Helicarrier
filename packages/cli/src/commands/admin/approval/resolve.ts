import { Args, Command, Flags } from "@oclif/core";
import { apiClient } from "../../../lib/api-client.js";
import * as output from "../../../lib/output.js";

export default class AdminApprovalResolve extends Command {
  static description = "Approve or reject a pending approval";

  static args = {
    id: Args.string({ description: "Approval ID", required: true }),
  };

  static flags = {
    approve: Flags.boolean({
      description: "Approve the request",
      exclusive: ["reject"],
    }),
    reject: Flags.boolean({
      description: "Reject the request",
      exclusive: ["approve"],
    }),
    reason: Flags.string({
      description: "Reason for the decision",
    }),
    json: Flags.boolean({ description: "Output as JSON" }),
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(AdminApprovalResolve);

    if (!flags.approve && !flags.reject) {
      output.error("Must specify --approve or --reject");
      this.exit(1);
    }

    const status = flags.approve ? "approved" : "rejected";

    const result = await apiClient.post<{
      id: string;
      status: string;
    }>(`/approvals/${args.id}/resolve`, {
      status,
      reason: flags.reason,
    });

    if (flags.json) {
      output.json(result);
    } else {
      output.success(`Approval ${args.id} ${status}`);
    }
  }
}
