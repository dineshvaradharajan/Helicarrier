import { environmentService } from "@helicarrier/core";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";

export default async function EnvironmentsPage() {
  const environments = await environmentService.list();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Environments
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Deployment targets and infrastructure configuration
        </p>
      </div>

      <DataTable
        columns={[
          {
            header: "Name",
            accessor: (row) => (
              <span className="font-medium">{row.name as string}</span>
            ),
          },
          {
            header: "Type",
            accessor: (row) => {
              const t = row.type as string;
              return (
                <Badge
                  variant={
                    t === "prod"
                      ? "destructive"
                      : t === "staging"
                        ? "warning"
                        : "outline"
                  }
                >
                  {t}
                </Badge>
              );
            },
          },
          {
            header: "Provider",
            accessor: (row) => (
              <span className="font-mono text-xs">
                {row.provider as string}
              </span>
            ),
          },
          {
            header: "Status",
            accessor: (row) => <StatusBadge status={row.status as string} />,
          },
          {
            header: "Created",
            accessor: (row) => (
              <span className="font-mono text-xs text-muted-foreground">
                {new Date(row.createdAt as string).toLocaleDateString()}
              </span>
            ),
          },
        ]}
        data={environments as Array<Record<string, unknown>>}
        emptyMessage="No environments configured."
      />
    </div>
  );
}
