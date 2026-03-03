"use client";

import type { ThemeColors } from "@helicarrier/shared";

interface ThemeEditorProps {
  colors: ThemeColors;
  onChange: (colors: ThemeColors) => void;
}

const COLOR_GROUPS = [
  {
    label: "Surfaces",
    fields: [
      { key: "background", label: "Background" },
      { key: "card", label: "Card" },
      { key: "muted", label: "Muted" },
    ],
  },
  {
    label: "Text",
    fields: [
      { key: "foreground", label: "Foreground" },
      { key: "mutedForeground", label: "Muted Text" },
    ],
  },
  {
    label: "Accents",
    fields: [
      { key: "primary", label: "Primary" },
      { key: "primaryForeground", label: "Primary Text" },
      { key: "secondary", label: "Secondary" },
      { key: "secondaryForeground", label: "Secondary Text" },
      { key: "accent", label: "Accent" },
      { key: "accentForeground", label: "Accent Text" },
    ],
  },
  {
    label: "Feedback",
    fields: [
      { key: "destructive", label: "Destructive" },
      { key: "border", label: "Border" },
      { key: "ring", label: "Ring" },
    ],
  },
] as const;

export function ThemeEditor({ colors, onChange }: ThemeEditorProps) {
  function updateColor(key: string, value: string) {
    onChange({ ...colors, [key]: value });
  }

  return (
    <div className="space-y-6">
      {COLOR_GROUPS.map((group) => (
        <div key={group.label}>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {group.label}
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {group.fields.map((field) => (
              <div
                key={field.key}
                className="flex items-center gap-3 rounded-lg bg-muted/20 px-3 py-2"
              >
                <input
                  type="color"
                  value={colors[field.key as keyof ThemeColors] as string}
                  onChange={(e) => updateColor(field.key, e.target.value)}
                  className="h-7 w-7 cursor-pointer rounded-md border border-border bg-transparent"
                />
                <div className="flex-1">
                  <label className="text-xs font-medium text-foreground">
                    {field.label}
                  </label>
                  <input
                    type="text"
                    value={colors[field.key as keyof ThemeColors] as string}
                    onChange={(e) => updateColor(field.key, e.target.value)}
                    className="mt-0.5 block w-full rounded-md border border-border bg-input px-2 py-1 font-mono text-xs text-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/50"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Radius */}
      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Shape
        </h3>
        <div className="flex items-center gap-3 rounded-lg bg-muted/20 px-3 py-3">
          <label className="w-14 text-xs font-medium">Radius</label>
          <input
            type="range"
            min="0"
            max="1.5"
            step="0.125"
            value={parseFloat(colors.radius)}
            onChange={(e) => updateColor("radius", `${e.target.value}rem`)}
            className="flex-1 accent-primary"
          />
          <span className="w-16 text-right font-mono text-xs text-muted-foreground">
            {colors.radius}
          </span>
        </div>
      </div>

      {/* Font */}
      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Typography
        </h3>
        <select
          value={colors.fontFamily}
          onChange={(e) => updateColor("fontFamily", e.target.value)}
          className="w-full rounded-lg border border-border bg-input px-3 py-2.5 text-sm text-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/50"
        >
          <option value="Inter, system-ui, sans-serif">Inter</option>
          <option value="'IBM Plex Sans', system-ui, sans-serif">
            IBM Plex Sans
          </option>
          <option value="'Source Sans 3', system-ui, sans-serif">
            Source Sans 3
          </option>
          <option value="system-ui, sans-serif">System UI</option>
          <option value="'JetBrains Mono', monospace">JetBrains Mono</option>
        </select>
      </div>
    </div>
  );
}
