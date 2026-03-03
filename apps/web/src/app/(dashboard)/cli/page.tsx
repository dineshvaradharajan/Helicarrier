"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Terminal,
  Copy,
  Check,
  ArrowLeft,
  Download,
  Key,
  Rocket,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";

type AuthTab = "personal" | "org";
type Provider = "claude" | "codex" | "gemini" | "minimax";

type AuthMethod = "pro" | "api";

const PROVIDERS: {
  id: Provider;
  label: string;
  color: string;
  authMethods?: { id: AuthMethod; label: string; description: string }[];
  fields: { key: string; label: string; placeholder: string; secret?: boolean; authMethod?: AuthMethod }[];
}[] = [
  {
    id: "claude",
    label: "Claude",
    color: "#D97706",
    authMethods: [
      { id: "pro", label: "Claude Pro Account", description: "Login with your Claude Pro / Team / Enterprise subscription" },
      { id: "api", label: "API Key", description: "Use an Anthropic API key for direct access" },
    ],
    fields: [
      {
        key: "auth",
        label: "Login with Claude account",
        placeholder: "",
        authMethod: "pro",
      },
      {
        key: "api_key",
        label: "Anthropic API Key",
        placeholder: "sk-ant-api03-...",
        secret: true,
        authMethod: "api",
      },
    ],
  },
  {
    id: "codex",
    label: "OpenAI Codex",
    color: "#10A37F",
    fields: [
      {
        key: "api_key",
        label: "API Key",
        placeholder: "sk-...",
        secret: true,
      },
      {
        key: "org_id",
        label: "Organization ID",
        placeholder: "org-...",
      },
    ],
  },
  {
    id: "gemini",
    label: "Google Gemini",
    color: "#4285F4",
    fields: [
      {
        key: "api_key",
        label: "API Key",
        placeholder: "AIza...",
        secret: true,
      },
      {
        key: "project_id",
        label: "GCP Project ID",
        placeholder: "my-project-123",
      },
    ],
  },
  {
    id: "minimax",
    label: "MiniMax",
    color: "#6366F1",
    fields: [
      {
        key: "api_key",
        label: "API Key",
        placeholder: "eyJ...",
        secret: true,
      },
      {
        key: "group_id",
        label: "Group ID",
        placeholder: "17...",
      },
    ],
  },
];

