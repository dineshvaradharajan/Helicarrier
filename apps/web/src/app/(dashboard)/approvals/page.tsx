import { approvalService } from "@helicarrier/core";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { ApprovalActions } from "@/components/approvals/approval-actions";

export default async function ApprovalsPage() {
  const approvals = await approvalService.list();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Approvals</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review and resolve pending approval requests
        </p>
      </div>

      <DataTable
        columns={[
          {
            header: "Type",
            accessor: (row) => (
              <span className="font-medium">
                {(row.type as string).replace(/_/g, " ")}
              </span>
            ),
          },
          { header: "App", accessor: "appId" },
          {
            header: "Payload",
            accessor: (row) => (
              <code className="rounded bg-muted/50 px-1.5 py-0.5 text-xs text-muted-foreground">
                {JSON.stringify(row.payload)}
              </code>
            ),
          },
          {
            header: "Status",
            accessor: (row) => <StatusBadge status={row.status as string} />,
          },
          {
            header: "Actions",
            accessor: (row) =>
              row.status === "pending" ? (
                <ApprovalActions approvalId={row.id as string} />
              ) : null,
          },
        ]}
        data={approvals as Array<Record<string, unknown>>}
        emptyMessage="No approvals found."
      />
    </div>
  );
}
