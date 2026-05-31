import {
  BrowserWindow,
  BrowserView,
  Tray,
  GlobalShortcut,
  Utils,
  Screen,
} from "electrobun/bun";
import { dlopen, FFIType } from "bun:ffi";
import { invokeBridge, bridgeData } from "./bridge";
import { switchToSpaceViaKeyboard, hideNSWindow, showNSWindow, registerCmdDHotkey } from "./spaces-ffi";
import { VoiceCommandController } from "./voice-commands";
import {
  loadSpaceNames as loadPersistedSpaceNames,
  saveSpaceNames as persistSpaceNames,
} from "./space-name-state";
import {
  loadWindowState,
  saveWindowState,
  type WindowState,
} from "./window-state";
import type {
  WinzenRPC,
  ElectronSpaceInfo,
  WindowInfo,
  VoiceOverlayState,
} from "../shared/rpc-types";

interface BridgeScreenshotFile {
  path: string;
  mimeType: string;
}

interface BridgeSpaceScreenshotFile extends BridgeScreenshotFile {
  spaceId: string;
}

// ── Constants ─────────────────────────────────────────────────────────────
const COLLAPSED_HEIGHT = 149;
const DEFAULT_EXPANDED_HEIGHT = 620;
const DEFAULT_WIDTH = 920;

// ── Single-instance enforcement ───────────────────────────────────────────
{
  const fs = require("fs") as typeof import("fs");
  const pidFile = `${Utils.paths.userData}/winzen.pid`;
  try {
    if (fs.existsSync(pidFile)) {
      const existingPid = parseInt(fs.readFileSync(pidFile, "utf8").trim());
      if (existingPid && existingPid !== process.pid) {
        try {
          process.kill(existingPid, 0); // throws if process doesn't exist
          console.error(
            `[winzen] Another instance is running (PID ${existingPid}). Exiting.`
          );
          process.exit(0);
        } catch {}
      }
    }
    fs.mkdirSync(Utils.paths.userData, { recursive: true });
    fs.writeFileSync(pidFile, String(process.pid));
    process.on("exit", () => {
      try {
        fs.unlinkSync(pidFile);
      } catch {}
    });
  } catch (e) {
    console.error("[winzen] PID file check failed:", e);
  }
}

// ── AXIsProcessTrusted via bun:ffi ────────────────────────────────────────
const appServices = dlopen(
  "/System/Library/Frameworks/ApplicationServices.framework/ApplicationServices",
  {
    AXIsProcessTrusted: { args: [], returns: FFIType.bool },
  }
);

// ── State ─────────────────────────────────────────────────────────────────
let winState: WindowState = {
  x: 120,
  y: 120,
  width: DEFAULT_WIDTH,
  height: DEFAULT_EXPANDED_HEIGHT,
  collapsed: false,
  expandedHeight: DEFAULT_EXPANDED_HEIGHT,
};
let isVisible = true;
let win: BrowserWindow;

function pushVoiceOverlayState(state: VoiceOverlayState) {
  (win.webview.rpc as any)?.send?.voiceOverlayState(state);
}

// ── Safe hide/show using performSelectorOnMainThread (thread-safe) ─────────
function hideWindow() {
  if (!isVisible) return;
  hideNSWindow((win as any).ptr);
  isVisible = false;
}

function showWindowFn() {
  if (isVisible) return;
  // win.focus() uses Electrobun's native showWindow (thread-safe).
  // showNSWindow additionally dispatches [NSApp activate] on the main thread
  // so Winzen actually steals keyboard focus away from the previous key window.
  win.focus();
  showNSWindow((win as any).ptr);
  isVisible = true;
  void pushAllSpacePreviewUpdates();
}

// ── Window animation ──────────────────────────────────────────────────────
async function animateWindowHeight(
  target: BrowserWindow,
  targetHeight: number
): Promise<void> {
  const current = target.getSize();
  const startHeight = current.height;
  if (startHeight === targetHeight) return;

  const durationMs = 140;
  const startedAt = Date.now();

  await new Promise<void>((resolve) => {
    const interval = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const t = Math.min(1, elapsed / durationMs);
      // ease-in-out quad
      const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      const nextHeight = Math.round(
        startHeight + (targetHeight - startHeight) * eased
      );
      target.setSize(current.width, nextHeight);
      if (t >= 1) {
        clearInterval(interval);
        resolve();
      }
    }, 16);
  });
}

