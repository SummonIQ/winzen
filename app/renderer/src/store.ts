import { create } from "zustand";

export interface Space {
  id: string;
  number: number;
  name: string;
  monitorId: string;
  monitorName: string;
  monitorIndex: number;
  monitorSpaceNumber: number;
  screenshot?: string; // Base64 encoded screenshot
}

export interface WindowInfo {
  id: string;
  title: string;
  app: string;
  position?: { x: number; y: number };
  size?: { width: number; height: number };
  spaceId?: string;
}

export interface Container {
  id: string;
  name: string;
  windows: Array<{
    windowId: string;
    relativeX: number;
    relativeY: number;
    width: number;
    height: number;
  }>;
  spaceId?: string;
}

export interface DisplayProfileSpace {
  monitorId: string;
  monitorName: string;
  monitorIndex: number;
  monitorSpaceNumber: number;
  name: string;
}

export interface DisplayProfile {
  id: string;
  name: string;
  fingerprint: string;
  createdAt: number;
  updatedAt: number;
  spaces: DisplayProfileSpace[];
}

interface SpaceNames {
  [key: string]: string;
}

interface SpaceScreenshots {
  [key: string]: string; // spaceId -> base64 screenshot
}

interface StoreState {
  spaces: Space[];
  spaceNames: SpaceNames;
  spaceScreenshots: SpaceScreenshots;
  windows: WindowInfo[];
  containers: Container[];
  displayProfiles: DisplayProfile[];

  // Actions
  loadSpaces: () => Promise<void>;
  switchToSpace: (spaceId: string) => Promise<void>;
  updateSpaceName: (spaceId: string, name: string) => void;
  captureSpaceScreenshot: (spaceId: string) => Promise<void>;
  setSpaceScreenshot: (spaceId: string, screenshot: string) => void;
  clearScreenshotCache: () => void;
  saveCurrentDisplayProfile: (name: string) => void;
  deleteDisplayProfile: (profileId: string) => void;
  applyDisplayProfile: (profileId: string) => void;

  // Window actions
  loadWindows: () => Promise<void>;

  // Container actions
  createContainer: (name: string, windowIds: string[]) => Promise<void>;
  deleteContainer: (containerId: string) => void;
  moveContainer: (containerId: string, spaceId: string) => Promise<void>;
  updateContainerPosition: (
    containerId: string,
    x: number,
    y: number
  ) => Promise<void>;
}

const DISPLAY_PROFILES_STORAGE_KEY = "displayProfiles";

const deriveDisplayFingerprint = (
  spaces: Array<Pick<Space, "monitorId" | "monitorName" | "monitorIndex" | "monitorSpaceNumber">>
) => {
  const monitors = Array.from(
    spaces.reduce(
      (map, space) =>
        map.set(space.monitorId, {
          monitorId: space.monitorId,
          monitorName: space.monitorName,
          monitorIndex: space.monitorIndex,
          spaceCount: Math.max(map.get(space.monitorId)?.spaceCount ?? 0, space.monitorSpaceNumber),
        }),
      new Map<
        string,
        { monitorId: string; monitorName: string; monitorIndex: number; spaceCount: number }
      >()
    ).values()
  ).sort((a, b) => a.monitorIndex - b.monitorIndex || a.monitorId.localeCompare(b.monitorId));

  return monitors
    .map(
      (monitor) =>
        `${monitor.monitorIndex}:${monitor.monitorId}:${monitor.monitorName}:${monitor.spaceCount}`
    )
    .join("|");
};

const buildProfileSpaceKey = (space: {
  monitorId: string;
  monitorIndex: number;
  monitorSpaceNumber: number;
}) => `${space.monitorId}:${space.monitorSpaceNumber}:${space.monitorIndex}`;

