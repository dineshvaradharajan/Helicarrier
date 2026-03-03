import type { Hook } from "@oclif/core";
import { loadConfig } from "../lib/config.js";

const hook: Hook<"init"> = async function () {
  // Ensure config is loadable on startup
  loadConfig();
};

export default hook;
