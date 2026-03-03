import { Args, Command } from "@oclif/core";
import { loadConfig } from "../../lib/config.js";

export default class ConfigGet extends Command {
  static description = "Get a configuration value";

  static args = {
    key: Args.string({
      description: "Config key",
    }),
  };

  async run(): Promise<void> {
    const { args } = await this.parse(ConfigGet);
    const config = loadConfig();

    if (args.key) {
      const value = config[args.key as keyof typeof config];
      console.log(value ?? "(not set)");
    } else {
      console.log(JSON.stringify(config, null, 2));
    }
  }
}
