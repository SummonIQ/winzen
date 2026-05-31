import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..");
const bridgeRoot = join(repoRoot, "macos-bridge");
const bridgeBinary = join(bridgeRoot, ".build", "debug", "WinzenBridgeCLI");

buildNativeBridge();

function buildNativeBridge() {
  const result = spawnSync("swift", ["build"], {
    cwd: bridgeRoot,
    stdio: "inherit",
    env: {
      ...process.env,
      SWIFTPM_CUSTOM_CACHE_PATH:
        process.env.SWIFTPM_CUSTOM_CACHE_PATH ?? "/tmp/swiftpm",
      CLANG_MODULE_CACHE_PATH:
        process.env.CLANG_MODULE_CACHE_PATH ?? "/tmp/clang-module-cache",
    },
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

async function stageBinary(targetPath) {
  await mkdir(dirname(targetPath), { recursive: true });
  await copyFile(bridgeBinary, targetPath);
  await chmod(targetPath, 0o755);
}
