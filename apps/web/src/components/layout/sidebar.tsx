"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BookOpen,
  ShieldCheck,
  CheckCircle,
  Users,
  DollarSign,
  Server,
  Palette,
  Settings,
  Hexagon,
  AppWindow,
} from "lucide-react";

const NAV_GROUPS = [
  {
    label: "Command",
    items: [
      { name: "Overview", href: "/", icon: LayoutDashboard },
      { name: "Apps", href: "/apps", icon: AppWindow },
      { name: "Recipes", href: "/recipes", icon: BookOpen },
      { name: "Themes", href: "/themes", icon: Palette },
    ],
  },
  {
    label: "Governance",
    items: [
      { name: "Approvals", href: "/approvals", icon: CheckCircle },
      { name: "Compliance", href: "/compliance", icon: ShieldCheck },
      { name: "Users", href: "/users", icon: Users },
    ],
  },
  {
    label: "Infrastructure",
    items: [
      { name: "Costs", href: "/costs", icon: DollarSign },
      { name: "Environments", href: "/environments", icon: Server },
    ],
  },
  {
    label: "System",
    items: [{ name: "Settings", href: "/settings", icon: Settings }],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-border/50 bg-sidebar">
      <div className="flex h-14 items-center gap-2.5 border-b border-border/50 px-5">
        <Hexagon className="h-5 w-5 text-primary" strokeWidth={2.5} />
        <Link
          href="/"
          className="text-base font-bold tracking-tight text-foreground"
          style={{ fontFamily: "var(--font-display)" }}
        >
          HELICARRIER
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-5">
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "group/item flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-primary/8 text-foreground border-l-2 border-primary"
                        : "text-muted-foreground hover:bg-muted/40 hover:text-foreground border-l-2 border-transparent",
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-4 w-4 transition-colors",
                        isActive
                          ? "text-primary"
                          : "text-muted-foreground group-hover/item:text-foreground",
                      )}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-border/50 px-3 py-3 space-y-2">
        <a
          href="/api/auth/signout"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-destructive/10 hover:text-destructive border-l-2 border-transparent"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign out
        </a>
        <p className="px-6 text-[10px] text-muted-foreground/40">v1.0.0</p>
      </div>
    </aside>
  );
}
