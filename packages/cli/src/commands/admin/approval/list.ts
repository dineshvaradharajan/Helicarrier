import { Command, Flags } from "@oclif/core";
import { apiClient } from "../../../lib/api-client.js";
import * as output from "../../../lib/output.js";

export default class AdminApprovalList extends Command {
  static description = "List pending approvals";

  static flags = {
    status: Flags.string({
      description: "Filter by status",
      options: ["pending", "approved", "rejected"],
      default: "pending",
    }),
    json: Flags.boolean({ description: "Output as JSON" }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(AdminApprovalList);

    const approvals = await apiClient.get<
      {
        id: string;
        type: string;
        status: string;
        appId: string;
        payload: Record<string, unknown>;
        createdAt: string;
      }[]
    >(`/approvals?status=${flags.status}`);

    if (flags.json) {
      output.json(approvals);
      return;
    }

    if (approvals.length === 0) {
      console.log(`No ${flags.status} approvals.`);
      return;
    }

    output.table(
      ["ID", "Type", "App", "Payload", "Created"],
      approvals.map((a) => [
        a.id,
        a.type,
        a.appId,
        JSON.stringify(a.payload),
        new Date(a.createdAt).toLocaleString(),
      ]),
    );
  }
}
