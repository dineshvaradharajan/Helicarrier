import Link from "next/link";
import { themeService } from "@helicarrier/core";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ThemeColors } from "@helicarrier/shared";
import { Plus, Palette } from "lucide-react";

function MiniDashboard({ colors }: { colors: ThemeColors }) {
  const r = colors.radius;
  const font = colors.fontFamily;

  return (
    <div
      className="select-none overflow-hidden"
      style={{
        backgroundColor: colors.background,
        color: colors.foreground,
        fontFamily: font,
        borderRadius: r,
        border: `1px solid ${colors.border}`,
        boxShadow: `0 1px 3px ${colors.border}44`,
      }}
    >
      <div className="flex" style={{ minHeight: 180 }}>
        {/* Sidebar */}
        <div
          className="flex w-[72px] flex-col justify-between p-2"
          style={{
            backgroundColor: colors.card,
            borderRight: `1px solid ${colors.border}`,
          }}
        >
          <div>
            {/* Logo */}
            <div className="mb-3 flex items-center gap-1 px-1">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth="3">
                <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
              </svg>
              <span style={{ color: colors.foreground, fontSize: 7, fontWeight: 700, letterSpacing: "0.02em" }}>
                HELICR
              </span>
            </div>

            {/* Nav items */}
            <div className="space-y-0.5">
              {[
                { label: "Overview", active: true },
                { label: "Apps", active: false },
                { label: "Recipes", active: false },
                { label: "Themes", active: false },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-1 px-1.5 py-1"
                  style={{
                    borderRadius: `calc(${r} * 0.6)`,
                    fontSize: 6.5,
                    fontWeight: item.active ? 600 : 400,
                    backgroundColor: item.active ? `${colors.primary}18` : "transparent",
                    color: item.active ? colors.primary : colors.mutedForeground,
                    borderLeft: item.active ? `2px solid ${colors.primary}` : `2px solid transparent`,
                  }}
                >
                  {/* dot */}
                  <div
                    style={{
                      width: 3,
                      height: 3,
                      borderRadius: "50%",
                      backgroundColor: item.active ? colors.primary : colors.mutedForeground,
                      opacity: item.active ? 1 : 0.4,
                    }}
                  />
                  {item.label}
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar footer */}
          <div style={{ fontSize: 5, color: colors.mutedForeground, opacity: 0.5, paddingLeft: 4 }}>
            v1.0
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 p-2.5" style={{ backgroundColor: colors.background }}>
          {/* Top bar */}
          <div
            className="mb-2 flex items-center justify-between"
            style={{ borderBottom: `1px solid ${colors.border}`, paddingBottom: 4 }}
          >
            <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: "-0.02em" }}>Overview</span>
            <div className="flex items-center gap-1">
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  backgroundColor: `${colors.primary}20`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 6,
                  fontWeight: 700,
                  color: colors.primary,
                }}
              >
                A
              </div>
            </div>
          </div>

          {/* Metric cards */}
          <div className="mb-2 flex gap-1.5">
            {[
              { label: "RECIPES", value: "8", color: colors.primary },
              { label: "APPS", value: "24", color: colors.accent },
              { label: "USERS", value: "156", color: colors.secondary },
            ].map((m) => (
              <div
                key={m.label}
                className="relative flex-1 overflow-hidden p-1.5"
                style={{
                  backgroundColor: colors.card,
                  border: `1px solid ${colors.border}`,
                  borderRadius: r,
                }}
              >
                {/* Decorative circle */}
                <div
                  style={{
                    position: "absolute",
                    right: -4,
                    top: -4,
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    backgroundColor: `${m.color}12`,
                  }}
                />
                <div style={{ fontSize: 5, color: colors.mutedForeground, fontWeight: 600, letterSpacing: "0.05em", position: "relative" }}>
                  {m.label}
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, lineHeight: 1.2, position: "relative" }}>
                  {m.value}
                </div>
              </div>
            ))}
          </div>

          {/* Action buttons row */}
          <div className="mb-2 flex gap-1">
            <div
              style={{
                backgroundColor: colors.primary,
                color: colors.primaryForeground,
                borderRadius: `calc(${r} * 0.8)`,
                fontSize: 6,
                fontWeight: 600,
                padding: "2px 6px",
                boxShadow: `0 1px 2px ${colors.primary}30`,
              }}
            >
              + New App
            </div>
            <div
              style={{
                backgroundColor: "transparent",
                color: colors.foreground,
                borderRadius: `calc(${r} * 0.8)`,
                border: `1px solid ${colors.border}`,
                fontSize: 6,
                fontWeight: 500,
                padding: "2px 6px",
              }}
            >
              View All
            </div>
          </div>

          {/* Mini table */}
          <div
            style={{
              border: `1px solid ${colors.border}`,
              borderRadius: r,
              overflow: "hidden",
            }}
          >
            {/* Table header */}
            <div
              className="flex items-center px-1.5 py-1"
              style={{
                backgroundColor: colors.muted,
                borderBottom: `1px solid ${colors.border}`,
                fontSize: 5.5,
                fontWeight: 600,
                color: colors.mutedForeground,
                letterSpacing: "0.03em",
              }}
            >
              <span className="flex-1">NAME</span>
              <span style={{ width: 28 }}>STATUS</span>
              <span style={{ width: 20, textAlign: "right" }}>SCORE</span>
            </div>
            {/* Table rows */}
            {[
              { name: "web-portal", status: "active", score: "95", statusColor: colors.primary },
              { name: "api-service", status: "draft", score: "78", statusColor: colors.mutedForeground },
              { name: "mobile-app", status: "active", score: "88", statusColor: colors.primary },
            ].map((row, i) => (
              <div
                key={row.name}
                className="flex items-center px-1.5 py-[3px]"
                style={{
                  fontSize: 5.5,
                  borderBottom: i < 2 ? `1px solid ${colors.border}` : "none",
                }}
              >
                <span className="flex-1" style={{ fontWeight: 500 }}>{row.name}</span>
                <span style={{ width: 28 }}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 2,
                      fontSize: 5,
                      fontWeight: 500,
                      color: row.statusColor,
                    }}
                  >
                    <span
                      style={{
                        width: 3,
                        height: 3,
                        borderRadius: "50%",
                        backgroundColor: row.statusColor,
                      }}
                    />
                    {row.status}
                  </span>
                </span>
                <span style={{ width: 20, textAlign: "right" }}>
                  <span style={{ fontSize: 5, fontWeight: 600 }}>{row.score}%</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function ThemesPage() {
  const themes = await themeService.list();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Themes</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Visual identity presets for scaffolded applications
          </p>
        </div>
        <Link href="/themes/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Theme
          </Button>
        </Link>
      </div>

      {themes.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/50 bg-card/30 py-20">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/50">
            <Palette className="h-7 w-7 text-muted-foreground/50" />
          </div>
          <p className="text-sm text-muted-foreground">No themes yet</p>
          <Link href="/themes/new" className="mt-4">
            <Button variant="outline" size="sm">
              Create your first theme
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {themes.map((theme) => {
            const colors = theme.colors as ThemeColors;
            return (
              <Link key={theme.id} href={`/themes/${theme.id}`}>
                <Card className="group cursor-pointer overflow-hidden p-4 transition-all duration-300 hover:shadow-lg hover:shadow-black/20 hover:border-border">
                  {/* Live dashboard preview */}
                  <div className="mb-4 transition-transform duration-300 group-hover:scale-[1.01]">
                    <MiniDashboard colors={colors} />
                  </div>

                  {/* Theme info */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold tracking-tight">
                        {theme.label}
                      </h3>
                      <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                        {theme.name}
                      </p>
                    </div>
                    {theme.isDefault && (
                      <Badge variant="default">Default</Badge>
                    )}
                  </div>

                  {/* Design tokens */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <span className="rounded-md bg-muted/50 px-2 py-0.5 text-[10px] text-muted-foreground">
                      {colors.fontFamily?.split(",")[0]?.replace(/'/g, "").trim() ?? "System"}
                    </span>
                    <span className="rounded-md bg-muted/50 px-2 py-0.5 text-[10px] text-muted-foreground">
                      {colors.radius} radius
                    </span>
                    <span className="flex items-center gap-1 rounded-md bg-muted/50 px-2 py-0.5 text-[10px] text-muted-foreground">
                      <span
                        className="inline-block h-2 w-2 rounded-full"
                        style={{ backgroundColor: colors.primary }}
                      />
                      primary
                    </span>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
