"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ThemeEditor } from "@/components/themes/theme-editor";
import { ThemePreview } from "@/components/themes/theme-preview";
import type { ThemeColors } from "@helicarrier/shared";
import { ArrowLeft, Loader2 } from "lucide-react";

const DEFAULT_COLORS: ThemeColors = {
  background: "#ffffff",
  foreground: "#0a0a0a",
  primary: "#2563eb",
  primaryForeground: "#ffffff",
  secondary: "#f1f5f9",
  secondaryForeground: "#0f172a",
  muted: "#f1f5f9",
  mutedForeground: "#64748b",
  accent: "#dbeafe",
  accentForeground: "#1e40af",
  destructive: "#ef4444",
  border: "#e2e8f0",
  ring: "#2563eb",
  card: "#ffffff",
  radius: "0.5rem",
  fontFamily: "Inter, system-ui, sans-serif",
};

export default function ThemeEditorPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const isNew = id === "new";

  const [name, setName] = useState("");
  const [label, setLabel] = useState("");
  const [colors, setColors] = useState<ThemeColors>(DEFAULT_COLORS);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!isNew);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isNew) {
      fetch(`/api/v1/themes/${id}`)
        .then((r) => {
          if (!r.ok) throw new Error("Failed to load theme");
          return r.json();
        })
        .then((theme) => {
          setName(theme.name);
          setLabel(theme.label);
          setColors(theme.colors);
        })
        .catch(() => setError("Failed to load theme"))
        .finally(() => setLoading(false));
    }
  }, [id, isNew]);

  async function handleSave() {
    setSaving(true);
    setError("");

    try {
      const url = isNew ? "/api/v1/themes" : `/api/v1/themes/${id}`;
      const method = isNew ? "POST" : "PUT";
      const body = isNew ? { name, label, colors } : { label, colors };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to save theme");
        return;
      }

      router.push("/themes");
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className="text-2xl font-semibold tracking-tight">
            {isNew ? "Create Theme" : `Edit: ${label}`}
          </h1>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Theme"
            )}
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Name/Label fields (only for new) */}
      {isNew && (
        <Card>
          <CardHeader>
            <CardTitle>Theme Identity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Slug Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="my-custom-theme"
                  className="w-full rounded-lg border border-border bg-input px-3 py-2.5 text-sm text-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:border-primary/50"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Display Label
                </label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="My Custom Theme"
                  className="w-full rounded-lg border border-border bg-input px-3 py-2.5 text-sm text-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:border-primary/50"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: Color pickers */}
        <Card>
          <CardHeader>
            <CardTitle>Colors & Styling</CardTitle>
          </CardHeader>
          <CardContent>
            <ThemeEditor colors={colors} onChange={setColors} />
          </CardContent>
        </Card>

        {/* Right: Live preview */}
        <div>
          <div className="sticky top-6">
            <h2 className="mb-4 text-base font-semibold tracking-tight">
              Live Preview
            </h2>
            <ThemePreview colors={colors} />
          </div>
        </div>
      </div>
    </div>
  );
}