// ── Toggle window visibility ──────────────────────────────────────────────
function toggleWindow() {
  if (isVisible) {
    hideWindow();
  } else {
    showWindowFn();
  }
}

function handleGlobalToggleShortcut(source: string) {
  console.log(`[winzen] ${source} fired`);
  toggleWindow();
}

async function getSpacesImpl(): Promise<ElectronSpaceInfo[]> {
  console.log("[winzen] getSpaces called");
  try {
    const resp = await invokeBridge<{
      spaces: Array<{
        id: string;
        number: number;
        name?: string;
        monitorId: string;
        monitorName: string;
        monitorIndex: number;
        monitorSpaceNumber: number;
      }>;
    }>("spaces.list");
    const spaces = bridgeData(resp).spaces ?? [];
    console.log(`[winzen] getSpaces returning ${spaces.length} spaces`);
    return spaces.map((s) => ({
      id: s.id,
      number: s.number,
      name: s.name ?? `Space ${s.number}`,
      monitorId: s.monitorId,
      monitorName: s.monitorName,
      monitorIndex: s.monitorIndex,
      monitorSpaceNumber: s.monitorSpaceNumber,
    })) as ElectronSpaceInfo[];
  } catch (e) {
    console.error("[winzen] getSpaces failed:", e);
    return [];
  }
}

async function switchToSpaceImpl(spaceId: string) {
  try {
    const resp = await invokeBridge("spaces.switch", {
      spaceId,
    });
    if (!resp.success) throw new Error(resp.error?.message);
  } catch {
    try {
      const listResp = await invokeBridge<{
        spaces: Array<{ id: string; number: number }>;
      }>("spaces.list");
      const spaces = bridgeData(listResp).spaces ?? [];
      const space = spaces.find((s) => s.id === spaceId);
      if (space) {
        await switchToSpaceViaKeyboard(space.number);
      }
    } catch (e) {
      console.error("[winzen] switchToSpace fallback failed:", e);
    }
  }
}

async function runAppleScriptImpl(script: string) {
  try {
    const proc = Bun.spawn(["osascript", "-e", script], {
      stdout: "pipe",
      stderr: "pipe",
    });
    const output = await new Response(proc.stdout).text();
    await proc.exited;
    return output.trim();
  } catch (e: any) {
    throw new Error(String(e?.message ?? e));
  }
}

async function readBridgeScreenshotDataUrl(
  screenshot: BridgeScreenshotFile | null | undefined
): Promise<string | undefined> {
  if (!screenshot?.path || !screenshot.mimeType) {
    return undefined;
  }

  const file = Bun.file(screenshot.path);
  if (!(await file.exists())) {
    return undefined;
  }

  const bytes = await file.arrayBuffer();
  const base64 = Buffer.from(bytes).toString("base64");
  return `data:${screenshot.mimeType};base64,${base64}`;
}

async function captureAllSpacePreviews(): Promise<Record<string, string>> {
  const resp = await invokeBridge<{ screenshots?: BridgeSpaceScreenshotFile[] }>(
    "screens.capture_all_spaces"
  );
  const screenshots = bridgeData(resp).screenshots ?? [];
  const previews: Record<string, string> = {};

  for (const screenshot of screenshots) {
    const dataUrl = await readBridgeScreenshotDataUrl(screenshot);
    if (dataUrl) {
      previews[screenshot.spaceId] = dataUrl;
    }
  }

  return previews;
}

async function pushAllSpacePreviewUpdates(): Promise<void> {
  try {
    const previews = await captureAllSpacePreviews();
    for (const [spaceId, screenshot] of Object.entries(previews)) {
      (win.webview.rpc as any)?.send?.spaceScreenshotUpdate({
        spaceId,
        screenshot,
      });
    }
  } catch (error) {
    console.error("[winzen] Failed to refresh space previews:", error);
  }
}

