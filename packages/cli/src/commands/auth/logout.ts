import { Command } from "@oclif/core";
import { clearConfig } from "../../lib/config.js";
import * as output from "../../lib/output.js";

export default class AuthLogout extends Command {
  static description = "Log out of Helicarrier";

  async run(): Promise<void> {
    clearConfig();
    output.success("Logged out successfully");
  }
}
