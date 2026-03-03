import { appService, environmentService } from "@helicarrier/core";
import { MetricCard } from "@/components/metrics/metric-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Server, AppWindow, BarChart3 } from "lucide-react";

export default async function CostsPage() {
  const [apps, environments] = await Promise.all([
    appService.list(),
    environmentService.list(),
  ]);

  const activeEnvs = environments.filter((e) => e.status === "active");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Cost Monitoring
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track infrastructure and deployment costs
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="animate-fade-in stagger-1">
          <MetricCard
            title="Total Applications"
            value={apps.length}
            icon={<AppWindow className="h-5 w-5" />}
          />
        </div>
        <div className="animate-fade-in stagger-2">
          <MetricCard
            title="Active Environments"
            value={activeEnvs.length}
            icon={<Server className="h-5 w-5" />}
          />
        </div>
        <div className="animate-fade-in stagger-3">
          <MetricCard
            title="Est. Monthly Cost"
            value="$0"
            description="Cost tracking not yet configured"
            icon={<DollarSign className="h-5 w-5" />}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cost Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/50">
              <BarChart3 className="h-7 w-7 text-muted-foreground/40" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              No cost data available
            </p>
            <p className="mt-1 max-w-sm text-center text-xs text-muted-foreground/60">
              Cost monitoring will be available once deployment providers are
              configured. Connect your cloud provider accounts to see real-time
              cost data.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
