import type { GovernanceAgent } from "./agent.interface.js";

class AgentRegistry {
  private agents = new Map<string, GovernanceAgent>();

  register(agent: GovernanceAgent): void {
    this.agents.set(agent.id, agent);
  }

  get(id: string): GovernanceAgent | undefined {
    return this.agents.get(id);
  }

  list(): GovernanceAgent[] {
    return Array.from(this.agents.values());
  }

  has(id: string): boolean {
    return this.agents.has(id);
  }
}

export const agentRegistry = new AgentRegistry();
