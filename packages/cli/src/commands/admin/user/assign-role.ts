import { Args, Command, Flags } from "@oclif/core";
import { apiClient } from "../../../lib/api-client.js";
import * as output from "../../../lib/output.js";

export default class AdminUserAssignRole extends Command {
  static description = "Assign a role to a user";

  static args = {
    "user-id": Args.string({
      description: "User ID",
      required: true,
    }),
    role: Args.string({
      description: "Role to assign",
      required: true,
      options: ["admin", "developer", "viewer"],
    }),
  };

  static flags = {
    json: Flags.boolean({ description: "Output as JSON" }),
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(AdminUserAssignRole);

    const user = await apiClient.put<{
      id: string;
      email: string;
      role: string;
    }>(`/users/${args["user-id"]}/role`, { role: args.role });

    if (flags.json) {
      output.json(user);
    } else {
      output.success(`User ${user.email} role set to ${user.role}`);
    }
  }
}
