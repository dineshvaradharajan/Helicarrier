"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  PIPELINE_STAGE_TYPES,
  PIPELINE_STAGE_LABELS,
  type PipelineStageType,
} from "@helicarrier/shared";
import { Plus, X, ChevronUp, ChevronDown, Loader2, CheckCircle } from "lucide-react";

interface ComplianceStage {
  name: string;
  type: PipelineStageType;
  required: boolean;
}

export function ComplianceConfig() {
  const [stages, setStages] = useState<ComplianceStage[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/v1/settings")
      .then((r) => {
        if (!r.ok) return [];
        return r.json();
      })
      .then((settings: Array<{ key: string; value: unknown }>) => {
        const config = settings.find((s) => s.key === "compliance_requirements");
        if (config && Array.isArray(config.value)) {
          setStages(config.value as ComplianceStage[]);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function addStage(type: PipelineStageType) {
    if (stages.some((s) => s.type === type)) return;
    setStages([
      ...stages,
      { name: PIPELINE_STAGE_LABELS[type], type, required: false },
    ]);
  }

  function removeStage(index: number) {
    setStages(stages.filter((_, i) => i !== index));
  }

  function toggleRequired(index: number) {
    setStages(
      stages.map((s, i) =>
        i === index ? { ...s, required: !s.required } : s,
      ),
    );
  }

  function moveStage(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= stages.length) return;
    const next = [...stages];
    [next[index], next[target]] = [next[target], next[index]];
    setStages(next);
  }

  async function handleSave() {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/v1/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "compliance_requirements",
          value: stages,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setMessage(data.error ?? "Failed to save");
        return;
      }
      setMessage("Compliance requirements saved");
    } catch {
      setMessage("Network error");
    } finally {
      setSaving(false);
    }
  }

  const availableStages = PIPELINE_STAGE_TYPES.filter(
    (t) => t !== "custom" && !stages.some((s) => s.type === t),
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">
        Define the compliance pipeline stages that all applications must pass
        through. These requirements apply across all recipes.
      </p>

      {/* Add stage buttons */}
      <div className="flex flex-wrap gap-2">
        {availableStages.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => addStage(type)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-border bg-transparent px-2.5 py-1.5 text-xs text-muted-foreground transition-all hover:border-warning/40 hover:text-warning hover:bg-warning/5"
          >
            <Plus className="h-3 w-3" />
            {PIPELINE_STAGE_LABELS[type]}
          </button>
        ))}
        {availableStages.length === 0 && (
          <span className="text-xs text-muted-foreground/50">
            All stages added
          </span>
        )}
      </div>

      {/* Pipeline flow */}
      {stages.length > 0 ? (
        <div className="space-y-0">
          {stages.map((stage, i) => (
            <div key={`${stage.type}-${i}`} className="flex items-start">
              <div className="mr-3 flex flex-col items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors ${
                    stage.required
                      ? "border-warning bg-warning/15 text-warning"
                      : "border-border bg-muted text-muted-foreground"
                  }`}
                >
                  {i + 1}
                </div>
                {i < stages.length - 1 && (
                  <div className="h-8 w-px bg-border/50" />
                )}
              </div>

              <div className="mb-2 flex flex-1 items-center gap-2 rounded-lg border border-border/50 bg-muted/30 px-3 py-2.5 transition-colors hover:border-border">
                <div className="flex-1">
                  <span className="text-sm font-medium">{stage.name}</span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {stage.type}
                  </span>
                </div>

                <label className="flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={stage.required}
                    onChange={() => toggleRequired(i)}
                    className="rounded accent-warning"
                  />
                  Required
                </label>

                <button
                  type="button"
                  onClick={() => moveStage(i, -1)}
                  disabled={i === 0}
                  className="rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-20"
                >
                  <ChevronUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => moveStage(i, 1)}
                  disabled={i === stages.length - 1}
                  className="rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-20"
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => removeStage(i)}
                  className="rounded p-0.5 text-muted-foreground transition-colors hover:text-destructive"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border/50 bg-card/30 py-10 text-center">
          <p className="text-sm text-muted-foreground">
            No compliance requirements configured
          </p>
          <p className="mt-1 text-xs text-muted-foreground/50">
            Add stages above to enforce compliance across all applications
          </p>
        </div>
      )}

      {/* Save */}
      <div className="flex items-center gap-3 border-t border-border/30 pt-4">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Requirements"
          )}
        </Button>
        {message && (
          <span
            className={`flex items-center gap-1.5 text-xs ${message.includes("saved") ? "text-success" : "text-destructive"}`}
          >
            {message.includes("saved") && <CheckCircle className="h-3.5 w-3.5" />}
            {message}
          </span>
        )}
      </div>
    </div>
  );
}
