#!/usr/bin/env bun
// Starts the Vite renderer dev server and the Electrobun app together.
// Saves child PIDs so the next run can cleanly kill stale processes.

import { resolve } from "node:path";
import { existsSync, readFileSync, writeFileSync, unlinkSync } from "node:fs";

const root = resolve(import.meta.dir, "../desktop-app-electrobun");
const pidFile = resolve(import.meta.dir, "../.winzen-dev-pids.json");

// Kill any stale processes from a previous dev session (by saved PID)
if (existsSync(pidFile)) {
  try {
    const pids: number[] = JSON.parse(readFileSync(pidFile, "utf8"));
    for (const pid of pids) {
      try { process.kill(pid, "SIGTERM"); } catch {}
    }
  } catch {}
  unlinkSync(pidFile);
}

// Also kill anything still holding our known ports (belt-and-suspenders)
for (const port of [30234, 30235, 30236, 30237, 30238, 30239, 30240]) {
  try {
    const result = Bun.spawnSync(["lsof", "-ti", `:${port}`]);
    const pids = new TextDecoder().decode(result.stdout).trim().split("\n").filter(Boolean).map(Number);
    for (const pid of pids) {
      try { process.kill(pid, "SIGTERM"); } catch {}
    }
  } catch {}
}

// Brief pause to let stale processes die
await Bun.sleep(800);

// Start Vite dev server
const vite = Bun.spawn(["bun", "run", "vite"], {
  cwd: root,
  stdout: "inherit",
  stderr: "inherit",
});

// Wait until the renderer dev server is actually answering before launching Electrobun.
const viteUrl = "http://127.0.0.1:30234";
const viteReadyDeadline = Date.now() + 15_000;
while (Date.now() < viteReadyDeadline) {
  try {
    const response = await fetch(viteUrl);
    if (response.ok) break;
  } catch {}
  await Bun.sleep(250);
}

// Start Electrobun app
const electrobun = Bun.spawn(["bun", "start"], {
  cwd: root,
  stdout: "inherit",
  stderr: "inherit",
});

// Save PIDs for next run to clean up
writeFileSync(pidFile, JSON.stringify([vite.pid, electrobun.pid].filter(Boolean)));

// Forward signals to both children and clean up PID file
const cleanup = () => {
  try { unlinkSync(pidFile); } catch {}
  try { vite.kill(); } catch {}
  try { electrobun.kill(); } catch {}
  process.exit(0);
};

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);

// Wait for both to finish
await Promise.all([vite.exited, electrobun.exited]);
try { unlinkSync(pidFile); } catch {}
