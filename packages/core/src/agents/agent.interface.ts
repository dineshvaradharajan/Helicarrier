import type { ComplianceFinding } from "@helicarrier/shared";

export interface AgentContext {
  appId: string;
  appName: string;
  libraries: string[];
  recipeDefinition: Record<string, unknown>;
}

export interface AgentResult {
  agentId: string;
  status: "pass" | "fail" | "warning" | "error";
  findings: ComplianceFinding[];
  score: number | null;
}

export interface GovernanceAgent {
  id: string;
  name: string;
  description: string;
  execute(context: AgentContext): Promise<AgentResult>;
}
