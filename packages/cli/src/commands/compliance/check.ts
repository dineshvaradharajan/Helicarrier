import { Args, Command, Flags } from "@oclif/core";
import { apiClient } from "../../lib/api-client.js";
import * as output from "../../lib/output.js";

export default class ComplianceCheck extends Command {
  static description = "Run compliance checks on an application";

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
    const { args, flags } = await this.parse(ComplianceCheck);

    console.log("Running compliance checks...");

    const results = await apiClient.post<
      {
        agentId: string;
        status: string;
        findings: { rule: string; severity: string; message: string }[];
        score: number | null;
      }[]
    >(`/compliance/check`, { appId: args["app-id"] });

    if (flags.json) {
      output.json(results);
      return;
    }

    for (const result of results) {
      const statusIcon =
        result.status === "pass"
          ? "✓"
          : result.status === "fail"
            ? "✗"
            : "⚠";
      console.log(
        `\n${statusIcon} Agent: ${result.agentId} — ${result.status}${result.score !== null ? ` (score: ${result.score})` : ""}`,
      );

      if (result.findings.length > 0) {
        for (const f of result.findings) {
          console.log(`  [${f.severity}] ${f.message}`);
        }
      } else {
        console.log("  No findings.");
      }
    }
  }
}
