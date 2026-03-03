import { Command, Flags } from "@oclif/core";
import { apiClient } from "../../../lib/api-client.js";
import * as output from "../../../lib/output.js";

export default class AdminUserList extends Command {
  static description = "List all users";

  static flags = {
    json: Flags.boolean({ description: "Output as JSON" }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(AdminUserList);

    const users = await apiClient.get<
      { id: string; email: string; displayName: string; role: string }[]
    >("/users");

    if (flags.json) {
      output.json(users);
      return;
    }

    output.table(
      ["Email", "Name", "Role", "ID"],
      users.map((u) => [u.email, u.displayName, u.role, u.id]),
    );
  }
}
