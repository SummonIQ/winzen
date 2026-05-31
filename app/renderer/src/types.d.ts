export interface WindowInfo {
  id: string;
  title: string;
  app: string;
  position?: { x: number; y: number };
  size?: { width: number; height: number };
  spaceId?: string;
}

export type VoiceOverlayState =
  | { visible: false }
  | { visible: true; title: string; detail: string };

export interface ElectronAPI {
  nativeBridgeHealthcheck: () => Promise<{
    success: boolean;
    status?: string;
    version?: string;
    timingMs?: number;
    error?: string;
  }>;
  getSpaceNames: () => Promise<Record<string, string>>;
  saveSpaceNames: (names: Record<string, string>) => Promise<void>;
  getSpaces: () => Promise<
    Array<{
      id: string;
      number: number;
      name: string;
      monitorId: string;
      monitorName: string;
      monitorIndex: number;
      monitorSpaceNumber: number;
    }>
  >;
  getCurrentSpace: () => Promise<string | null>;
  switchToSpace: (spaceId: string) => Promise<void>;
  hideWindow: () => Promise<void>;
  showWindow: () => Promise<void>;
  minimizeWindow?: () => Promise<void>;
  closeWindow?: () => Promise<void>;
  focusWindow?: () => Promise<void>;
  startWindowDrag?: () => Promise<void>;
  setResultsCollapsed: (collapsed: boolean) => Promise<void>;
  setWindowHeight?: (
    height: number,
    options?: { preserveExpandedHeight?: boolean }
  ) => Promise<void>;
  setOverlayColors: (colors: Record<string, string>) => Promise<void>;

  // Window management
  getWindows: () => Promise<WindowInfo[]>;
  moveWindowToSpace: (windowId: string, spaceId: string) => Promise<void>;
  setWindowPosition: (windowId: string, x: number, y: number, width: number, height: number) => Promise<void>;

  // System
  openSystemPreferences: () => Promise<void>;
  checkMissionControlShortcuts: () => Promise<{ enabled: boolean; availableSpaces: number[] }>;
  verifyMissionControlShortcuts: () => Promise<boolean>;
  checkAccessibilityPermissions: () => Promise<boolean>;
  runAppleScript: (script: string) => Promise<string>;
  
  // Screenshots
  captureDesktopScreenshot: (options?: { restoreWindow?: boolean }) => Promise<{ success: boolean; screenshot?: string; error?: string }>;
  captureAllDesktopScreenshots: () => Promise<{ success: boolean; screenshots?: Record<string, string>; error?: string }>;

  // Events
  onAnimateHide: (callback: () => void) => () => void;
  onAnimateShow: (callback: () => void) => () => void;
  onSpaceScreenshotUpdate?: (callback: (spaceId: string, screenshot: string) => void) => () => void;
  onVoiceOverlayStateChange?: (
    callback: (state: VoiceOverlayState) => void
  ) => () => void;

  // Permissions
  checkScreenRecordingPermission: () => Promise<boolean>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
