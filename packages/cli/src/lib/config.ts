import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const CONFIG_DIR = join(homedir(), ".helicarrier");
const CONFIG_FILE = join(CONFIG_DIR, "config.json");

export interface CliConfig {
  apiUrl: string;
  apiKey?: string;
  userEmail?: string;
  userId?: string;
}

const DEFAULT_CONFIG: CliConfig = {
  apiUrl:
    process.env.HELICARRIER_API_URL ?? "http://localhost:3000/api/v1",
};

function ensureConfigDir(): void {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

export function loadConfig(): CliConfig {
  ensureConfigDir();

  if (!existsSync(CONFIG_FILE)) {
    return { ...DEFAULT_CONFIG };
  }

  try {
    const raw = readFileSync(CONFIG_FILE, "utf-8");
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

export function saveConfig(config: Partial<CliConfig>): void {
  ensureConfigDir();
  const current = loadConfig();
  const merged = { ...current, ...config };
  writeFileSync(CONFIG_FILE, JSON.stringify(merged, null, 2));
}

export function clearConfig(): void {
  ensureConfigDir();
  writeFileSync(CONFIG_FILE, JSON.stringify(DEFAULT_CONFIG, null, 2));
}

export function getApiKey(): string | undefined {
  return process.env.HELICARRIER_API_KEY ?? loadConfig().apiKey;
}
