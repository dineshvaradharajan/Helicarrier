import { db } from "./client.js";
import { users, recipes, environments, themes, settings } from "./schema/index.js";
import { nanoid } from "nanoid";
import crypto from "node:crypto";

async function seed() {
  console.log("Seeding database...");

  // Create admin user with a known API key for dev
  const adminApiKey = "hc_dev_admin_key_12345";
  const adminApiKeyHash = crypto
    .createHash("sha256")
    .update(adminApiKey)
    .digest("hex");

  const adminId = nanoid();
  await db
    .insert(users)
    .values({
      id: adminId,
      email: "admin@helicarrier.dev",
      displayName: "Admin User",
      role: "admin",
      apiKeyHash: adminApiKeyHash,
    })
    .onConflictDoNothing();

  // Create developer user
  const devApiKey = "hc_dev_developer_key_12345";
  const devApiKeyHash = crypto
    .createHash("sha256")
    .update(devApiKey)
    .digest("hex");

  await db
    .insert(users)
    .values({
      id: nanoid(),
      email: "developer@helicarrier.dev",
      displayName: "Dev User",
      role: "developer",
      apiKeyHash: devApiKeyHash,
    })
    .onConflictDoNothing();

  // Create built-in recipes
  await db
    .insert(recipes)
    .values([
      {
        id: nanoid(),
        name: "nextjs-enterprise",
        version: "1.0.0",
        definition: {
          name: "nextjs-enterprise",
          description:
            "Enterprise Next.js application with strict governance",
          version: "1.0.0",
          stack: {
            framework: "next.js",
            language: "typescript",
            styling: "tailwindcss",
            testing: "vitest",
          },
          libraries: {
            allowed: [
              "next",
              "react",
              "react-dom",
              "tailwindcss",
              "zod",
              "drizzle-orm",
              "zustand",
              "@tanstack/react-query",
            ],
            denied: ["moment", "lodash", "jquery", "request"],
          },
          agents: ["license-compliance"],
          scaffold: {
            template: "nextjs-enterprise",
            postCreate: ["pnpm install", "pnpm build"],
          },
        },
        agentIds: ["license-compliance"],
        isActive: true,
      },
      {
        id: nanoid(),
        name: "react-spa-basic",
        version: "1.0.0",
        definition: {
          name: "react-spa-basic",
          description: "Basic React SPA with minimal governance",
          version: "1.0.0",
          stack: {
            framework: "react",
            language: "typescript",
            styling: "css-modules",
            testing: "vitest",
          },
          libraries: {
            allowed: [],
            denied: ["jquery", "request"],
          },
          agents: ["license-compliance"],
          scaffold: {
            template: "react-spa",
            postCreate: ["pnpm install"],
          },
        },
        agentIds: ["license-compliance"],
        isActive: true,
      },
    ])
    .onConflictDoNothing();

  // Create default environments
  await db
    .insert(environments)
    .values([
      {
        id: nanoid(),
        name: "Development",
        type: "dev",
        provider: "local",
        config: { url: "http://localhost:3000" },
        status: "active",
      },
      {
        id: nanoid(),
        name: "Production",
        type: "prod",
        provider: "vercel",
        config: {},
        status: "inactive",
      },
    ])
    .onConflictDoNothing();

  // Create default themes — each with a distinct design personality
  await db
    .insert(themes)
    .values([
      {
        id: nanoid(),
        name: "glass-modern",
        label: "Glass Modern",
        colors: {
          background: "#f0f4f8",
          foreground: "#1a202c",
          primary: "#6366f1",
          primaryForeground: "#ffffff",
          secondary: "#e8ecf4",
          secondaryForeground: "#4a5568",
          muted: "#edf2f7",
          mutedForeground: "#718096",
          accent: "#e0e7ff",
          accentForeground: "#3730a3",
          destructive: "#f43f5e",
          border: "#cbd5e1",
          ring: "#6366f1",
          card: "#ffffff",
          radius: "1rem",
          fontFamily: "system-ui, -apple-system, sans-serif",
        },
        isDefault: true,
        isActive: true,
      },
      {
        id: nanoid(),
        name: "sleek-dark",
        label: "Sleek Dark",
        colors: {
          background: "#09090b",
          foreground: "#fafafa",
          primary: "#3b82f6",
          primaryForeground: "#ffffff",
          secondary: "#1c1c22",
          secondaryForeground: "#a1a1aa",
          muted: "#18181b",
          mutedForeground: "#71717a",
          accent: "#1e293b",
          accentForeground: "#e2e8f0",
          destructive: "#ef4444",
          border: "#27272a",
          ring: "#3b82f6",
          card: "#111113",
          radius: "0.5rem",
          fontFamily: "'DM Sans', system-ui, sans-serif",
        },
        isDefault: false,
        isActive: true,
      },
      {
        id: nanoid(),
        name: "minimal-mono",
        label: "Minimal",
        colors: {
          background: "#ffffff",
          foreground: "#171717",
          primary: "#171717",
          primaryForeground: "#ffffff",
          secondary: "#f5f5f5",
          secondaryForeground: "#262626",
          muted: "#fafafa",
          mutedForeground: "#737373",
          accent: "#f5f5f5",
          accentForeground: "#171717",
          destructive: "#dc2626",
          border: "#e5e5e5",
          ring: "#171717",
          card: "#ffffff",
          radius: "0rem",
          fontFamily: "'JetBrains Mono', ui-monospace, monospace",
        },
        isDefault: false,
        isActive: true,
      },
      {
        id: nanoid(),
        name: "soft-pastel",
        label: "Soft Pastel",
        colors: {
          background: "#fef7f0",
          foreground: "#3d2c2c",
          primary: "#e8756d",
          primaryForeground: "#ffffff",
          secondary: "#fce8e6",
          secondaryForeground: "#5c3d3a",
          muted: "#fdf0ec",
          mutedForeground: "#9c7b77",
          accent: "#fdd5c8",
          accentForeground: "#7c4a42",
          destructive: "#e53e3e",
          border: "#f5d5cb",
          ring: "#e8756d",
          card: "#fffcfa",
          radius: "1.25rem",
          fontFamily: "'Nunito', system-ui, sans-serif",
        },
        isDefault: false,
        isActive: true,
      },
      {
        id: nanoid(),
        name: "neo-brutalist",
        label: "Neo Brutalist",
        colors: {
          background: "#ffffff",
          foreground: "#000000",
          primary: "#000000",
          primaryForeground: "#ffffff",
          secondary: "#f5f500",
          secondaryForeground: "#000000",
          muted: "#f0f0f0",
          mutedForeground: "#555555",
          accent: "#f5f500",
          accentForeground: "#000000",
          destructive: "#ff0000",
          border: "#000000",
          ring: "#000000",
          card: "#ffffff",
          radius: "0rem",
          fontFamily: "'Archivo', system-ui, sans-serif",
        },
        isDefault: false,
        isActive: true,
      },
    ])
    .onConflictDoNothing();

  // Create default settings
  await db
    .insert(settings)
    .values({
      key: "ai_provider",
      value: { provider: "claude", model: "claude-sonnet-4-20250514" },
    })
    .onConflictDoNothing();

  console.log("Seed complete!");
  console.log(`Admin API key (dev only): ${adminApiKey}`);
  console.log(`Developer API key (dev only): ${devApiKey}`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
