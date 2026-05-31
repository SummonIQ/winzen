import { Electroview } from "electrobun/view";
import type { VoiceOverlayState, WinzenRPC } from "../shared/rpc-types";

// NOTE: This file is a preload script. It runs in the browser context before
// the renderer app loads. It has access to the DOM and window object.

// Declare window.electronAPI for this preload context
declare global {
  interface Window {
    electronAPI: any;
  }
}

const spaceScreenshotCallbacks: Array<
  (spaceId: string, screenshot: string) => void
> = [];
const voiceOverlayCallbacks: Array<(state: VoiceOverlayState) => void> = [];

const rpc = Electroview.defineRPC<WinzenRPC>({
  maxRequestTime: 30000,
  handlers: {
    requests: {},
    messages: {
      spaceScreenshotUpdate: ({ spaceId, screenshot }) => {
        spaceScreenshotCallbacks.forEach((cb) => cb(spaceId, screenshot));
      },
      voiceOverlayState: (state) => {
        voiceOverlayCallbacks.forEach((cb) => cb(state));
      },
    },
  },
});

const electroview = new Electroview({ rpc });
// rpc is guaranteed non-null after defineRPC + new Electroview
const r = electroview.rpc!;

// Map all window.electronAPI calls to RPC requests
window.electronAPI = {
  nativeBridgeHealthcheck: () =>
    r.request.nativeBridgeHealthcheck({}),

  getSpaceNames: () => r.request.getSpaceNames({}),

  saveSpaceNames: (names: Record<string, string>) =>
    r.request.saveSpaceNames({ names }),

  getSpaces: () => r.request.getSpaces({}),

  getCurrentSpace: () => r.request.getCurrentSpace({}),

  switchToSpace: (spaceId: string) =>
    r.request.switchToSpace({ spaceId }),

  hideWindow: () => r.request.hideWindow({}),

  showWindow: () => r.request.showWindow({}),

  focusWindow: () => r.request.focusWindow({}),

  minimizeWindow: () => r.request.minimizeWindow({}),

  closeWindow: () => r.request.closeWindow({}),

  startWindowDrag: () => r.request.startWindowDrag({}),

  setResultsCollapsed: (collapsed: boolean) =>
    r.request.setResultsCollapsed({ collapsed }),

  setWindowHeight: (
    height: number,
    options?: { preserveExpandedHeight?: boolean }
  ) =>
    r.request.setWindowHeight({ height, ...options }),

  setOverlayColors: async (_colors: Record<string, string>) => {},

  getWindows: () => r.request.getWindows({}),

  moveWindowToSpace: (windowId: string, spaceId: string) =>
    r.request.moveWindowToSpace({ windowId, spaceId }),

  setWindowPosition: (
    windowId: string,
    x: number,
    y: number,
    width: number,
    height: number
  ) => r.request.setWindowPosition({ windowId, x, y, width, height }),

  openSystemPreferences: () =>
    r.request.openSystemPreferences({}),

  checkMissionControlShortcuts: () =>
    r.request.checkMissionControlShortcuts({}),

  verifyMissionControlShortcuts: () =>
    r.request.verifyMissionControlShortcuts({}),

  checkAccessibilityPermissions: () =>
    r.request.checkAccessibilityPermissions({}),

  runAppleScript: (script: string) =>
    r.request.runAppleScript({ script }),

  captureDesktopScreenshot: (options?: { restoreWindow?: boolean }) =>
    r.request.captureDesktopScreenshot({
      restoreWindow: options?.restoreWindow,
    }),

  captureAllDesktopScreenshots: () =>
    r.request.captureAllDesktopScreenshots({}),

  onAnimateHide: (_callback: () => void) => () => {},

  onAnimateShow: (_callback: () => void) => () => {},

  onSpaceScreenshotUpdate: (
    callback: (spaceId: string, screenshot: string) => void
  ) => {
    spaceScreenshotCallbacks.push(callback);
    return () => {
      const idx = spaceScreenshotCallbacks.indexOf(callback);
      if (idx !== -1) spaceScreenshotCallbacks.splice(idx, 1);
    };
  },

  onVoiceOverlayStateChange: (callback: (state: VoiceOverlayState) => void) => {
    voiceOverlayCallbacks.push(callback);
    return () => {
      const idx = voiceOverlayCallbacks.indexOf(callback);
      if (idx !== -1) voiceOverlayCallbacks.splice(idx, 1);
    };
  },

  checkScreenRecordingPermission: () =>
    r.request.checkScreenRecordingPermission({}),
};
