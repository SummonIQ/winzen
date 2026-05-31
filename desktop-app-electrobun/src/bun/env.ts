import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

let cachedEnvFileValues: Record<string, string> | null = null;

function stripWrappingQuotes(value: string): string {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function loadEnvFileValues(): Record<string, string> {
  if (cachedEnvFileValues) return cachedEnvFileValues;

  const values: Record<string, string> = {};
  const seen = new Set<string>();
  const candidates: string[] = [];

  const addCandidate = (candidate: string) => {
    if (seen.has(candidate)) return;
    seen.add(candidate);
    candidates.push(candidate);
  };

  const seedDirs = [import.meta.dir, process.cwd(), path.resolve(import.meta.dir, "..")];

  for (const seedDir of seedDirs) {
    let currentDir = path.resolve(seedDir);
    while (true) {
      addCandidate(path.join(currentDir, ".env"));
      addCandidate(path.join(currentDir, "desktop-app-electrobun", ".env"));
      addCandidate(path.join(currentDir, "marketing-site", ".env"));

      const parentDir = path.dirname(currentDir);
      if (parentDir === currentDir) break;
      currentDir = parentDir;
    }
  }

  for (const candidate of candidates) {
    if (!existsSync(candidate)) continue;

    const lines = readFileSync(candidate, "utf8").split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;

      const equalsIndex = trimmed.indexOf("=");
      if (equalsIndex <= 0) continue;

      const key = trimmed.slice(0, equalsIndex).trim();
      const value = stripWrappingQuotes(trimmed.slice(equalsIndex + 1));
      if (key && !(key in values)) {
        values[key] = value;
      }
    }
  }

  cachedEnvFileValues = values;
  return values;
}

export function readEnvValue(key: string): string | undefined {
  const runtimeValue = process.env[key]?.trim();
  if (runtimeValue) return runtimeValue;

  const fileValue = loadEnvFileValues()[key]?.trim();
  return fileValue || undefined;
}
