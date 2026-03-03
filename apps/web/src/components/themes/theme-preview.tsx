"use client";

import type { ThemeColors } from "@helicarrier/shared";

export function ThemePreview({ colors }: { colors: ThemeColors }) {
  const style = {
    "--preview-bg": colors.background,
    "--preview-fg": colors.foreground,
    "--preview-primary": colors.primary,
    "--preview-primary-fg": colors.primaryForeground,
    "--preview-secondary": colors.secondary,
    "--preview-secondary-fg": colors.secondaryForeground,
    "--preview-muted": colors.muted,
    "--preview-muted-fg": colors.mutedForeground,
    "--preview-accent": colors.accent,
    "--preview-accent-fg": colors.accentForeground,
    "--preview-destructive": colors.destructive,
    "--preview-border": colors.border,
    "--preview-card": colors.card,
    "--preview-radius": colors.radius,
  } as React.CSSProperties;

  return (
    <div
      className="overflow-hidden rounded-xl border shadow-lg"
      style={{
        ...style,
        backgroundColor: "var(--preview-bg)",
        color: "var(--preview-fg)",
        fontFamily: colors.fontFamily,
        borderColor: "var(--preview-border)",
      }}
    >
      {/* Mini sidebar + content */}
      <div className="flex">
        <div
          className="w-36 border-r p-3 space-y-2"
          style={{
            backgroundColor: "var(--preview-card)",
            borderColor: "var(--preview-border)",
          }}
        >
          <div
            className="text-xs font-bold mb-3"
            style={{ color: "var(--preview-primary)" }}
          >
            Helicarrier
          </div>
          {["Overview", "Recipes", "Themes"].map((item, i) => (
            <div
              key={item}
              className="rounded px-2 py-1 text-[10px]"
              style={
                i === 2
                  ? {
                      backgroundColor: "var(--preview-primary)",
                      color: "var(--preview-primary-fg)",
                      borderRadius: "var(--preview-radius)",
                    }
                  : { color: "var(--preview-muted-fg)" }
              }
            >
              {item}
            </div>
          ))}
        </div>

        {/* Main content */}
        <div className="flex-1 p-3 space-y-3">
          <div className="text-xs font-semibold">Dashboard</div>

          {/* Cards row */}
          <div className="flex gap-2">
            {[
              { label: "Apps", value: "12" },
              { label: "Recipes", value: "5" },
              { label: "Users", value: "48" },
            ].map((card) => (
              <div
                key={card.label}
                className="flex-1 rounded p-2"
                style={{
                  backgroundColor: "var(--preview-card)",
                  border: "1px solid var(--preview-border)",
                  borderRadius: "var(--preview-radius)",
                }}
              >
                <div
                  className="text-[9px]"
                  style={{ color: "var(--preview-muted-fg)" }}
                >
                  {card.label}
                </div>
                <div className="text-sm font-bold">{card.value}</div>
              </div>
            ))}
          </div>

          {/* Buttons row */}
          <div className="flex gap-2">
            <div
              className="rounded px-2 py-1 text-[10px] font-medium"
              style={{
                backgroundColor: "var(--preview-primary)",
                color: "var(--preview-primary-fg)",
                borderRadius: "var(--preview-radius)",
              }}
            >
              Primary
            </div>
            <div
              className="rounded px-2 py-1 text-[10px] font-medium"
              style={{
                backgroundColor: "var(--preview-secondary)",
                color: "var(--preview-secondary-fg)",
                borderRadius: "var(--preview-radius)",
              }}
            >
              Secondary
            </div>
            <div
              className="rounded px-2 py-1 text-[10px] font-medium"
              style={{
                backgroundColor: "var(--preview-destructive)",
                color: "#fff",
                borderRadius: "var(--preview-radius)",
              }}
            >
              Destructive
            </div>
          </div>

          {/* Badges */}
          <div className="flex gap-1.5">
            <span
              className="rounded-full px-2 py-0.5 text-[9px]"
              style={{
                backgroundColor: "var(--preview-accent)",
                color: "var(--preview-accent-fg)",
              }}
            >
              Active
            </span>
            <span
              className="rounded-full px-2 py-0.5 text-[9px]"
              style={{
                backgroundColor: "var(--preview-muted)",
                color: "var(--preview-muted-fg)",
              }}
            >
              Draft
            </span>
          </div>

          {/* Table preview */}
          <div
            className="rounded text-[9px]"
            style={{
              border: "1px solid var(--preview-border)",
              borderRadius: "var(--preview-radius)",
            }}
          >
            <div
              className="flex gap-4 border-b px-2 py-1 font-medium"
              style={{
                backgroundColor: "var(--preview-muted)",
                borderColor: "var(--preview-border)",
              }}
            >
              <span className="w-16">Name</span>
              <span className="w-12">Status</span>
              <span>Score</span>
            </div>
            {[
              { name: "my-app", status: "Active", score: "95" },
              { name: "portal", status: "Draft", score: "82" },
            ].map((row) => (
              <div
                key={row.name}
                className="flex gap-4 border-b px-2 py-1 last:border-b-0"
                style={{ borderColor: "var(--preview-border)" }}
              >
                <span className="w-16">{row.name}</span>
                <span className="w-12">{row.status}</span>
                <span>{row.score}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
