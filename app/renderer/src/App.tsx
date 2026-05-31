import React, {
  Suspense,
  lazy,
  useEffect,
  useState,
  useRef,
  useCallback
} from "react";
import { useStore } from "./store";
import type { VoiceOverlayState } from "./types";
import {
  MagnifyingGlassIcon,
  Cog6ToothIcon,
  RectangleGroupIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { SpaceGrid } from "./components/SpaceGrid";

const SpaceSettings = lazy(() =>
  import("./components/SpaceSettings").then((module) => ({
    default: module.SpaceSettings,
  }))
);
const ContainerManager = lazy(() =>
  import("./components/ContainerManager").then((module) => ({
    default: module.ContainerManager,
  }))
);
const SetupWizard = lazy(() =>
  import("./components/SetupWizard").then((module) => ({
    default: module.SetupWizard,
  }))
);
const SpaceList = lazy(() =>
  import("./components/SpaceList").then((module) => ({
    default: module.SpaceList,
  }))
);

const App: React.FC = () => {
  const spaces = useStore((state) => state.spaces);
  const loadSpaces = useStore((state) => state.loadSpaces);
  const switchToSpace = useStore((state) => state.switchToSpace);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [currentSpaceId, setCurrentSpaceId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showContainers, setShowContainers] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voiceOverlayState, setVoiceOverlayState] = useState<VoiceOverlayState>({
    visible: false,
  });
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");
  const [isResultsCollapsed, setIsResultsCollapsed] = useState(
    () => localStorage.getItem("results_collapsed") === "true"
  );
  const [showFooterHint, setShowFooterHint] = useState(
    () => localStorage.getItem("results_collapsed") !== "true"
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const searchShellDragRef = useRef<{
    startX: number;
    startY: number;
    dragged: boolean;
    targetWasInput: boolean;
  } | null>(null);
  const searchShellDragTimeoutRef = useRef<number>();
  const visibleRefreshIntervalRef = useRef<number>();
  const hasValidatedSetupRef = useRef(false);
  const lastKnownCurrentSpaceIdRef = useRef<string | null>(null);
  const wasSearchEmptyStateRef = useRef(false);
  const footerHintDelayRef = useRef<number>();

  const getSwitchErrorMessage = useCallback((error: unknown) => {
    if (error instanceof Error && error.message.trim()) {
      return `Failed to switch space: ${error.message}`;
    }

    return "Failed to switch space.";
  }, []);

  const animateHide = useCallback(() => {
    void window.electronAPI.hideWindow();
  }, []);

  const focusSearchInput = useCallback(() => {
    if (showSetup || showSettings || showContainers) {
      return;
    }

    const tryFocus = (attemptsLeft: number) => {
      const input = inputRef.current;
      if (!input) return;

      input.focus({ preventScroll: true });
      input.select();

      if (document.activeElement !== input && attemptsLeft > 0) {
        window.setTimeout(() => tryFocus(attemptsLeft - 1), 40);
      }
    };

    window.requestAnimationFrame(() => tryFocus(6));
  }, [showContainers, showSettings, showSetup]);

  const focusSearchInputAtEnd = useCallback(() => {
    const input = inputRef.current;
    if (!input) {
      return;
    }

    input.focus({ preventScroll: true });
    const caretPosition = input.value.length;
    input.setSelectionRange(caretPosition, caretPosition);
  }, []);

  const syncSpacesAndSelection = useCallback(async () => {
    await loadSpaces();
    try {
      const currentSpaceId = await window.electronAPI.getCurrentSpace();
      if (currentSpaceId) {
        const { spaces: loadedSpaces } = useStore.getState();
        const idx = loadedSpaces.findIndex((s) => s.id === currentSpaceId);
        if (idx >= 0) {
          setCurrentSpaceId(currentSpaceId);
          setSelectedIndex(idx);
          setError(null);
        }
      } else {
        setCurrentSpaceId(null);
      }
      return currentSpaceId ?? null;
    } catch {
      // ignore
      return null;
    }
  }, [loadSpaces]);

  const reconcileSpaceSelection = useCallback(
    async (targetSpaceId: string) => {
      setCurrentSpaceId(targetSpaceId);
      const optimisticSpaces = useStore.getState().spaces;
      const optimisticIndex = optimisticSpaces.findIndex(
        (space) => space.id === targetSpaceId
      );
      if (optimisticIndex >= 0) {
        setSelectedIndex(optimisticIndex);
      }

      for (let attempt = 0; attempt < 12; attempt += 1) {
        const resolvedCurrentSpaceId = await syncSpacesAndSelection();
        if (resolvedCurrentSpaceId === targetSpaceId) {
          return;
        }

        await new Promise<void>((resolve) => {
          window.setTimeout(resolve, 120);
        });
      }
    },
    [syncSpacesAndSelection]
  );

  const validateSetupIfNeeded = useCallback(async () => {
    if (hasValidatedSetupRef.current) {
      return;
    }

    hasValidatedSetupRef.current = true;
    const setupCompleted = localStorage.getItem("setup_completed");

    if (!setupCompleted) {
      setShowSetup(true);
      return;
    }

    try {
      const accessibilityGranted =
        await window.electronAPI.checkAccessibilityPermissions();
      if (!accessibilityGranted) {
        setShowSetup(true);
        setError(
          "Accessibility permission is required to switch Spaces. Please complete the setup."
        );
        return;
      }

      const shortcutsCheck =
        await window.electronAPI.checkMissionControlShortcuts();

      if (
        !shortcutsCheck.enabled ||
        shortcutsCheck.availableSpaces.length === 0
      ) {
        console.warn(
          "Mission Control shortcuts not enabled, showing setup wizard"
        );
        setShowSetup(true);
        setError(
          "Mission Control keyboard shortcuts need to be enabled. Please complete the setup."
        );
      }
    } catch (err) {
      console.error("Failed to check Mission Control shortcuts:", err);
    }
  }, []);

  // Listen for space-screenshot-update events pushed by the Rust space watcher.
  // This fires whenever the user switches spaces while Winzen is hidden, giving
  // us an accurate screenshot of each space as the user visits it.
  useEffect(() => {
    if (!window.electronAPI.onSpaceScreenshotUpdate) return;
    return window.electronAPI.onSpaceScreenshotUpdate((spaceId, screenshot) => {
      useStore.getState().setSpaceScreenshot(spaceId, screenshot);
    });
  }, []);

  useEffect(() => {
    if (!window.electronAPI.onVoiceOverlayStateChange) return;
    return window.electronAPI.onVoiceOverlayStateChange((state) => {
      setVoiceOverlayState(state);
    });
  }, []);

  // Listen for blur-triggered hide from main process
  useEffect(() => {
    return window.electronAPI.onAnimateHide(animateHide);
  }, [animateHide]);

  // Global keyboard handler so Cmd+D / Escape work even when input isn't focused
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey && e.key.toLowerCase() === "d") {
        e.preventDefault();
        animateHide();
      } else if (e.key === "Escape") {
        e.preventDefault();
        animateHide();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [animateHide]);

  useEffect(() => {
    return window.electronAPI.onAnimateShow(() => {
      void validateSetupIfNeeded();
      void syncSpacesAndSelection();
      focusSearchInput();
    });
  }, [focusSearchInput, syncSpacesAndSelection, validateSetupIfNeeded]);

  useEffect(() => {
    syncSpacesAndSelection();
    // Focus input on mount
    focusSearchInput();
  }, [focusSearchInput, syncSpacesAndSelection]);

  useEffect(() => {
    if (!showSetup && !showSettings && !showContainers) {
      focusSearchInput();
    }
  }, [focusSearchInput, showContainers, showSettings, showSetup]);

  useEffect(() => {
    if (spaces.length === 0) return;
    if (document.visibilityState === "visible") {
      void validateSetupIfNeeded();
    }
  }, [spaces, validateSetupIfNeeded]);

  useEffect(() => {
    const runVisibleRefresh = () => {
      if (document.visibilityState !== "visible") return;
      void syncSpacesAndSelection().then((currentSpaceId) => {
        if (currentSpaceId) {
          lastKnownCurrentSpaceIdRef.current = currentSpaceId;
        }
      });
    };

    const handleVisibilityChange = () => runVisibleRefresh();
    const handleWindowFocus = () => runVisibleRefresh();

    window.addEventListener("focus", handleWindowFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    visibleRefreshIntervalRef.current = window.setInterval(runVisibleRefresh, 5000);

    return () => {
      window.removeEventListener("focus", handleWindowFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (visibleRefreshIntervalRef.current) {
        clearInterval(visibleRefreshIntervalRef.current);
      }
    };
  }, [syncSpacesAndSelection]);

  useEffect(() => {
    return () => {
      if (searchShellDragTimeoutRef.current) {
        clearTimeout(searchShellDragTimeoutRef.current);
      }
      if (visibleRefreshIntervalRef.current) {
        clearInterval(visibleRefreshIntervalRef.current);
      }
    };
  }, []);

  // Filter spaces based on search query - memoize to avoid recalculation
  const filteredSpaces = React.useMemo(
    () =>
      spaces.filter((space) =>
        space.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [spaces, searchQuery]
  );
  const showSearchEmptyState =
    !isResultsCollapsed &&
    searchQuery.trim().length > 0 &&
    filteredSpaces.length === 0;

  // Auto-select first result
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  // Handle keyboard navigation - memoize to avoid recreating on every render
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.metaKey && e.key.toLowerCase() === "a") {
        return;
      }

      if (e.key === "Tab") {
        e.preventDefault();
        if (e.shiftKey) {
          // Shift+Tab: Navigate backwards
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredSpaces.length - 1
          );
        } else {
          // Tab: Navigate forwards
          setSelectedIndex((prev) =>
            prev < filteredSpaces.length - 1 ? prev + 1 : 0
          );
        }
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          e.shiftKey
            ? (prev < filteredSpaces.length - 1 ? prev + 1 : 0)
            : (prev < filteredSpaces.length - 1 ? prev + 1 : prev)
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          e.shiftKey
            ? (prev > 0 ? prev - 1 : Math.max(filteredSpaces.length - 1, 0))
            : (prev > 0 ? prev - 1 : 0)
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        const targetSpace = filteredSpaces[selectedIndex];
        if (targetSpace) {
          setCurrentSpaceId(targetSpace.id);
          setSelectedIndex(selectedIndex);
          lastKnownCurrentSpaceIdRef.current = targetSpace.id;
          setSearchQuery("");
          setError(null);
          void switchToSpace(targetSpace.id)
            .then(async () => {
              await reconcileSpaceSelection(targetSpace.id);
            })
            .catch((err) => {
              console.error("Failed to switch space:", err);
              setError(getSwitchErrorMessage(err));
            });
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        animateHide();
      } else if (e.metaKey && e.key.toLowerCase() === "d") {
        e.preventDefault();
        animateHide();
      } else if (e.key === "," && e.metaKey) {
        e.preventDefault();
        setShowSettings(true);
      } else if (e.key === "c" && e.metaKey) {
        e.preventDefault();
        setShowContainers(true);
      } else if (e.key === "g" && e.metaKey) {
        e.preventDefault();
        setViewMode((prev) => (prev === "list" ? "grid" : "list"));
      }
    },
    [
      filteredSpaces,
      selectedIndex,
      switchToSpace,
      animateHide,
      getSwitchErrorMessage,
      reconcileSpaceSelection,
    ]
  );

  const handleSearchInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.metaKey && e.key.toLowerCase() === "a") {
        e.preventDefault();
        e.stopPropagation();
        inputRef.current?.select();
        return;
      }

      handleKeyDown(e);
    },
    [handleKeyDown]
  );

  // Theme colors
  const currentTheme = {
    from: "#3b82f6",
    to: "#1d4ed8",
    light: "#93c5fd",
  };

  const shellBackground =
    "linear-gradient(135deg, rgba(9, 12, 21, 0.88) 0%, rgba(7, 10, 18, 0.84) 52%, rgba(4, 7, 13, 0.8) 100%)";

  // Memoize space click handler to prevent re-renders
  const handleSpaceClick = useCallback(
    async (spaceId: string) => {
      console.log("Switching to space:", spaceId);
      const latestSpaces = useStore.getState().spaces;
      const latestIndex = latestSpaces.findIndex((space) => space.id === spaceId);
      setCurrentSpaceId(spaceId);
      if (latestIndex >= 0) {
        setSelectedIndex(latestIndex);
      }
      lastKnownCurrentSpaceIdRef.current = spaceId;
      setSearchQuery("");
      setError(null);

      try {
        await switchToSpace(spaceId);
        await reconcileSpaceSelection(spaceId);
      } catch (err) {
        console.error("Failed to switch space:", err);
        setError(getSwitchErrorMessage(err));
      }
    },
    [switchToSpace, getSwitchErrorMessage, reconcileSpaceSelection]
  );

  const toggleResultsCollapsed = useCallback(() => {
    setIsResultsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("results_collapsed", String(next));
      void window.electronAPI.setResultsCollapsed(next);
      return next;
    });
  }, []);

  const handleWindowDragMouseDown = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (event.button !== 0) {
        return;
      }

      const target = event.target as HTMLElement | null;
      if (
        target?.closest(
          'input, button, textarea, select, a, [role="button"], [data-no-window-drag="true"]'
        )
      ) {
        return;
      }

      event.preventDefault();
      void window.electronAPI.startWindowDrag?.();
    },
    []
  );

  const handleSearchShellMouseDown = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (event.button !== 0) {
        return;
      }

      const target = event.target as HTMLElement | null;
      if (
        target?.closest('button, textarea, select, a, [role="button"], [data-no-window-drag="true"]')
      ) {
        return;
      }

      searchShellDragRef.current = {
        startX: event.clientX,
        startY: event.clientY,
        dragged: false,
        targetWasInput: target instanceof HTMLInputElement,
      };

      searchShellDragTimeoutRef.current = window.setTimeout(() => {
        if (!searchShellDragRef.current || searchShellDragRef.current.dragged) {
          return;
        }

        searchShellDragRef.current.dragged = true;
        void window.electronAPI.startWindowDrag?.();
      }, 150);
    },
    []
  );

  const handleSearchShellMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if ((event.buttons & 1) !== 1) {
        return;
      }

      const dragState = searchShellDragRef.current;
      if (!dragState || dragState.dragged) {
        return;
      }

      const deltaX = event.clientX - dragState.startX;
      const deltaY = event.clientY - dragState.startY;
      const distance = Math.hypot(deltaX, deltaY);

      if (distance < 6) {
        return;
      }

      if (searchShellDragTimeoutRef.current) {
        clearTimeout(searchShellDragTimeoutRef.current);
        searchShellDragTimeoutRef.current = undefined;
      }
      dragState.dragged = true;
      void window.electronAPI.startWindowDrag?.();
    },
    []
  );

  const handleSearchShellMouseUp = useCallback(() => {
    if (searchShellDragTimeoutRef.current) {
      clearTimeout(searchShellDragTimeoutRef.current);
      searchShellDragTimeoutRef.current = undefined;
    }

    const dragState = searchShellDragRef.current;
    if (dragState && !dragState.dragged && !dragState.targetWasInput) {
      focusSearchInputAtEnd();
    }

    searchShellDragRef.current = null;
  }, [focusSearchInputAtEnd]);

  const searchInputSize = Math.max(
    14,
    Math.min(
      42,
      (searchQuery || "Navigate to space...").length + (searchQuery ? 1 : 0)
    )
  );

  // Locked header geometry. Do not change these without an explicit user request.
  const headerHeight = 67;
  const headerPaddingY = 8;
  const collapsedWindowHeight = 149;
  const defaultExpandedWindowHeight = 620;
  const windowTopPadding = isResultsCollapsed
    ? Math.max(0, Math.round((collapsedWindowHeight - headerHeight) / 2))
    : 17;
  // Locked header position. Do not change without an explicit user request.
  const headerTopInset = 2;
  const contentScrollTopInset = headerTopInset + headerHeight - 12;
  const contentScrollBottomInset = 34;

  useEffect(() => {
    void window.electronAPI.setResultsCollapsed(isResultsCollapsed);
  }, []);

  useEffect(() => {
    if (footerHintDelayRef.current) {
      window.clearTimeout(footerHintDelayRef.current);
      footerHintDelayRef.current = undefined;
    }

    if (isResultsCollapsed) {
      setShowFooterHint(false);
      return;
    }

    footerHintDelayRef.current = window.setTimeout(() => {
      setShowFooterHint(true);
      footerHintDelayRef.current = undefined;
    }, 170);

    return () => {
      if (footerHintDelayRef.current) {
        window.clearTimeout(footerHintDelayRef.current);
        footerHintDelayRef.current = undefined;
      }
    };
  }, [isResultsCollapsed]);

  // Resize window to fit onboarding wizard; restore when done.
  useEffect(() => {
    if (showSetup) {
      void window.electronAPI.setWindowHeight(820, { preserveExpandedHeight: true });
    } else {
      void window.electronAPI.setWindowHeight(defaultExpandedWindowHeight);
    }
  }, [showSetup, defaultExpandedWindowHeight]);

  useEffect(() => {
    const setWindowHeight = window.electronAPI.setWindowHeight;

    if (!setWindowHeight) {
      wasSearchEmptyStateRef.current = showSearchEmptyState;
      return;
    }

    if (isResultsCollapsed) {
      wasSearchEmptyStateRef.current = showSearchEmptyState;
      return;
    }

    if (showSearchEmptyState && !wasSearchEmptyStateRef.current) {
      void setWindowHeight(274, { preserveExpandedHeight: true });
    } else if (!showSearchEmptyState && wasSearchEmptyStateRef.current) {
      void setWindowHeight(defaultExpandedWindowHeight);
    }

    wasSearchEmptyStateRef.current = showSearchEmptyState;
  }, [defaultExpandedWindowHeight, isResultsCollapsed, showSearchEmptyState]);

  return (
    <div
      className="window-noise relative h-full rounded-[24px] text-white"
      onMouseDown={handleWindowDragMouseDown}
      style={{
        overflow: "hidden",
        boxShadow:
          "0 44px 120px rgba(0, 0, 0, 0.72), 0 20px 56px rgba(0, 0, 0, 0.44), 0 0 0 1px rgba(255,255,255,0.028)",
        background: shellBackground,
        border: "1px solid rgba(255, 255, 255, 0.06)",
        backdropFilter: "blur(22px) saturate(1.15)",
        WebkitBackdropFilter: "blur(22px) saturate(1.15)",
        clipPath: "inset(0 round 24px)",
        borderRadius: "24px",
        isolation: "isolate",
        paddingTop: windowTopPadding,
      }}
    >
      <style>{`
        :root {
          --theme-from: ${currentTheme.from};
          --theme-to: ${currentTheme.to};
          --theme-light: ${currentTheme.light};
        }
      `}</style>

      <div
        className="absolute inset-x-0 z-10 flex select-none items-center pr-3"
        style={{
          top: headerTopInset,
          height: headerHeight,
          paddingTop: headerPaddingY,
          paddingBottom: headerPaddingY,
        }}
      >
        {/* Toggle — truly outside the glass pill, to its left, attached to its edge */}
        <button
          onClick={toggleResultsCollapsed}
          className="no-drag electrobun-webkit-app-region-no-drag ml-3 mr-0 flex w-12 shrink-0 items-center justify-center rounded-l-[15px] border-t border-l border-b border-r-0 border-t-[#1c1c1e] border-l-[#1c1c1e] border-b-[#050505] text-slate-400 transition-colors hover:text-slate-200"
          style={{
            height: "calc(100% - 1px)",
            background: "linear-gradient(135deg, rgba(32,32,36,0.82) 0%, rgba(4,4,5,0.97) 100%)",
          }}
          title={isResultsCollapsed ? "Expand spaces" : "Collapse spaces"}
          aria-label={isResultsCollapsed ? "Expand spaces" : "Collapse spaces"}
          data-no-window-drag="true"
        >
          {isResultsCollapsed ? (
            <ChevronDownIcon className="h-4 w-4" />
          ) : (
            <ChevronUpIcon className="h-4 w-4" />
          )}
        </button>

        {/* Glass pill — takes remaining space */}
        <div className="relative min-w-0 flex-1 h-full">
          <div
            className="electrobun-webkit-app-region-drag absolute inset-0 rounded-r-[15px] border border-l-0 border-t-[#1c1c1e] border-r-[#1c1c1e] border-b-[#050505] bg-black/[0.42]"
            style={{
              boxShadow:
                "inset 0 -1px 0 rgba(255,255,255,0.05), inset 0 0 0 1px rgba(255,255,255,0.02), inset 0 -12px 24px rgba(0,0,0,0.18), inset 0 1px 0 rgba(0,0,0,0.14)",
              backdropFilter: "blur(16px) saturate(1.08)",
              WebkitBackdropFilter: "blur(16px) saturate(1.08)",
            }}
          >
            <div
              className="pointer-events-none absolute inset-0 rounded-r-[15px]"
              style={{
                background:
                  "linear-gradient(135deg, rgba(40, 50, 78, 0.26) 0%, rgba(24, 30, 46, 0.12) 56%, rgba(8, 10, 16, 0.18) 100%)",
              }}
            />
          </div>

          <div
            className="relative z-10 flex h-full items-center"
            onMouseDown={handleWindowDragMouseDown}
          >
            <div className="flex min-w-0 flex-1 pr-[148px]">
              {/* Search shell */}
              <div
                className="relative flex h-[40px] min-w-0 w-full self-center items-center rounded-[15px] border border-transparent bg-transparent pl-4 pr-4"
                onMouseDown={handleSearchShellMouseDown}
                onMouseMove={handleSearchShellMouseMove}
                onMouseUp={handleSearchShellMouseUp}
                onMouseLeave={handleSearchShellMouseUp}
              >
                <MagnifyingGlassIcon className="relative z-10 h-4 w-4 shrink-0 text-slate-500" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchInputKeyDown}
                  onMouseDown={handleSearchShellMouseDown}
                  onMouseMove={handleSearchShellMouseMove}
                  onMouseUp={handleSearchShellMouseUp}
                  onMouseLeave={handleSearchShellMouseUp}
                  placeholder="Navigate to space..."
                  size={searchInputSize}
                  className="relative z-10 no-drag electrobun-webkit-app-region-no-drag ml-3 min-w-[13ch] max-w-full flex-1 border-0 bg-transparent py-2 text-[15px] leading-none text-white placeholder:text-slate-500 focus:border-0 focus:outline-none focus:ring-0"
                  autoFocus
                  data-no-window-drag="true"
                />
              </div>
            </div>

            <div className="electrobun-webkit-app-region-no-drag absolute right-12 top-1/2 flex -translate-y-1/2 items-center gap-1 no-drag">
            <button
              onClick={() =>
                setViewMode((prev) => (prev === "list" ? "grid" : "list"))
              }
              className="rounded p-1 text-slate-500 transition-colors hover:bg-white/[0.06] hover:text-slate-200"
              title={`Switch to ${viewMode === "list" ? "Grid" : "List"} View (⌘G)`}
            >
              {viewMode === "list" ? (
                <Squares2X2Icon className="w-3.5 h-3.5" />
              ) : (
                <ListBulletIcon className="w-3.5 h-3.5" />
              )}
            </button>
            <button
              onClick={() => setShowContainers(true)}
              className="rounded p-1 text-slate-500 transition-colors hover:bg-white/[0.06] hover:text-slate-200"
              title="Containers (⌘C)"
            >
              <RectangleGroupIcon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="rounded p-1 text-slate-500 transition-colors hover:bg-white/[0.06] hover:text-slate-200"
              title="Settings (⌘,)"
            >
              <Cog6ToothIcon className="w-3.5 h-3.5" />
            </button>
            </div>

            {/* Close button — upper right */}
            <button
              onClick={animateHide}
              className="no-drag electrobun-webkit-app-region-no-drag absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/[0.08] bg-transparent text-slate-400 transition-colors hover:border-red-500/15 hover:bg-red-500/15 hover:text-red-500"
              title="Close (ESC)"
              aria-label="Close"
              data-no-window-drag="true"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {voiceOverlayState.visible && (
        <div className="pointer-events-none absolute inset-x-0 top-[88px] z-20 flex justify-center px-5">
          <div
            className="max-w-[320px] rounded-2xl border border-white/[0.08] px-4 py-3 text-center shadow-[0_18px_48px_rgba(0,0,0,0.42)]"
            style={{
              background:
                "linear-gradient(135deg, rgba(12,16,26,0.92) 0%, rgba(8,10,17,0.86) 100%)",
              backdropFilter: "blur(18px) saturate(1.08)",
              WebkitBackdropFilter: "blur(18px) saturate(1.08)",
            }}
          >
            <div className="text-[13px] font-medium tracking-[0.02em] text-slate-100">
              {voiceOverlayState.title}
            </div>
            <div className="mt-1 text-xs leading-5 text-slate-400">
              {voiceOverlayState.detail}
            </div>
          </div>
        </div>
      )}

      <div
        className="flex h-full flex-col"
        style={{
          opacity: isResultsCollapsed ? 0 : 1,
          pointerEvents: isResultsCollapsed ? "none" : undefined,
          transition: "opacity 120ms ease-out",
        }}
      >
        {/* Results */}
        <div
          className="flex-1 min-h-0 overflow-hidden"
        >
          {showSearchEmptyState ? (
            <div className="flex h-full items-center justify-center px-8 pb-10 text-center">
              <div>
                <div className="mb-2 text-[15px] font-medium text-slate-200">
                  No spaces found
                </div>
                <div className="text-sm text-slate-500">
                  No spaces match "{searchQuery}".
                </div>
              </div>
            </div>
          ) : viewMode === "grid" ? (
            <SpaceGrid
              spaces={filteredSpaces}
              activeSpaceId={currentSpaceId}
              selectedIndex={selectedIndex}
              onSpaceClick={handleSpaceClick}
              topInset={contentScrollTopInset}
              bottomInset={contentScrollBottomInset}
            />
          ) : (
            <Suspense fallback={null}>
              <SpaceList
                spaces={filteredSpaces}
                searchQuery={searchQuery}
                activeSpaceId={currentSpaceId}
                selectedIndex={selectedIndex}
                onSpaceClick={handleSpaceClick}
                topInset={contentScrollTopInset}
                bottomInset={contentScrollBottomInset}
              />
            </Suspense>
          )}
        </div>

        {/* Error Message */}
        {!isResultsCollapsed && error && (
          <div className="px-4 pb-4">
            <div className="rounded-2xl border border-red-500/15 bg-red-500/8 p-3 text-sm text-red-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
              {error}
            </div>
          </div>
        )}

        {/* Hint */}
        {!isResultsCollapsed && (
        <div
          className={`pointer-events-none absolute inset-x-0 bottom-0 z-10 px-3 pb-2 transition-opacity duration-150 ${
            showFooterHint ? "opacity-100" : "opacity-0"
          }`}
        >
          <div
            className="flex min-h-[24px] items-center px-3 py-0.5 text-[10px] text-slate-500"
            style={{
              textShadow:
                "0 1px 0 rgba(0,0,0,0.98), 0 0 12px rgba(0,0,0,0.92), 0 0 28px rgba(0,0,0,0.82)",
            }}
          >
          <div className="flex items-center justify-between">
            <span>
              ⌘D to toggle • Tab Navigate • {viewMode === "list" ? "↑↓ Arrows • " : ""}↵ Select •
              ESC Close • ⌘G View
            </span>
            <span className="select-none text-slate-600">Winzen</span>
          </div>
          </div>
        </div>
        )}
      </div>

      {/* Modals */}
      <Suspense fallback={null}>
        {showSetup && <SetupWizard onComplete={() => setShowSetup(false)} />}
        {showSettings && (
          <SpaceSettings
            onClose={() => setShowSettings(false)}
            onShowSetup={() => setShowSetup(true)}
          />
        )}
        {showContainers && (
          <ContainerManager onClose={() => setShowContainers(false)} />
        )}
      </Suspense>
    </div>
  );
};

export default App;
