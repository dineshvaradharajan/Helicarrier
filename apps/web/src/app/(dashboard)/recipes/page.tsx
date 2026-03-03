import { recipeService } from "@helicarrier/core";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { RECIPE_TEMPLATES } from "@/lib/recipe-templates";
import { Plus, ArrowRight, Layers, Box, ShieldCheck, Sparkles, Cpu } from "lucide-react";

export default async function RecipesPage() {
  const recipes = await recipeService.list(false);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Recipes</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Governance templates for application scaffolding
          </p>
        </div>
        <Link href="/recipes/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Custom Recipe
          </Button>
        </Link>
      </div>

      {/* Existing Recipes */}
      {recipes.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
              <Layers className="h-3.5 w-3.5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold tracking-tight">
              Your Recipes
            </h2>
            <Badge variant="outline">{recipes.length}</Badge>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recipes.map((recipe) => {
              const def = recipe.definition as {
                description?: string;
                stack?: {
                  framework?: string;
                  language?: string;
                  styling?: string;
                  testing?: string;
                };
                libraries?: { allowed?: string[]; denied?: string[] };
              };
              const stages = (recipe.pipelineStages ?? []) as Array<{
                name?: string;
                type?: string;
                required?: boolean;
              }>;

              return (
                <Card
                  key={recipe.id}
                  className="group relative overflow-hidden"
                >
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-base font-semibold tracking-tight">
                        {recipe.name}
                      </h3>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        v{recipe.version}
                      </p>
                    </div>
                    <StatusBadge
                      status={recipe.isActive ? "active" : "inactive"}
                    />
                  </div>

                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground line-clamp-2">
                    {def.description ?? "No description"}
                  </p>

                  <div className="mt-4">
                    <div className="mb-2 flex items-center gap-1.5">
                      <Box className="h-3 w-3 text-info" />
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                        Tech Stack
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {def.stack?.framework && (
                        <Badge variant="outline">{def.stack.framework}</Badge>
                      )}
                      {def.stack?.language && (
                        <Badge variant="outline">{def.stack.language}</Badge>
                      )}
                      {def.stack?.styling && (
                        <Badge variant="outline">{def.stack.styling}</Badge>
                      )}
                      {def.stack?.testing && (
                        <Badge variant="outline">{def.stack.testing}</Badge>
                      )}
                    </div>
                  </div>

                  {stages.length > 0 && (
                    <div className="mt-3">
                      <div className="mb-2 flex items-center gap-1.5">
                        <ShieldCheck className="h-3 w-3 text-warning" />
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                          Compliance
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {stages.map((s, i) => (
                          <Badge
                            key={i}
                            variant={s.required ? "warning" : "outline"}
                          >
                            {s.name ?? s.type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-5 border-t border-border/30 pt-4">
                    <Link
                      href={`/recipes/${recipe.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-primary transition-colors hover:text-primary/80"
                    >
                      View details
                      <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* Template Recipes */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-warning/10">
            <Sparkles className="h-3.5 w-3.5 text-warning" />
          </div>
          <h2 className="text-lg font-semibold tracking-tight">
            Start from a Template
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {RECIPE_TEMPLATES.map((tpl) => (
            <Card
              key={tpl.id}
              className="group relative overflow-hidden"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-warning/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-base font-semibold tracking-tight">
                    {tpl.label}
                  </h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    template
                  </p>
                </div>
                {tpl.aiRecommended ? (
                  <Badge variant="default">
                    <Cpu className="mr-1 h-2.5 w-2.5" />
                    AI Rec
                  </Badge>
                ) : (
                  <Badge variant="outline">template</Badge>
                )}
              </div>

              <p className="mt-3 text-sm leading-relaxed text-muted-foreground line-clamp-2">
                {tpl.description}
              </p>

              <div className="mt-4">
                <div className="mb-2 flex items-center gap-1.5">
                  <Box className="h-3 w-3 text-info" />
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Tech Stack
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="outline">{tpl.framework}</Badge>
                  <Badge variant="outline">{tpl.language}</Badge>
                  {tpl.styling && (
                    <Badge variant="outline">{tpl.styling}</Badge>
                  )}
                  {tpl.testing && (
                    <Badge variant="outline">{tpl.testing}</Badge>
                  )}
                </div>
              </div>

              <div className="mt-5 border-t border-border/30 pt-4">
                <Link
                  href={`/recipes/new?template=${tpl.id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-primary transition-colors hover:text-primary/80"
                >
                  Use this template
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
