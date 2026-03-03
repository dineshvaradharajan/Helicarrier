import { complianceService } from "@helicarrier/core";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { ComplianceConfig } from "@/components/compliance/compliance-config";
import { ShieldCheck, Workflow, ScrollText } from "lucide-react";

export default async function CompliancePage() {
  const checks = await complianceService.listAll(50);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Compliance</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure compliance requirements and view audit logs
        </p>
      </div>

      {/* ═══════ REQUIREMENTS ═══════ */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-warning/10">
            <Workflow className="h-3.5 w-3.5 text-warning" />
          </div>
          <h2 className="text-lg font-semibold tracking-tight">
            Requirements
          </h2>
        </div>

        <Card>
          <CardContent className="pt-6">
            <ComplianceConfig />
          </CardContent>
        </Card>
      </section>

      {/* ═══════ AUDIT LOGS ═══════ */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-info/10">
            <ScrollText className="h-3.5 w-3.5 text-info" />
          </div>
          <h2 className="text-lg font-semibold tracking-tight">Audit Logs</h2>
        </div>

        <DataTable
          columns={[
            {
              header: "App",
              accessor: (row) => (
                <span className="font-mono text-xs">
                  {row.appId as string}
                </span>
              ),
            },
            {
              header: "Agent",
              accessor: (row) => (
                <span className="font-medium">{row.agentId as string}</span>
              ),
            },
            {
              header: "Status",
              accessor: (row) => (
                <StatusBadge status={row.status as string} />
              ),
            },
            {
              header: "Score",
              accessor: (row) => {
                const score = row.score as number | null;
                if (score === null)
                  return (
                    <span className="text-muted-foreground">—</span>
                  );
                return (
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${score}%`,
                          backgroundColor:
                            score >= 80
                              ? "var(--color-success)"
                              : score >= 50
                                ? "var(--color-warning)"
                                : "var(--color-destructive)",
                        }}
                      />
                    </div>
                    <span className="font-mono text-xs">{score}%</span>
                  </div>
                );
              },
            },
            {
              header: "Findings",
              accessor: (row) => (
                <span className="text-muted-foreground">
                  {(row.findings as unknown[])?.length ?? 0} findings
                </span>
              ),
            },
            {
              header: "Date",
              accessor: (row) => (
                <span className="font-mono text-xs text-muted-foreground">
                  {new Date(row.createdAt as string).toLocaleString()}
                </span>
              ),
            },
          ]}
          data={checks as Array<Record<string, unknown>>}
          emptyMessage="No compliance checks recorded yet."
        />
      </section>
    </div>
  );
}