// ── RPC handlers ──────────────────────────────────────────────────────────
const rpc = BrowserView.defineRPC<WinzenRPC>({
  handlers: {
    requests: {
      async getSpaceNames() {
        return loadPersistedSpaceNames();
      },

      async saveSpaceNames({ names }) {
        await persistSpaceNames(names);
      },

      async nativeBridgeHealthcheck() {
        try {
          const resp = await invokeBridge<{
            status?: string;
            version?: string;
          }>("bridge.health");
          return {
            success: resp.success,
            status: resp.data?.status,
            version: resp.data?.version,
            timingMs: resp.timing_ms,
            error: resp.error?.message,
          };
        } catch (e: any) {
          return { success: false, error: String(e?.message ?? e) };
        }
      },

      async getSpaces() {
        return getSpacesImpl();
      },

      async getCurrentSpace() {
        try {
          const resp = await invokeBridge<{ spaceId: string | null }>(
            "spaces.current"
          );
          return bridgeData(resp).spaceId ?? null;
        } catch {
          return null;
        }
      },

      async switchToSpace({ spaceId }) {
        await switchToSpaceImpl(spaceId);
      },

      async hideWindow() {
        hideWindow();
      },

      async showWindow() {
        showWindowFn();
      },

      async focusWindow() {
        showWindowFn();
      },

      async minimizeWindow() {
        win.minimize();
      },

      async closeWindow() {
        win.close();
      },

      async startWindowDrag() {
        // drag via CSS -webkit-app-region: drag in renderer
      },

      async setResultsCollapsed({ collapsed }) {
        const targetHeight = collapsed ? COLLAPSED_HEIGHT : winState.expandedHeight;
        winState.collapsed = collapsed;
        await animateWindowHeight(win, targetHeight);
        const frame = win.getFrame();
        winState.height = frame.height;
        await saveWindowState(winState);
      },

      async setWindowHeight({ height, preserveExpandedHeight }) {
        win.setSize(winState.width, height);
        winState.height = height;
        if (!preserveExpandedHeight && !winState.collapsed) {
          winState.expandedHeight = height;
        }
        await saveWindowState(winState);
      },

      async getWindows() {
        try {
          const resp = await invokeBridge<{
            windows: Array<{
              id: string;
              app: string;
              bundleId?: string;
              title: string;
              x: number;
              y: number;
              width: number;
              height: number;
            }>;
          }>("windows.list");
          return (bridgeData(resp).windows ?? []) as WindowInfo[];
        } catch {
          return [];
        }
      },

      async moveWindowToSpace({ windowId, spaceId }) {
        await invokeBridge("windows.move_to_space", { windowId, spaceId });
      },

      async setWindowPosition({ windowId, x, y, width, height }) {
        await invokeBridge("windows.set_bounds", {
          windowId,
          x,
          y,
          width,
          height,
        });
      },

      async openSystemPreferences() {
        Utils.openExternal("x-apple.systempreferences:");
      },

      async checkMissionControlShortcuts() {
        try {
          const resp = await invokeBridge<{
            spaces: Array<{ number: number }>;
          }>("spaces.list");
          const spaces = bridgeData(resp).spaces ?? [];
          return {
            enabled: true,
            availableSpaces: spaces.map((s) => s.number),
          };
        } catch {
          return { enabled: false, availableSpaces: [] };
        }
      },

      async verifyMissionControlShortcuts() {
        return true;
      },

      async checkAccessibilityPermissions() {
        try {
          return appServices.symbols.AXIsProcessTrusted() as boolean;
        } catch {
          return false;
        }
      },

      async runAppleScript({ script }) {
        return runAppleScriptImpl(script);
      },

      async captureDesktopScreenshot({ restoreWindow }) {
        void restoreWindow;
        try {
          const resp = await invokeBridge<{ screenshot?: BridgeScreenshotFile | null }>(
            "screens.capture_current"
          );
          const screenshot = await readBridgeScreenshotDataUrl(
            bridgeData(resp).screenshot ?? null
          );
          return { success: true, screenshot };
        } catch (error: any) {
          return {
            success: false,
            error: String(error?.message ?? error),
          };
        }
      },

      async captureAllDesktopScreenshots() {
        try {
          const screenshots = await captureAllSpacePreviews();
          return { success: true, screenshots };
        } catch (error: any) {
          return {
            success: false,
            error: String(error?.message ?? error),
          };
        }
      },

      async checkScreenRecordingPermission() {
        try {
          const resp = await invokeBridge<{ granted: boolean }>(
            "permissions.check_screen_recording"
          );
          return bridgeData(resp).granted ?? false;
        } catch {
          return false;
        }
      },
    },
    messages: {},
  },
});

