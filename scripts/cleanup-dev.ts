#!/usr/bin/env bun

/**
 * Cleanup script to kill existing dev processes before starting new ones
 * Kills processes on ports used by app dev servers
 */

import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const PORTS = [
  30231, // marketing-site (Next.js)
];

async function killProcessOnPort(port: number): Promise<void> {
  try {
    // Find process using the port
    const { stdout } = await execAsync(`lsof -ti:${port}`);
    const pids = stdout.trim().split("\n").filter(Boolean);

    if (pids.length > 0) {
      console.log(`🔴 Killing processes on port ${port}: ${pids.join(", ")}`);
      for (const pid of pids) {
        try {
          await execAsync(`kill -9 ${pid}`);
        } catch (error) {
          // Process might already be dead
        }
      }
    }
  } catch (error) {
    // No process found on this port, which is fine
  }
}

async function cleanup(): Promise<void> {
  console.log("🧹 Cleaning up existing dev processes...\n");

  // Kill processes on specific ports only
  for (const port of PORTS) {
    await killProcessOnPort(port);
  }

  // Small delay to ensure processes are fully terminated
  await new Promise((resolve) => setTimeout(resolve, 500));

  console.log("\n✅ Cleanup complete! Starting dev servers...\n");
}

cleanup().catch((error) => {
  console.error("❌ Cleanup failed:", error);
  process.exit(1);
});
