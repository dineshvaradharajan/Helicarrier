import { appService, recipeService } from "@helicarrier/core";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { AppWindow, ArrowRight } from "lucide-react";

export default async function AppsPage() {
  const [apps, recipes] = await Promise.all([
    appService.list(),
    recipeService.list(),
  ]);

  const recipeMap = new Map(recipes.map((r) => [r.id, r]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Applications</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          All scaffolded applications and their current status
        </p>
      </div>

      {apps.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/50 bg-card/30 py-20">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/50">
            <AppWindow className="h-7 w-7 text-muted-foreground/50" />
          </div>
          <p className="text-sm text-muted-foreground">No applications yet</p>
          <p className="mt-1 text-xs text-muted-foreground/60">
            Applications are created via the CLI using recipes
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {apps.map((app) => {
            const recipe = recipeMap.get(app.recipeId as string);
            const config = app.resolvedConfig as {
              stack?: {
                framework?: string;
                language?: string;
                styling?: string;
              };
            } | null;

            return (
              <Link key={app.id} href={`/apps/${app.id}`}>
                <Card className="group cursor-pointer overflow-hidden transition-all hover:shadow-lg hover:shadow-black/20">
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-base font-semibold tracking-tight">
                        {app.name}
                      </h3>
                      <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                        {app.slug}
                      </p>
                    </div>
                    <StatusBadge status={app.status as string} />
                  </div>

                  {/* Stack tags */}
                  {config?.stack && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {config.stack.framework && (
                        <Badge variant="outline">
                          {config.stack.framework}
                        </Badge>
                      )}
                      {config.stack.language && (
                        <Badge variant="outline">
                          {config.stack.language}
                        </Badge>
                      )}
                      {config.stack.styling && (
                        <Badge variant="outline">
                          {config.stack.styling}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Recipe info */}
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Recipe:{" "}
                      <span className="font-medium text-foreground">
                        {recipe?.name ?? "Unknown"}
                      </span>
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
