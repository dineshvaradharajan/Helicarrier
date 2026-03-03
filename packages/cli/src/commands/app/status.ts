import { Args, Command, Flags } from "@oclif/core";
import { apiClient } from "../../lib/api-client.js";
import * as output from "../../lib/output.js";

export default class AppStatus extends Command {
  static description = "Show application status and details";

  static args = {
    id: Args.string({ description: "Application ID", required: true }),
  };

  static flags = {
    json: Flags.boolean({ description: "Output as JSON" }),
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(AppStatus);

    const app = await apiClient.get<{
      id: string;
      name: string;
      slug: string;
      status: string;
      resolvedConfig?: {
        theme?: { name: string; label: string; colors: { primary: string } };
        pipeline?: Array<{ name: string; type: string; required: boolean }>;
      };
    }>(`/apps/${args.id}`);

    if (flags.json) {
      output.json(app);
    } else {
      console.log(`Application: ${app.name}`);
      console.log(`  ID: ${app.id}`);
      console.log(`  Slug: ${app.slug}`);
      console.log(`  Status: ${app.status}`);

      const config = app.resolvedConfig;
      if (config?.theme) {
        console.log(`  Theme: ${config.theme.label} (primary: ${config.theme.colors.primary})`);
      }

      if (config?.pipeline && config.pipeline.length > 0) {
        console.log(`  Pipeline Stages:`);
        for (const stage of config.pipeline) {
          const badge = stage.required ? "[REQUIRED]" : "[optional]";
          console.log(`    ${badge} ${stage.name} (${stage.type})`);
        }
      }
    }
  }
}