// ── App startup ───────────────────────────────────────────────────────────
async function main() {
  winState = await loadWindowState();

  Utils.setDockIconVisible(false);

  win = new BrowserWindow({
    title: "Winzen",
    url: "http://127.0.0.1:30234",
    frame: {
      width: winState.width,
      height: winState.height,
      x: winState.x,
      y: winState.y,
    },
    titleBarStyle: "hidden",
    transparent: true,
    passthrough: false,
    styleMask: {
      Titled: false,
      Closable: true,
      Miniaturizable: true,
      Resizable: true,
      Borderless: false,
      FullSizeContentView: true,
      FullScreen: false,
      UnifiedTitleAndToolbar: false,
      UtilityWindow: false,
      HUDWindow: false,
      DocModalWindow: false,
      NonactivatingPanel: false,
    },
    preload: "views://mainview/preload.js",
    rpc,
  });

  win.setAlwaysOnTop(true);
  win.setVisibleOnAllWorkspaces(true);
  isVisible = true;

  // Persist window geometry on resize/move
  win.on("resize", (e) => {
    const evt = e as { data: { id: number; x: number; y: number; width: number; height: number } };
    const { width, height } = evt.data;
    winState.width = width;
    winState.height = height;
    if (!winState.collapsed) {
      winState.expandedHeight = height;
    }
    saveWindowState(winState);
  });

  win.on("move", (e) => {
    if (!isVisible) return; // ignore the off-screen position set during hide
    const evt = e as { data: { id: number; x: number; y: number } };
    const { x, y } = evt.data;
    winState.x = x;
    winState.y = y;
    saveWindowState(winState);
  });

  // ── Tray ────────────────────────────────────────────────────────────────
  const tray = new Tray({
    title: "",
    image: "views://assets/trayTemplate.png",
    template: true,
    width: 22,
    height: 22,
  });

  tray.setMenu([
    { type: "normal", label: "Toggle Winzen", action: "toggle" },
    { type: "normal", label: "Refresh Previews", action: "refresh-previews" },
    { type: "divider" },
    { type: "normal", label: "Quit", action: "quit" },
  ]);

  tray.on("tray-clicked", (e) => {
    const evt = e as { data: { action: string } };
    const action = evt.data.action;
    if (action === "quit") {
      Utils.quit();
    } else if (action === "refresh-previews") {
      void pushAllSpacePreviewUpdates();
    } else {
      // "toggle" or bare tray click
      toggleWindow();
    }
  });

  // ── Global shortcut ──────────────────────────────────────────────────────
  // Carbon RegisterEventHotKey intercepts Cmd+D and CONSUMES it — other apps
  // (Terminal, iTerm2, etc.) never see the keystroke.
  // Electrobun's GlobalShortcut uses NSEvent global monitors which only observe,
  // so Terminal would still receive Cmd+D and open split views.
  registerCmdDHotkey(() => {
    handleGlobalToggleShortcut("Carbon Cmd+D");
  });
  const globalShortcutRegistered = GlobalShortcut.register(
    "CommandOrControl+D",
    () => {
      handleGlobalToggleShortcut("Electrobun GlobalShortcut Cmd+D");
    }
  );
  if (!globalShortcutRegistered) {
    console.warn("[winzen] Electrobun GlobalShortcut Cmd+D registration failed");
  }

  const voiceCommandController = new VoiceCommandController(
    {
      getSpaces: getSpacesImpl,
      switchToSpace: switchToSpaceImpl,
      hideWindow: () => {
        hideWindow();
      },
      showWindow: () => {
        showWindowFn();
      },
      runAppleScript: runAppleScriptImpl,
    },
    {
      onOverlayStateChange: pushVoiceOverlayState,
    }
  );
  voiceCommandController.start();
  void pushAllSpacePreviewUpdates();

  console.log("[winzen] Electrobun app started");
}

main().catch((e) => {
  console.error("[winzen] Fatal startup error:", e);
  process.exit(1);
});
