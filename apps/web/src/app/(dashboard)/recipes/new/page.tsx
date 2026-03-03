"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { RECIPE_TEMPLATES } from "@/lib/recipe-templates";
import { ArrowLeft, Box, Loader2, Palette } from "lucide-react";

interface ThemeOption {
  id: string;
  name: string;
  label: string;
}

const FRAMEWORKS = [
  "next.js", "react", "vue", "angular", "svelte", "express", "fastify",
  "remix", "nuxt", "astro", "nestjs", "hono",
  "django", "flask", "fastapi", "streamlit",
  "spring-boot", "quarkus", "ktor",
  "gin", "fiber", "echo",
  "actix-web", "axum",
  "rails", "sinatra",
  "aspnet-core", "blazor",
  "react-native", "flutter", "swiftui",
];

const LANGUAGES = [
  "typescript", "javascript", "python", "java", "kotlin",
  "go", "rust", "ruby", "csharp", "swift", "dart",
];

const STYLING_OPTIONS = [
  { value: "", label: "None" },
  { value: "tailwindcss", label: "Tailwind CSS" },
  { value: "css-modules", label: "CSS Modules" },
  { value: "styled-components", label: "Styled Components" },
  { value: "sass", label: "Sass" },
  { value: "emotion", label: "Emotion" },
  { value: "bootstrap", label: "Bootstrap" },
  { value: "material-ui", label: "Material UI" },
  { value: "chakra-ui", label: "Chakra UI" },
  { value: "ant-design", label: "Ant Design" },
];

const TESTING_OPTIONS = [
  { value: "", label: "None" },
  { value: "vitest", label: "Vitest" },
  { value: "jest", label: "Jest" },
  { value: "playwright", label: "Playwright" },
  { value: "cypress", label: "Cypress" },
  { value: "pytest", label: "pytest" },
  { value: "unittest", label: "unittest (Python)" },
  { value: "junit", label: "JUnit" },
  { value: "go-test", label: "Go test" },
  { value: "rspec", label: "RSpec" },
  { value: "xunit", label: "xUnit (.NET)" },
  { value: "xctest", label: "XCTest (Swift)" },
];

export default function NewRecipePage() {
  return (
    <Suspense>
      <NewRecipeForm />
    </Suspense>
  );
}

function NewRecipeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [version, setVersion] = useState("1.0.0");
  const [framework, setFramework] = useState("next.js");
  const [language, setLanguage] = useState("typescript");
  const [styling, setStyling] = useState("tailwindcss");
  const [testing, setTesting] = useState("vitest");
  const [allowedLibs, setAllowedLibs] = useState("");
  const [deniedLibs, setDeniedLibs] = useState("");
  const [themeId, setThemeId] = useState("");
  const [themes, setThemes] = useState<ThemeOption[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Apply template from URL query param
  useEffect(() => {
    const templateId = searchParams.get("template");
    if (templateId) {
      const tpl = RECIPE_TEMPLATES.find((t) => t.id === templateId);
      if (tpl) {
        setName(tpl.name);
        setDescription(tpl.description);
        setFramework(tpl.framework);
        setLanguage(tpl.language);
        setStyling(tpl.styling);
        setTesting(tpl.testing);
        setAllowedLibs(tpl.allowedLibs);
        setDeniedLibs(tpl.deniedLibs);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    fetch("/api/v1/themes")
      .then((r) => {
        if (!r.ok) return [];
        return r.json();
      })
      .then((data: ThemeOption[]) => setThemes(data))
      .catch(() => {});
  }, []);

  function buildYaml(): string {
    const allowed = allowedLibs
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const denied = deniedLibs
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const lines: string[] = [
      `name: ${name}`,
      `description: "${description}"`,
      `version: '${version}'`,
      `stack:`,
      `  framework: ${framework}`,
      `  language: ${language}`,
    ];
    if (styling) lines.push(`  styling: ${styling}`);
    if (testing) lines.push(`  testing: ${testing}`);
    lines.push(`libraries:`);
    lines.push(`  allowed: [${allowed.join(", ")}]`);
    lines.push(`  denied: [${denied.join(", ")}]`);
    lines.push(`agents: [license-compliance]`);
    lines.push(`scaffold:`);
    lines.push(`  template: ${name || "default"}`);
    lines.push(`  postCreate: [pnpm install]`);
    return lines.join("\n");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const yaml = buildYaml();
      const res = await fetch("/api/v1/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          yaml,
          themeId: themeId || undefined,
          pipeline: [],
        }),
      });
      if (!res.ok) {
        const body = await res.json();
        setError(body.error ?? "Failed to create recipe");
        return;
      }
      router.push("/recipes");
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-border bg-input px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:border-primary/50";

  const templateId = searchParams.get("template");
  const appliedTemplate = templateId
    ? RECIPE_TEMPLATES.find((t) => t.id === templateId)
    : null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Create Recipe
          </h1>
          {appliedTemplate && (
            <p className="mt-0.5 text-xs text-primary">
              From template: {appliedTemplate.label}
            </p>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Recipe Details */}
        <Card>
          <CardHeader>
            <CardTitle>Recipe Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="my-enterprise-app"
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Version
                </label>
                <input
                  type="text"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  placeholder="1.0.0"
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this recipe is for..."
                rows={2}
                className={inputClass}
              />
            </div>
          </CardContent>
        </Card>

        {/* Tech Stack */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-info/10">
              <Box className="h-3.5 w-3.5 text-info" />
            </div>
            <h2 className="text-lg font-semibold tracking-tight">
              Tech Stack
            </h2>
          </div>

          <Card>
            <CardContent className="space-y-5 pt-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                    Framework
                  </label>
                  <select
                    value={framework}
                    onChange={(e) => setFramework(e.target.value)}
                    className={inputClass}
                  >
                    {FRAMEWORKS.map((fw) => (
                      <option key={fw} value={fw}>
                        {fw}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                    Language
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className={inputClass}
                  >
                    {LANGUAGES.map((lang) => (
                      <option key={lang} value={lang}>
                        {lang}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                    Styling
                  </label>
                  <select
                    value={styling}
                    onChange={(e) => setStyling(e.target.value)}
                    className={inputClass}
                  >
                    {STYLING_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                    Testing
                  </label>
                  <select
                    value={testing}
                    onChange={(e) => setTesting(e.target.value)}
                    className={inputClass}
                  >
                    {TESTING_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="border-t border-border/30" />

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                    Allowed Libraries{" "}
                    <span className="text-muted-foreground/50">
                      (comma-separated)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={allowedLibs}
                    onChange={(e) => setAllowedLibs(e.target.value)}
                    placeholder="react, next, zod, drizzle-orm"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                    Denied Libraries{" "}
                    <span className="text-muted-foreground/50">
                      (comma-separated)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={deniedLibs}
                    onChange={(e) => setDeniedLibs(e.target.value)}
                    placeholder="jquery, moment, lodash"
                    className={inputClass}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Theme */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
              <Palette className="h-3.5 w-3.5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold tracking-tight">Theme</h2>
          </div>
          <Card>
            <CardContent className="pt-6">
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Application Theme
              </label>
              <select
                value={themeId}
                onChange={(e) => setThemeId(e.target.value)}
                className={inputClass}
              >
                <option value="">None</option>
                {themes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </CardContent>
          </Card>
        </section>

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Recipe"
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
