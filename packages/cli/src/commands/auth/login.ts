import { Command, Flags } from "@oclif/core";
import { saveConfig } from "../../lib/config.js";
import * as output from "../../lib/output.js";
import { apiClient } from "../../lib/api-client.js";

export default class AuthLogin extends Command {
  static description = "Authenticate with the Helicarrier platform";

  static flags = {
    "api-key": Flags.string({
      description: "API key for authentication",
      env: "HELICARRIER_API_KEY",
    }),
    "api-url": Flags.string({
      description: "API base URL",
      env: "HELICARRIER_API_URL",
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(AuthLogin);

    if (flags["api-url"]) {
      saveConfig({ apiUrl: flags["api-url"] });
    }

    if (flags["api-key"]) {
      saveConfig({ apiKey: flags["api-key"] });

      // Validate the key
      try {
        const user = await apiClient.get<{ id: string; email: string }>(
          "/auth/token",
        );
        saveConfig({ userEmail: user.email, userId: user.id });
        output.success(`Authenticated as ${user.email}`);
      } catch {
        output.error("Invalid API key");
        this.exit(1);
      }

      return;
    }

    output.warn(
      "Pass --api-key to authenticate. OAuth support coming soon.",
    );
  }
}
