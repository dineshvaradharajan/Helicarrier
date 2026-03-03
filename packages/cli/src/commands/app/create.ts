import { Args, Command, Flags } from "@oclif/core";
import { apiClient } from "../../lib/api-client.js";
import * as output from "../../lib/output.js";

export default class AppCreate extends Command {
  static description = "Create a new application";

  static args = {
    name: Args.string({ description: "Application name", required: true }),
  };

  static flags = {
    recipe: Flags.string({
      char: "r",
      description: "Recipe name or ID",
      required: true,
    }),
    provider: Flags.string({
      char: "p",
      description: "AI provider override (claude, codex, gemini)",
    }),
    json: Flags.boolean({ description: "Output as JSON" }),
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(AppCreate);

    const body: Record<string, unknown> = {
      name: args.name,
      recipe: flags.recipe,
    };
    if (flags.provider) {
      body.provider = flags.provider;
    }

    const app = await apiClient.post<{
      id: string;
      name: string;
      slug: string;
      status: string;
      theme?: { name: string; label: string } | null;
      pipeline?: Array<{ name: string; type: string; required: boolean }>;
    }>("/apps", body);

    if (flags.json) {
      output.json(app);
    } else {
      output.success(`Application "${app.name}" created (${app.id})`);
      console.log(`  Slug: ${app.slug}`);
      console.log(`  Status: ${app.status}`);

      if (app.theme) {
        console.log(`  Theme: ${app.theme.label} (${app.theme.name})`);
      }

      if (app.pipeline && app.pipeline.length > 0) {
        console.log(`  Pipeline:`);
        for (const stage of app.pipeline) {
          const badge = stage.required ? "[REQUIRED]" : "[optional]";
          console.log(`    ${badge} ${stage.name} (${stage.type})`);
        }
      }

      if (flags.provider) {
        console.log(`  AI Provider: ${flags.provider} (override)`);
      }
    }
  }
}
