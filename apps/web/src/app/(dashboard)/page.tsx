import {
  recipeService,
  appService,
  approvalService,
  complianceService,
} from "@helicarrier/core";
import { MetricCard } from "@/components/metrics/metric-card";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  AppWindow,
  CheckCircle,
  ShieldCheck,
  ArrowRight,
  Terminal,
  Download,
} from "lucide-react";
import Link from "next/link";

export default async function OverviewPage() {
  const [recipes, apps, pendingApprovals, recentChecks] = await Promise.all([
    recipeService.list(),
    appService.list(),
    approvalService.list("pending"),
    complianceService.listAll(10),
  ]);

  const passRate =
    recentChecks.length > 0
      ? Math.round(
          (recentChecks.filter((c) => c.status === "pass").length /
            recentChecks.length) *
            100,
        )
      : 100;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Monitor your governance platform at a glance
        </p>
      </div>

      {/* CLI Banner */}
      <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-5">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15">
              <Terminal className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold tracking-tight">
                Get the Helicarrier CLI
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Scaffold apps, manage recipes, and run compliance checks from your terminal
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <code className="hidden rounded-lg bg-background/80 px-3 py-1.5 font-mono text-xs text-primary sm:block">
              npm i -g @helicarrier/cli
            </code>
            <a
              href="https://github.com/helicarrier/cli"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md hover:shadow-primary/20"
            >
              <Download className="h-4 w-4" />
              Install CLI
            </a>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="animate-fade-in stagger-1">
          <MetricCard
            title="Active Recipes"
            value={recipes.length}
            icon={<BookOpen className="h-5 w-5" />}
          />
        </div>
        <div className="animate-fade-in stagger-2">
          <MetricCard
            title="Applications"
            value={apps.length}
            icon={<AppWindow className="h-5 w-5" />}
          />
        </div>
        <div className="animate-fade-in stagger-3">
          <MetricCard
            title="Pending Approvals"
            value={pendingApprovals.length}
            icon={<CheckCircle className="h-5 w-5" />}
          />
        </div>
        <div className="animate-fade-in stagger-4">
          <MetricCard
            title="Compliance Rate"
            value={`${passRate}%`}
            description="Based on last 10 checks"
            icon={<ShieldCheck className="h-5 w-5" />}
          />
        </div>
      </div>

      {/* Two-column detail section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Compliance Checks */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Compliance</CardTitle>
            <Link
              href="/compliance"
              className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-primary"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {recentChecks.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No checks recorded yet
              </p>
            ) : (
              <div className="space-y-2">
                {recentChecks.slice(0, 5).map((check) => (
                  <div
                    key={check.id}
                    className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2.5"
                  >
                    <div className="flex items-center gap-3">
                      <StatusBadge status={check.status as string} />
                      <span className="text-xs text-muted-foreground">
                        {check.agentId}
                      </span>
                    </div>
                    <span className="text-sm font-medium font-mono">
                      {check.score !== null ? `${check.score}%` : "—"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Approvals */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Pending Approvals</CardTitle>
            <Link
              href="/approvals"
              className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-primary"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {pendingApprovals.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                All clear — no pending approvals
              </p>
            ) : (
              <div className="space-y-2">
                {pendingApprovals.slice(0, 5).map((approval) => (
                  <div
                    key={approval.id}
                    className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2.5"
                  >
                    <div>
                      <span className="text-sm font-medium">
                        {(approval.type as string).replace(/_/g, " ")}
                      </span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        App: {approval.appId}
                      </span>
                    </div>
                    <Badge variant="warning">pending</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
