export * from "./services/index.js";
export * from "./agents/index.js";
export * from "./recipes/index.js";

// Register built-in agents on import
import { agentRegistry } from "./agents/agent.registry.js";
import { licenseComplianceAgent } from "./agents/builtin/license-compliance.agent.js";

agentRegistry.register(licenseComplianceAgent);
