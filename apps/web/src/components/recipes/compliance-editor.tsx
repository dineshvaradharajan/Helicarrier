"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  PIPELINE_STAGE_TYPES,
  PIPELINE_STAGE_LABELS,
  type PipelineStageType,
} from "@helicarrier/shared";
import { Plus, X, ChevronUp, ChevronDown, Loader2 } from "lucide-react";

interface PipelineStageInput {
  name: string;
  type: PipelineStageType;
  required: boolean;
  order?: number;
}

interface ComplianceEditorProps {
  recipeId: string;
  initialStages: PipelineStageInput[];
}

export function ComplianceEditor({
  recipeId,
  initialStages,
}: ComplianceEditorProps) {
  const router = useRouter();
  const [pipeline, setPipeline] =
    useState<PipelineStageInput[]>(initialStages);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  function addStage(type: PipelineStageType) {
    if (pipeline.some((s) => s.type === type)) return;
    setPipeline([
      ...pipeline,
      { name: PIPELINE_STAGE_LABELS[type], type, required: false },
    ]);
  }

  function removeStage(index: number) {
    setPipeline(pipeline.filter((_, i) => i !== index));
  }

  function toggleRequired(index: number) {
    setPipeline(
      pipeline.map((s, i) =>
        i === index ? { ...s, required: !s.required } : s,
      ),
    );
  }

  function moveStage(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= pipeline.length) return;
    const next = [...pipeline];
    [next[index], next[target]] = [next[target], next[index]];
    setPipeline(next);
  }

  async function handleSave() {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch(`/api/v1/recipes/${recipeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pipelineStages: pipeline.map((s, i) => ({
            name: s.name,
            type: s.type,
            required: s.required,
            order: i,
            config: {},
          })),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setMessage(data.error ?? "Failed to save");
        return;
      }
      setMessage("Compliance stages saved");
      router.refresh();
    } catch {
      setMessage("Network error");
    } finally {
      setSaving(false);
    }
  }

  const availableStages = PIPELINE_STAGE_TYPES.filter(
    (t) => t !== "custom" && !pipeline.some((s) => s.type === t),
  );

  return (
    <div className="space-y-5">
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
      {pipeline.length > 0 ? (
        <div className="space-y-0">
          {pipeline.map((stage, i) => (
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
                {i < pipeline.length - 1 && (
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
                  disabled={i === pipeline.length - 1}
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
        <p className="text-sm text-muted-foreground">
          No compliance stages configured. Add stages above to enforce
          compliance requirements.
        </p>
      )}

      {/* Save button & feedback */}
      <div className="flex items-center gap-3 border-t border-border/30 pt-4">
        <Button onClick={handleSave} disabled={saving} size="sm">
          {saving ? (
            <>
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Compliance"
          )}
        </Button>
        {message && (
          <span
            className={`text-xs ${message.includes("saved") ? "text-success" : "text-destructive"}`}
          >
            {message}
          </span>
        )}
      </div>
    </div>
  );
}
