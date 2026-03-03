import { appService, recipeService, userService } from "@helicarrier/core";
import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/status-badge";
import Link from "next/link";
import {
  ArrowLeft,
  Box,
  Code,
  Paintbrush,
  TestTube,
  BookOpen,
  User,
  Clock,
  Library,
} from "lucide-react";

export default async function AppDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let app;
  try {
    app = await appService.getById(id);
  } catch {
    notFound();
  }

  let recipe;
  try {
    recipe = await recipeService.getById(app.recipeId as string);
  } catch {
    recipe = null;
  }

  let owner;
  try {
    owner = await userService.getById(app.ownerId as string);
  } catch {
    owner = null;
  }

  const config = app.resolvedConfig as {
    stack?: {
      framework?: string;
      language?: string;
      styling?: string;
      testing?: string;
    };
  } | null;

  const additionalLibs = (app.additionalLibs ?? []) as string[];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/apps"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">
              {app.name}
            </h1>
            <StatusBadge status={app.status as string} />
          </div>
          <p className="mt-0.5 font-mono text-sm text-muted-foreground">
            {app.slug}
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            icon: BookOpen,
            label: "Recipe",
            value: recipe?.name ?? "Unknown",
            href: recipe ? `/recipes/${recipe.id}` : undefined,
          },
          {
            icon: User,
            label: "Owner",
            value: owner?.displayName ?? "Unknown",
          },
          {
            icon: Clock,
            label: "Created",
            value: new Date(app.createdAt).toLocaleDateString(),
          },
          {
            icon: Library,
            label: "Extra Libraries",
            value: additionalLibs.length > 0 ? `${additionalLibs.length}` : "None",
          },
        ].map((item) => (
          <Card key={item.label} className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <item.icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{item.label}</p>
                {"href" in item && item.href ? (
                  <Link
                    href={item.href}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    {item.value}
                  </Link>
                ) : (
                  <p className="text-sm font-medium">{item.value}</p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Tech Stack */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-info/10">
            <Box className="h-3.5 w-3.5 text-info" />
          </div>
          <h2 className="text-lg font-semibold tracking-tight">Tech Stack</h2>
        </div>

        <Card>
          <CardContent className="pt-6">
            {config?.stack ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { icon: Box, label: "Framework", value: config.stack.framework },
                  { icon: Code, label: "Language", value: config.stack.language },
                  { icon: Paintbrush, label: "Styling", value: config.stack.styling },
                  { icon: TestTube, label: "Testing", value: config.stack.testing },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 rounded-lg bg-muted/30 px-3 py-2.5"
                  >
                    <item.icon className="h-4 w-4 text-info" />
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {item.label}
                      </p>
                      <p className="text-sm font-medium">
                        {item.value ?? "N/A"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No resolved stack configuration
              </p>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Additional Libraries */}
      {additionalLibs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Additional Libraries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              {additionalLibs.map((lib) => (
                <Badge key={lib} variant="outline">
                  {lib}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resolved Config */}
      <Card>
        <CardHeader>
          <CardTitle>Resolved Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="overflow-x-auto rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
            {JSON.stringify(app.resolvedConfig, null, 2)}
          </pre>
        </CardContent>
      </Card>

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Metadata</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2">
            <span className="text-muted-foreground">Status</span>
            <StatusBadge status={app.status as string} />
          </div>
          <div className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2">
            <span className="text-muted-foreground">Created</span>
            <span className="font-mono text-xs">
              {new Date(app.createdAt).toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2">
            <span className="text-muted-foreground">Last Updated</span>
            <span className="font-mono text-xs">
              {new Date(app.updatedAt).toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2">
            <span className="text-muted-foreground">ID</span>
            <span className="font-mono text-xs">{app.id}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