const loadDisplayProfiles = (): DisplayProfile[] => {
  try {
    const parsed = JSON.parse(localStorage.getItem(DISPLAY_PROFILES_STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const useStore = create<StoreState>((set, get) => ({
  spaces: [],
  spaceNames: {},
  spaceScreenshots: JSON.parse(
    localStorage.getItem("spaceScreenshots") || "{}"
  ),
  windows: [],
  containers: JSON.parse(localStorage.getItem("containers") || "[]"),
  displayProfiles: loadDisplayProfiles(),

  loadSpaces: async () => {
    try {
      const screenshotVersion = localStorage.getItem("spaceScreenshotsVersion");
      if (screenshotVersion !== "2") {
        localStorage.setItem("spaceScreenshotsVersion", "2");
        localStorage.setItem("spaceScreenshots", "{}");
        set({ spaceScreenshots: {} });
      }

      const persistedSpaceNames = await window.electronAPI
        .getSpaceNames()
        .catch(() => ({}));
      set({ spaceNames: persistedSpaceNames });

      const detectedSpaces = await window.electronAPI.getSpaces();
      const { spaceScreenshots, displayProfiles } = get();
      const matchingProfile = [...displayProfiles]
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .find((profile) => profile.fingerprint === deriveDisplayFingerprint(detectedSpaces));
      const profileNames = new Map(
        (matchingProfile?.spaces ?? []).map((space) => [buildProfileSpaceKey(space), space.name])
      );

      // Get the IDs of detected spaces
      const detectedSpaceIds = new Set(detectedSpaces.map((s: any) => s.id));

      // Clean up screenshots for spaces that no longer exist
      const cleanedScreenshots: SpaceScreenshots = {};
      Object.entries(spaceScreenshots).forEach(([id, screenshot]) => {
        if (detectedSpaceIds.has(id)) {
          cleanedScreenshots[id] = screenshot;
        }
      });

      // Update localStorage with cleaned screenshots
      if (
        Object.keys(cleanedScreenshots).length !==
        Object.keys(spaceScreenshots).length
      ) {
        localStorage.setItem(
          "spaceScreenshots",
          JSON.stringify(cleanedScreenshots)
        );
        set({ spaceScreenshots: cleanedScreenshots });
      }

      // Merge detected spaces with saved names and screenshots
      const spaces: Space[] = detectedSpaces.map((space: any) => ({
        id: space.id,
        number: space.number,
        name:
          persistedSpaceNames[space.id] ||
          profileNames.get(
            buildProfileSpaceKey({
              monitorId: space.monitorId ?? "main",
              monitorIndex: space.monitorIndex ?? 0,
              monitorSpaceNumber: space.monitorSpaceNumber ?? space.number,
            })
          ) ||
          `Space ${space.monitorSpaceNumber ?? space.number}`,
        monitorId: space.monitorId ?? "main",
        monitorName: space.monitorName ?? "Main Display",
        monitorIndex: space.monitorIndex ?? 0,
        monitorSpaceNumber: space.monitorSpaceNumber ?? space.number,
        screenshot: cleanedScreenshots[space.id],
      }));

      const cleanedSpaceNames = Object.fromEntries(
        Object.entries(persistedSpaceNames).filter(([key]) => !/^\d+$/.test(key))
      );
      if (
        Object.keys(cleanedSpaceNames).length !==
        Object.keys(persistedSpaceNames).length
      ) {
        set({ spaceNames: cleanedSpaceNames });
        void window.electronAPI.saveSpaceNames(cleanedSpaceNames);
      }

      set({ spaces });
    } catch (error) {
      console.error("Failed to load spaces:", error);
    }
  },

  switchToSpace: async (spaceId: string) => {
    try {
      let targetSpace = get().spaces.find((s) => s.id === spaceId);

      if (!targetSpace) {
        await get().loadSpaces();
        const freshSpaces = get().spaces;
        targetSpace = freshSpaces.find((s) => s.id === spaceId);
      }

      if (!targetSpace) {
        console.warn("Skip switching: target space no longer exists", { spaceId });
        return;
      }

      // Hide window, then switch — window stays hidden until user re-opens Winzen
      await window.electronAPI.hideWindow();
      await window.electronAPI.switchToSpace(targetSpace.id);
    } catch (error) {
      console.error("Failed to switch space:", error);
      throw error;
    }
  },

  updateSpaceName: (spaceId: string, name: string) => {
    const spaceNames = {
      ...get().spaceNames,
      [spaceId]: name,
    };
    set({ spaceNames });
    void window.electronAPI.saveSpaceNames(spaceNames);

    // Update spaces with new name
    const spaces = get().spaces.map((space) =>
      space.id === spaceId ? { ...space, name } : space
    );
    set({ spaces });
  },

  loadWindows: async () => {
    try {
      const windows = await window.electronAPI.getWindows();
      set({ windows });
    } catch (error) {
      console.error("Failed to load windows:", error);
    }
  },

  createContainer: async (name: string, windowIds: string[]) => {
    try {
      const { windows } = get();
      const containerWindows = windowIds.map((windowId) => {
        const window = windows.find((w) => w.id === windowId);
        return {
          windowId,
          relativeX: window?.position?.x || 0,
          relativeY: window?.position?.y || 0,
          width: window?.size?.width || 800,
          height: window?.size?.height || 600,
        };
      });

      const newContainer: Container = {
        id: Date.now().toString(),
        name,
        windows: containerWindows,
      };

      const containers = [...get().containers, newContainer];
      set({ containers });
      localStorage.setItem("containers", JSON.stringify(containers));
    } catch (error) {
      console.error("Failed to create container:", error);
    }
  },

  deleteContainer: (containerId: string) => {
    const containers = get().containers.filter((c) => c.id !== containerId);
    set({ containers });
    localStorage.setItem("containers", JSON.stringify(containers));
  },

  moveContainer: async (containerId: string, spaceId: string) => {
    try {
      const container = get().containers.find((c) => c.id === containerId);
      if (!container) return;

      const targetSpace = get().spaces.find((s) => s.id === spaceId);
      const targetSpaceNumber = targetSpace?.number ?? parseInt(spaceId, 10);

      // Move all windows in the container to the new space
      for (const win of container.windows) {
        await window.electronAPI.moveWindowToSpace(
          win.windowId,
          String(targetSpaceNumber)
        );
      }

      // Update container's space
      const containers = get().containers.map((c) =>
        c.id === containerId ? { ...c, spaceId } : c
      );
      set({ containers });
      localStorage.setItem("containers", JSON.stringify(containers));
    } catch (error) {
      console.error("Failed to move container:", error);
    }
  },

  updateContainerPosition: async (
    containerId: string,
    x: number,
    y: number
  ) => {
    try {
      const container = get().containers.find((c) => c.id === containerId);
      if (!container) return;

      // Move all windows maintaining relative positions
      for (const win of container.windows) {
        const newX = x + win.relativeX;
        const newY = y + win.relativeY;
        await window.electronAPI.setWindowPosition(
          win.windowId,
          newX,
          newY,
          win.width,
          win.height
        );
      }
    } catch (error) {
      console.error("Failed to update container position:", error);
    }
  },

  captureSpaceScreenshot: async (spaceId: string) => {
    try {
      const result = await window.electronAPI.captureDesktopScreenshot();
      if (result.success && result.screenshot) {
        const screenshot = result.screenshot;

        if (get().spaceScreenshots[spaceId] === screenshot) {
          return;
        }

        const spaceScreenshots = {
          ...get().spaceScreenshots,
          [spaceId]: screenshot,
        };
        set({ spaceScreenshots });
        localStorage.setItem(
          "spaceScreenshots",
          JSON.stringify(spaceScreenshots)
        );

        // Update the space with the screenshot
        const spaces = get().spaces.map((space) =>
          space.id === spaceId
            ? { ...space, screenshot: screenshot }
            : space
        );
        set({ spaces });
      }
    } catch (error) {
      console.error("Failed to capture space screenshot:", error);
    }
  },

  setSpaceScreenshot: (spaceId: string, screenshot: string) => {
    const currentScreenshots = get().spaceScreenshots;
    if (currentScreenshots[spaceId] === screenshot) return;

    const spaceScreenshots = { ...currentScreenshots, [spaceId]: screenshot };
    set({ spaceScreenshots });
    localStorage.setItem("spaceScreenshots", JSON.stringify(spaceScreenshots));

    const spaces = get().spaces.map((space) =>
      space.id === spaceId ? { ...space, screenshot } : space
    );
    set({ spaces });
  },

  clearScreenshotCache: () => {
    localStorage.removeItem("spaceScreenshots");
    set({ spaceScreenshots: {} });
    const spaces = get().spaces.map((space) => ({ ...space, screenshot: undefined }));
    set({ spaces });
  },

  saveCurrentDisplayProfile: (name: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      return;
    }

    const spaces = get().spaces;
    const now = Date.now();
    const profile: DisplayProfile = {
      id: now.toString(),
      name: trimmedName,
      fingerprint: deriveDisplayFingerprint(spaces),
      createdAt: now,
      updatedAt: now,
      spaces: spaces.map((space) => ({
        monitorId: space.monitorId,
        monitorName: space.monitorName,
        monitorIndex: space.monitorIndex,
        monitorSpaceNumber: space.monitorSpaceNumber,
        name: space.name,
      })),
    };

    const displayProfiles = [...get().displayProfiles, profile];
    set({ displayProfiles });
    localStorage.setItem(DISPLAY_PROFILES_STORAGE_KEY, JSON.stringify(displayProfiles));
  },

  deleteDisplayProfile: (profileId: string) => {
    const displayProfiles = get().displayProfiles.filter((profile) => profile.id !== profileId);
    set({ displayProfiles });
    localStorage.setItem(DISPLAY_PROFILES_STORAGE_KEY, JSON.stringify(displayProfiles));
  },

  applyDisplayProfile: (profileId: string) => {
    const profile = get().displayProfiles.find((item) => item.id === profileId);
    if (!profile) {
      return;
    }

    const profileNames = new Map(profile.spaces.map((space) => [buildProfileSpaceKey(space), space.name]));
    const currentSpaces = get().spaces;
    const nextSpaceNames = { ...get().spaceNames };
    const updatedSpaces = currentSpaces.map((space) => {
      const profileName = profileNames.get(
        buildProfileSpaceKey({
          monitorId: space.monitorId,
          monitorIndex: space.monitorIndex,
          monitorSpaceNumber: space.monitorSpaceNumber,
        })
      );

      if (!profileName) {
        return space;
      }

      nextSpaceNames[space.id] = profileName;
      return { ...space, name: profileName };
    });

    const displayProfiles = get().displayProfiles.map((item) =>
      item.id === profileId ? { ...item, updatedAt: Date.now() } : item
    );

    set({ spaces: updatedSpaces, spaceNames: nextSpaceNames, displayProfiles });
    void window.electronAPI.saveSpaceNames(nextSpaceNames);
    localStorage.setItem(DISPLAY_PROFILES_STORAGE_KEY, JSON.stringify(displayProfiles));
  },
}));
