import { userService } from "@helicarrier/core";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";

export default async function UsersPage() {
  const users = await userService.list();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage platform users and role assignments
        </p>
      </div>

      <DataTable
        columns={[
          {
            header: "User",
            accessor: (row) => (
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {((row.displayName as string) ?? "U").charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium">{row.displayName as string}</p>
                  <p className="text-xs text-muted-foreground">
                    {row.email as string}
                  </p>
                </div>
              </div>
            ),
          },
          {
            header: "Role",
            accessor: (row) => (
              <Badge
                variant={
                  row.role === "admin"
                    ? "default"
                    : row.role === "developer"
                      ? "success"
                      : "outline"
                }
              >
                {row.role as string}
              </Badge>
            ),
          },
          {
            header: "API Key",
            accessor: (row) => (
              <span className="text-xs text-muted-foreground">
                {row.apiKeyHash ? "Configured" : "—"}
              </span>
            ),
          },
          {
            header: "Joined",
            accessor: (row) => (
              <span className="font-mono text-xs text-muted-foreground">
                {new Date(row.createdAt as string).toLocaleDateString()}
              </span>
            ),
          },
        ]}
        data={users as Array<Record<string, unknown>>}
        emptyMessage="No users found."
      />
    </div>
  );
}
