import { Args, Command } from "@oclif/core";
import { saveConfig } from "../../lib/config.js";
import * as output from "../../lib/output.js";

export default class ConfigSet extends Command {
  static description = "Set a configuration value";

  static args = {
    key: Args.string({
      description: "Config key (apiUrl)",
      required: true,
      options: ["apiUrl"],
    }),
    value: Args.string({
      description: "Config value",
      required: true,
    }),
  };

  async run(): Promise<void> {
    const { args } = await this.parse(ConfigSet);
    saveConfig({ [args.key]: args.value });
    output.success(`Set ${args.key} = ${args.value}`);
  }
}
