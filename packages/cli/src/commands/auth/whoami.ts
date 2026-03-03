import { Command, Flags } from "@oclif/core";
import { apiClient } from "../../lib/api-client.js";
import * as output from "../../lib/output.js";

export default class AuthWhoami extends Command {
  static description = "Display current authenticated user";

  static flags = {
    json: Flags.boolean({ description: "Output as JSON" }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(AuthWhoami);

    try {
      const user = await apiClient.get<{
        id: string;
        email: string;
        displayName: string;
        role: string;
      }>("/auth/token");

      if (flags.json) {
        output.json(user);
      } else {
        console.log(`User: ${user.displayName}`);
        console.log(`Email: ${user.email}`);
        console.log(`Role: ${user.role}`);
        console.log(`ID: ${user.id}`);
      }
    } catch {
      output.error("Not authenticated. Run `helicarrier auth login` first.");
      this.exit(1);
    }
  }
}
