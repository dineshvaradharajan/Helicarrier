export const AI_PROVIDERS = ["claude", "codex", "gemini"] as const;

export type AiProvider = (typeof AI_PROVIDERS)[number];

export const AI_PROVIDER_LABELS: Record<AiProvider, string> = {
  claude: "Claude (Anthropic)",
  codex: "Codex (OpenAI)",
  gemini: "Gemini (Google)",
};