function AuthenticateSection() {
  const [authTab, setAuthTab] = useState<AuthTab>("personal");
  const [provider, setProvider] = useState<Provider>("claude");
  const [authMethod, setAuthMethod] = useState<AuthMethod>("pro");

  const activeProvider = PROVIDERS.find((p) => p.id === provider)!;
  const visibleFields = activeProvider.fields.filter(
    (f) => !f.authMethod || f.authMethod === authMethod,
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-info/10 text-sm font-bold text-info">
            2
          </div>
          <div>
            <CardTitle>Authenticate</CardTitle>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Connect your AI provider account or use organization credentials
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Tabs */}
        <div className="flex rounded-lg border border-border/50 bg-muted/30 p-0.5">
          <button
            type="button"
            onClick={() => setAuthTab("personal")}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all ${
              authTab === "personal"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <Key className="h-3.5 w-3.5" />
              Personal Account
            </span>
          </button>
          <button
            type="button"
            onClick={() => setAuthTab("org")}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all ${
              authTab === "org"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5" />
              Organization Account
            </span>
          </button>
        </div>

        {authTab === "personal" ? (
          <div className="space-y-5">
            <p className="text-sm text-muted-foreground">
              Use your own AI provider API key. Select your provider below and enter your credentials.
            </p>

            {/* Provider selector */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {PROVIDERS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setProvider(p.id)}
                  className={`relative rounded-lg border px-3 py-2.5 text-left transition-all ${
                    provider === p.id
                      ? "border-primary/50 bg-primary/5"
                      : "border-border/50 bg-transparent hover:border-border hover:bg-muted/30"
                  }`}
                >
                  {provider === p.id && (
                    <div className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary">
                      <Check className="h-2.5 w-2.5 text-primary-foreground" />
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: p.color }}
                    />
                    <span className="text-xs font-semibold">{p.label}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Auth method toggle (if provider supports it) */}
            {activeProvider.authMethods && (
              <div className="flex rounded-lg border border-border/50 bg-muted/20 p-0.5">
                {activeProvider.authMethods.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setAuthMethod(m.id)}
                    className={`flex-1 rounded-md px-3 py-2 text-xs font-medium transition-all ${
                      authMethod === m.id
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            )}

            {/* Auth method description */}
            {activeProvider.authMethods && (
              <p className="text-xs text-muted-foreground">
                {activeProvider.authMethods.find((m) => m.id === authMethod)?.description}
              </p>
            )}

            {/* Provider-specific fields */}
            <div className="rounded-lg border border-border/50 bg-muted/20 p-4 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: activeProvider.color }}
                />
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {activeProvider.label} — {activeProvider.authMethods ? activeProvider.authMethods.find((m) => m.id === authMethod)?.label : "Configuration"}
                </span>
              </div>

              {authMethod === "pro" && provider === "claude" ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Opens your browser to authenticate with your Claude account. Your Pro/Team/Enterprise subscription will be used for scaffolding.
                  </p>
                  <CopyBlock
                    command="helicarrier auth login --provider claude --method oauth"
                    label="Login via browser"
                  />
                </div>
              ) : (
                visibleFields.map((field) => (
                  <div key={field.key}>
                    <CopyBlock
                      command={`helicarrier config set ${activeProvider.id}_${field.key} ${field.secret ? "<YOUR_" + field.key.toUpperCase() + ">" : field.placeholder}`}
                      label={field.label}
                    />
                  </div>
                ))
              )}
            </div>

            {/* Auth command */}
            <div className="border-t border-border/30 pt-4 space-y-3">
              {!(authMethod === "pro" && provider === "claude") && (
                <CopyBlock
                  command={`helicarrier auth login --provider ${provider} --api-key <YOUR_API_KEY>`}
                  label="Authenticate with provider"
                />
              )}
              <CopyBlock command="helicarrier auth whoami" label="Verify identity" />
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
              <p className="text-sm text-foreground">
                Organization accounts use the AI provider credentials configured by your admin in{" "}
                <a href="/settings" className="font-medium text-primary hover:underline">
                  Settings
                </a>
                . No personal API keys needed.
              </p>
            </div>

            <p className="text-xs text-muted-foreground">
              Your admin has pre-configured an AI provider for the organization. Just authenticate with your Helicarrier API key.
            </p>

            <CopyBlock
              command="helicarrier auth login --api-key <YOUR_HELICARRIER_API_KEY>"
              label="Login with your Helicarrier API key"
            />

            <div className="rounded-lg border border-border/50 bg-muted/20 p-4 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                What the admin configures
              </p>
              <div className="space-y-2 text-sm">
                {[
                  { label: "AI Provider", desc: "Claude, Codex, Gemini, or MiniMax" },
                  { label: "Model", desc: "Specific model version to use" },
                  { label: "API Keys", desc: "Organization-level API credentials" },
                  { label: "Rate Limits", desc: "Usage quotas per developer" },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-2">
                    <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary/50 shrink-0" />
                    <div>
                      <span className="font-medium text-foreground">{item.label}</span>
                      <span className="text-muted-foreground"> — {item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <CopyBlock command="helicarrier auth whoami" label="Verify identity" />

            <p className="text-xs text-muted-foreground">
              Don&apos;t have an API key? Ask your admin to generate one from the{" "}
              <a href="/users" className="text-primary hover:underline">
                Users
              </a>{" "}
              page.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CopyBlock({ command, label }: { command: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div>
      {label && (
        <p className="mb-1.5 text-xs font-medium text-muted-foreground">
          {label}
        </p>
      )}
      <div className="group flex items-center justify-between rounded-lg bg-muted/50 border border-border/50 px-4 py-3">
        <code className="font-mono text-sm text-foreground">{command}</code>
        <button
          type="button"
          onClick={handleCopy}
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          title="Copy to clipboard"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-success" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
    </div>
  );
}

export default function CliPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Install the CLI
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Scaffold apps, manage recipes, and run compliance checks from your
            terminal
          </p>
        </div>
      </div>

      {/* Quick Install */}
      <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
        <div className="relative space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
              <Download className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-semibold tracking-tight">
                Quick Install
              </h2>
              <p className="text-xs text-muted-foreground">
                Install globally via npm
              </p>
            </div>
          </div>
          <CopyBlock command="git clone https://github.com/dineshvaradharajan/Helicarrier.git && cd Helicarrier && ./setup.sh" label="Clone & setup the project" />
          <CopyBlock command="cd packages/cli && npm link" label="Then link the CLI globally" />
        </div>
      </div>

      {/* Step 1: Configure */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-info/10 text-sm font-bold text-info">
              1
            </div>
            <div>
              <CardTitle>Configure API Endpoint</CardTitle>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Point the CLI to your Helicarrier dashboard
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <CopyBlock command="helicarrier config set apiUrl http://localhost:3000/api/v1" />
        </CardContent>
      </Card>

      {/* Step 2: Authenticate */}
      <AuthenticateSection />

      {/* Step 3: Create an app */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-info/10 text-sm font-bold text-info">
              3
            </div>
            <div>
              <CardTitle>Create an Application</CardTitle>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Scaffold a new app from a recipe
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <CopyBlock command="helicarrier recipe list" label="Browse available recipes" />
          <CopyBlock
            command="helicarrier app create my-app -r nextjs-enterprise"
            label="Create app from recipe"
          />
          <CopyBlock command="helicarrier app list" label="List all apps" />
        </CardContent>
      </Card>

      {/* Step 4: Manage libraries */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning/10 text-sm font-bold text-warning">
              4
            </div>
            <div>
              <CardTitle>Manage Libraries</CardTitle>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Add libraries — governed by recipe allow/deny lists
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <CopyBlock
            command="helicarrier app add-lib <APP_ID> zod"
            label="Add an allowed library"
          />
          <CopyBlock
            command="helicarrier app add-lib <APP_ID> lodash"
            label="Try a denied library (will be blocked)"
          />
        </CardContent>
      </Card>

      {/* Step 5: Compliance */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning/10 text-sm font-bold text-warning">
              5
            </div>
            <div>
              <CardTitle>Run Compliance Checks</CardTitle>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Verify your app meets governance requirements
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <CopyBlock command="helicarrier compliance check <APP_ID>" label="Run all agents" />
          <CopyBlock command="helicarrier compliance report <APP_ID>" label="View compliance report" />
        </CardContent>
      </Card>

      {/* All Commands Reference */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Terminal className="h-5 w-5 text-muted-foreground" />
            <CardTitle>All Commands</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {[
              { cmd: "auth login", desc: "Authenticate with API key" },
              { cmd: "auth logout", desc: "Clear stored credentials" },
              { cmd: "auth whoami", desc: "Show current user" },
              { cmd: "recipe list", desc: "List available recipes" },
              { cmd: "recipe show <NAME>", desc: "Show recipe details" },
              { cmd: "recipe validate <FILE>", desc: "Validate a recipe YAML" },
              { cmd: "app create <NAME> -r <RECIPE>", desc: "Create an app" },
              { cmd: "app list", desc: "List all apps" },
              { cmd: "app status <ID>", desc: "Check app status" },
              { cmd: "app add-lib <ID> <LIB>", desc: "Add a library" },
              { cmd: "compliance check <ID>", desc: "Run compliance checks" },
              { cmd: "compliance report <ID>", desc: "View compliance report" },
              { cmd: "config get <KEY>", desc: "Get config value" },
              { cmd: "config set <KEY> <VALUE>", desc: "Set config value" },
              { cmd: "admin recipe create", desc: "Create a recipe (admin)" },
              { cmd: "admin approval list", desc: "List pending approvals" },
              { cmd: "admin approval resolve <ID>", desc: "Resolve approval" },
              { cmd: "admin user list", desc: "List all users" },
            ].map((item) => (
              <div
                key={item.cmd}
                className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-muted/30 transition-colors"
              >
                <code className="font-mono text-xs text-primary">
                  helicarrier {item.cmd}
                </code>
                <span className="text-xs text-muted-foreground">
                  {item.desc}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
