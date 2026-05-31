import type { RPCSchema } from "electrobun/bun";

export interface SpaceInfo {
  id: string;
  number: number;
  monitorId: string;
  monitorName: string;
  monitorIndex: number;
  monitorSpaceNumber: number;
}

export interface ElectronSpaceInfo extends SpaceInfo {
  name: string;
}

export interface WindowInfo {
  id: string;
  app: string;
  bundleId?: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export type VoiceOverlayState =
  | { visible: false }
  | { visible: true; title: string; detail: string };

export type WinzenRPC = {
  bun: RPCSchema<{
    requests: {
      getSpaceNames: { params: {}; response: Record<string, string> };
      saveSpaceNames: { params: { names: Record<string, string> }; response: void };
      getSpaces: { params: {}; response: ElectronSpaceInfo[] };
      getCurrentSpace: { params: {}; response: string | null };
      switchToSpace: { params: { spaceId: string }; response: void };
      hideWindow: { params: {}; response: void };
      showWindow: { params: {}; response: void };
      focusWindow: { params: {}; response: void };
      minimizeWindow: { params: {}; response: void };
      closeWindow: { params: {}; response: void };
      startWindowDrag: { params: {}; response: void };
      setResultsCollapsed: { params: { collapsed: boolean }; response: void };
      setWindowHeight: {
        params: { height: number; preserveExpandedHeight?: boolean };
        response: void;
      };
      getWindows: { params: {}; response: WindowInfo[] };
      moveWindowToSpace: {
        params: { windowId: string; spaceId: string };
        response: void;
      };
      setWindowPosition: {
        params: {
          windowId: string;
          x: number;
          y: number;
          width: number;
          height: number;
        };
        response: void;
      };
      openSystemPreferences: { params: {}; response: void };
      checkMissionControlShortcuts: {
        params: {};
        response: { enabled: boolean; availableSpaces: number[] };
      };
      verifyMissionControlShortcuts: { params: {}; response: boolean };
      checkAccessibilityPermissions: { params: {}; response: boolean };
      runAppleScript: { params: { script: string }; response: string };
      captureDesktopScreenshot: {
        params: { restoreWindow?: boolean };
        response: { success: boolean; screenshot?: string; error?: string };
      };
      captureAllDesktopScreenshots: {
        params: {};
        response: {
          success: boolean;
          screenshots?: Record<string, string>;
          error?: string;
        };
      };
      checkScreenRecordingPermission: { params: {}; response: boolean };
      nativeBridgeHealthcheck: {
        params: {};
        response: {
          success: boolean;
          status?: string;
          version?: string;
          timingMs?: number;
          error?: string;
        };
      };
    };
    messages: {};
  }>;
  webview: RPCSchema<{
    requests: {};
    messages: {
      spaceScreenshotUpdate: { spaceId: string; screenshot: string };
      voiceOverlayState: VoiceOverlayState;
    };
  }>;
};
