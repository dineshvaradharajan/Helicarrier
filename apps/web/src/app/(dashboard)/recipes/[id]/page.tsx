import { recipeService } from "@helicarrier/core";
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
} from "lucide-react";

export default async function RecipeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let recipe;
  try {
    recipe = await recipeService.getById(id);
  } catch {
    notFound();
  }

  const def = recipe.definition as {
    name?: string;
    description?: string;
    version?: string;
    stack?: {
      framework?: string;
      language?: string;
      styling?: string;
      testing?: string;
    };
    libraries?: { allowed?: string[]; denied?: string[] };
    scaffold?: { template?: string; postCreate?: string[] };
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/recipes"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">
              {recipe.name}
            </h1>
            <StatusBadge
              status={recipe.isActive ? "active" : "inactive"}
            />
            <Badge variant="outline">v{recipe.version}</Badge>
          </div>
          {def.description && (
            <p className="mt-1 text-sm text-muted-foreground">
              {def.description}
            </p>
          )}
        </div>
      </div>

      {/* Tech Stack */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-info/10">
            <Box className="h-3.5 w-3.5 text-info" />
          </div>
          <h2 className="text-lg font-semibold tracking-tight">Tech Stack</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Box, label: "Framework", value: def.stack?.framework ?? "N/A" },
            { icon: Code, label: "Language", value: def.stack?.language ?? "N/A" },
            { icon: Paintbrush, label: "Styling", value: def.stack?.styling ?? "N/A" },
            { icon: TestTube, label: "Testing", value: def.stack?.testing ?? "N/A" },
          ].map((item) => (
            <Card key={item.label} className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-info/10">
                  <item.icon className="h-4 w-4 text-info" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-sm font-medium">{item.value}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Library Rules */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <CardTitle>Library Rules</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Allowed
              </p>
              <div className="flex flex-wrap gap-1.5">
                {def.libraries?.allowed && def.libraries.allowed.length > 0 ? (
                  def.libraries.allowed.map((lib) => (
                    <Badge key={lib} variant="success">{lib}</Badge>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground">
                    All libraries allowed (no allowlist)
                  </span>
                )}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Denied
              </p>
              <div className="flex flex-wrap gap-1.5">
                {def.libraries?.denied && def.libraries.denied.length > 0 ? (
                  def.libraries.denied.map((lib) => (
                    <Badge key={lib} variant="destructive">{lib}</Badge>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground">
                    No denied libraries
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scaffold Config */}
        {def.scaffold && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Code className="h-4 w-4 text-muted-foreground" />
                <CardTitle>Scaffold</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {def.scaffold.template && (
                <div className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2">
                  <span className="text-sm text-muted-foreground">Template</span>
                  <span className="font-mono text-xs">{def.scaffold.template}</span>
                </div>
              )}
              {def.scaffold.postCreate && def.scaffold.postCreate.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-medium text-muted-foreground">
                    Post-create commands
                  </p>
                  <div className="space-y-1">
                    {def.scaffold.postCreate.map((cmd, i) => (
                      <div
                        key={i}
                        className="rounded-lg bg-muted/30 px-3 py-2 font-mono text-xs text-muted-foreground"
                      >
                        $ {cmd}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </section>

      {/* Full Definition */}
      <Card>
        <CardHeader>
          <CardTitle>Full Definition</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="overflow-x-auto rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
            {JSON.stringify(recipe.definition, null, 2)}
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
            <span className="text-muted-foreground">Created</span>
            <span className="font-mono text-xs">
              {new Date(recipe.createdAt).toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2">
            <span className="text-muted-foreground">Last Updated</span>
            <span className="font-mono text-xs">
              {new Date(recipe.updatedAt).toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2">
            <span className="text-muted-foreground">ID</span>
            <span className="font-mono text-xs">{recipe.id}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
