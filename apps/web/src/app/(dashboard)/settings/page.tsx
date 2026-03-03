"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  AI_PROVIDERS,
  AI_PROVIDER_LABELS,
  type AiProvider,
} from "@helicarrier/shared";
import { Loader2, CheckCircle, Cpu } from "lucide-react";

export default function SettingsPage() {
  const [provider, setProvider] = useState<AiProvider>("claude");
  const [model, setModel] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/v1/settings")
      .then((r) => r.json())
      .then((settings: Array<{ key: string; value: unknown }>) => {
        const aiSetting = settings.find((s) => s.key === "ai_provider");
        if (aiSetting) {
          const val = aiSetting.value as {
            provider: AiProvider;
            model?: string;
          };
          setProvider(val.provider);
          setModel(val.model ?? "");
        }
      })
      .catch(() => setMessage("Failed to load settings"))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/v1/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "ai_provider",
          value: { provider, model: model || undefined },
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setMessage(data.error ?? "Failed to save");
        return;
      }

      setMessage("Settings saved successfully");
    } catch {
      setMessage("Network error");
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
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Platform configuration and preferences
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Cpu className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle>AI Provider</CardTitle>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Default provider for app scaffolding
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <p className="text-sm text-muted-foreground">
            Set the default AI provider for application scaffolding. Users can
            override this at CLI level with the{" "}
            <code className="rounded bg-muted/50 px-1.5 py-0.5 text-xs text-primary">
              --provider
            </code>{" "}
            flag.
          </p>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Provider
            </label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value as AiProvider)}
              className="w-full rounded-lg border border-border bg-input px-3 py-2.5 text-sm text-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:border-primary/50"
            >
              {AI_PROVIDERS.map((p) => (
                <option key={p} value={p}>
                  {AI_PROVIDER_LABELS[p]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Model Override{" "}
              <span className="text-muted-foreground/50">(optional)</span>
            </label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="e.g. claude-sonnet-4-20250514"
              className="w-full rounded-lg border border-border bg-input px-3 py-2.5 text-sm font-mono text-foreground placeholder:text-muted-foreground/40 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:border-primary/50"
            />
          </div>

          {message && (
            <div
              className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm ${
                message.includes("success")
                  ? "border border-success/30 bg-success/10 text-success"
                  : "border border-destructive/30 bg-destructive/10 text-destructive"
              }`}
            >
              {message.includes("success") && (
                <CheckCircle className="h-4 w-4" />
              )}
              {message}
            </div>
          )}

          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Settings"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
