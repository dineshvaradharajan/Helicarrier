import type { Hook } from "@oclif/core";
import { getApiKey } from "../lib/config.js";

const PUBLIC_COMMANDS = ["auth:login", "auth:logout", "config:set", "config:get"];

const hook: Hook<"prerun"> = async function ({ Command }) {
  const cmdId = Command.id ?? "";

  if (PUBLIC_COMMANDS.includes(cmdId)) {
    return;
  }

  const apiKey = getApiKey();
  if (!apiKey) {
    this.warn(
      "Not authenticated. Run `helicarrier auth login` first.",
    );
  }
};

export default hook;
