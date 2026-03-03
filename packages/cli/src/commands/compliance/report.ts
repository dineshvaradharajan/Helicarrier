import { Args, Command, Flags } from "@oclif/core";
import { apiClient } from "../../lib/api-client.js";
import * as output from "../../lib/output.js";

export default class ComplianceReport extends Command {
  static description = "View compliance report for an application";

  static args = {
    "app-id": Args.string({
      description: "Application ID",
      required: true,
    }),
  };

  static flags = {
    json: Flags.boolean({ description: "Output as JSON" }),
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(ComplianceReport);

    const checks = await apiClient.get<
      {
        id: string;
        agentId: string;
        status: string;
        score: number | null;
        createdAt: string;
        findings: { rule: string; severity: string; message: string }[];
      }[]
    >(`/compliance/logs?appId=${args["app-id"]}`);

    if (flags.json) {
      output.json(checks);
      return;
    }

    if (checks.length === 0) {
      console.log("No compliance checks found.");
      return;
    }

    output.table(
      ["ID", "Agent", "Status", "Score", "Date"],
      checks.map((c) => [
        c.id,
        c.agentId,
        c.status,
        c.score?.toString() ?? "N/A",
        new Date(c.createdAt).toLocaleString(),
      ]),
    );
  }
}
