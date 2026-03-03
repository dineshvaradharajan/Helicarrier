import type { AgentContext, AgentResult } from "./agent.interface.js";
import { agentRegistry } from "./agent.registry.js";
import { complianceService } from "../services/compliance.service.js";
import { appService } from "../services/app.service.js";
import { recipeService } from "../services/recipe.service.js";

export class AgentRunner {
  async runForApp(
    appId: string,
    agentIds: string[],
    triggeredBy: string,
  ): Promise<AgentResult[]> {
    const app = await appService.getById(appId);
    const recipe = await recipeService.getById(app.recipeId);

    const context: AgentContext = {
      appId: app.id,
      appName: app.name,
      libraries: (app.additionalLibs ?? []) as string[],
      recipeDefinition: recipe.definition as Record<string, unknown>,
    };

    const results: AgentResult[] = [];

    for (const agentId of agentIds) {
      const agent = agentRegistry.get(agentId);
      if (!agent) continue;

      try {
        const result = await agent.execute(context);
        await complianceService.record({
          appId,
          agentId,
          status: result.status,
          findings: result.findings,
          score: result.score,
          triggeredBy,
        });
        results.push(result);
      } catch (error) {
        const errorResult: AgentResult = {
          agentId,
          status: "error",
          findings: [
            {
              rule: "agent-execution",
              severity: "critical",
              message: `Agent execution failed: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          score: null,
        };
        await complianceService.record({
          appId,
          agentId,
          status: "error",
          findings: errorResult.findings,
          score: null,
          triggeredBy,
        });
        results.push(errorResult);
      }
    }

    return results;
  }
}

export const agentRunner = new AgentRunner();
