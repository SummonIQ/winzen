import path from "path";

export interface BridgeEnvelope<TData = unknown> {
  success: boolean;
  data?: TData;
  error?: { code?: string; message?: string };
  timing_ms?: number;
}

function resolveBridgePath(): string {
  const envPath = process.env["WINZEN_BRIDGE_PATH"];
  if (envPath) return envPath;

  const candidates = [
    // Local resources (copied) — import.meta.dir is app/bun/, binary is app/resources/
    path.join(import.meta.dir, "../resources/WinzenBridgeCLI"),
    path.join(import.meta.dir, "../../resources/WinzenBridgeCLI"),
    path.join(process.cwd(), "resources/WinzenBridgeCLI"),
    // Bridge built from source
    path.join(
      import.meta.dir,
      "../../../macos-bridge/.build/release/WinzenBridgeCLI"
    ),
    path.join(
      import.meta.dir,
      "../../../macos-bridge/.build/debug/WinzenBridgeCLI"
    ),
  ];

  const fs = require("fs") as typeof import("fs");
  for (const candidate of candidates) {
    try {
      if (fs.existsSync(candidate)) return candidate;
    } catch {}
  }

  throw new Error(
    "Unable to locate WinzenBridgeCLI. Set WINZEN_BRIDGE_PATH env var."
  );
}

let cachedBridgePath: string | null = null;

export async function invokeBridge<TData = unknown>(
  command: string,
  payload: Record<string, unknown> = {}
): Promise<BridgeEnvelope<TData>> {
  if (!cachedBridgePath) {
    cachedBridgePath = resolveBridgePath();
  }

  const request = JSON.stringify({ id: "eb-invoke", command, payload }) + "\n";

  const proc = Bun.spawn([cachedBridgePath], {
    stdin: "pipe",
    stdout: "pipe",
    stderr: "pipe",
  });

  proc.stdin.write(request);
  proc.stdin.end();

  const [stdout, stderr] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
  ]);
  await proc.exited;

  const line = stdout
    .split("\n")
    .map((l) => l.trim())
    .find((l) => l.length > 0);

  if (!line) {
    throw new Error(stderr.trim() || "Bridge returned no output");
  }

  return JSON.parse(line) as BridgeEnvelope<TData>;
}

export function bridgeData<TData>(envelope: BridgeEnvelope<TData>): TData {
  if (!envelope.success) {
    throw new Error(envelope.error?.message ?? "Bridge request failed");
  }
  return envelope.data as TData;
}
