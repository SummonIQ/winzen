import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useStore, Space } from '../store';
import { CameraIcon, ArrowPathIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

interface SpaceGridProps {
  spaces: Space[];
  activeSpaceId: string | null;
  selectedIndex: number;
  onSpaceClick: (spaceId: string) => void;
  topInset: number;
  bottomInset: number;
}

const SpaceThumbnail: React.FC<{
  screenshot?: string;
  alt: string;
  label: number;
  isLoading: boolean;
}> = ({
  screenshot,
  alt,
  label,
  isLoading,
}) => {
  const [displayedScreenshot, setDisplayedScreenshot] = useState<string | undefined>(screenshot);

  useEffect(() => {
    if (!screenshot || screenshot === displayedScreenshot) {
      return;
    }

    const image = new Image();
    image.onload = () => {
      setDisplayedScreenshot(screenshot);
    };
    image.src = screenshot;
  }, [displayedScreenshot, screenshot]);

  useEffect(() => {
    if (!displayedScreenshot && screenshot) {
      setDisplayedScreenshot(screenshot);
    }
  }, [displayedScreenshot, screenshot]);

  if (!displayedScreenshot) {
    return (
      <div className="absolute inset-0 flex items-center justify-center pb-4">
        <div className="text-center">
          {isLoading ? (
            <>
              <ArrowPathIcon className="mx-auto mb-2 h-5 w-5 animate-spin text-gray-500" />
              <div className="text-[9px] uppercase tracking-[0.14em] text-gray-500">
                Loading preview
              </div>
            </>
          ) : (
            <>
              <div className="text-2xl text-gray-600">{label}</div>
              <div className="text-[9px] text-gray-600">No preview</div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <img
      src={displayedScreenshot}
      alt={alt}
      className="h-full w-full rounded-[9px] object-cover brightness-110"
      draggable={false}
    />
  );
};

const MONITOR_COLORS = [
  { bg: 'rgba(99, 102, 241, 0.05)', border: 'rgba(99, 102, 241, 0.25)', text: 'rgb(129, 140, 248)', dot: 'rgb(99, 102, 241)' },   // indigo
  { bg: 'rgba(20, 184, 166, 0.05)', border: 'rgba(20, 184, 166, 0.25)', text: 'rgb(94, 234, 212)', dot: 'rgb(20, 184, 166)' },     // teal
  { bg: 'rgba(245, 158, 11, 0.05)', border: 'rgba(245, 158, 11, 0.25)', text: 'rgb(252, 211, 77)', dot: 'rgb(245, 158, 11)' },     // amber
  { bg: 'rgba(236, 72, 153, 0.05)', border: 'rgba(236, 72, 153, 0.25)', text: 'rgb(244, 114, 182)', dot: 'rgb(236, 72, 153)' },    // pink
  { bg: 'rgba(34, 197, 94, 0.05)', border: 'rgba(34, 197, 94, 0.25)', text: 'rgb(134, 239, 172)', dot: 'rgb(34, 197, 94)' },       // green
  { bg: 'rgba(168, 85, 247, 0.05)', border: 'rgba(168, 85, 247, 0.25)', text: 'rgb(196, 148, 252)', dot: 'rgb(168, 85, 247)' },    // purple
];

type ColorFamily = 'pastel' | 'neon' | 'earthy';

const COLOR_FAMILY_SWATCHES: Record<ColorFamily, string[]> = {
  pastel: ['167,139,250', '125,211,252', '134,239,172', '253,224,71', '244,114,182', '250,204,21'],
  neon: ['99,102,241', '6,182,212', '34,197,94', '234,179,8', '236,72,153', '168,85,247'],
  earthy: ['161,98,7', '120,113,108', '101,163,13', '180,83,9', '120,53,15', '133,77,14'],
};

const SpaceGridComponent: React.FC<SpaceGridProps> = ({
  spaces,
  activeSpaceId,
  selectedIndex,
  onSpaceClick,
  topInset,
  bottomInset,
}) => {
  const captureSpaceScreenshot = useStore((state) => state.captureSpaceScreenshot);
  const updateSpaceName = useStore((state) => state.updateSpaceName);
  const [capturingSpaceId, setCapturingSpaceId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; spaceId: string } | null>(null);
  const [settingsPopover, setSettingsPopover] = useState<{ x: number; y: number; spaceId: string } | null>(null);
  const [settingsNameValue, setSettingsNameValue] = useState('');
  const [colorFamily, setColorFamily] = useState<ColorFamily>(() => {
    const stored = localStorage.getItem('space_color_family_mode');
    return stored === 'neon' || stored === 'earthy' ? stored : 'pastel';
  });
  const [spaceColorOverrides, setSpaceColorOverrides] = useState<Record<string, string>>(() => {
    try {
      return JSON.parse(localStorage.getItem('space_color_overrides') || '{}');
    } catch {
      return {};
    }
  });
  const [monitorColorOverrides, setMonitorColorOverrides] = useState<Record<string, string>>(() => {
    try {
      return JSON.parse(localStorage.getItem('monitor_color_overrides') || '{}');
    } catch {
      return {};
    }
  });
  const [renamingSpaceId, setRenamingSpaceId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [isScrolling, setIsScrolling] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedItemRef = useRef<HTMLDivElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);
  const userScrolledRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();
  const scrollingStateTimeoutRef = useRef<NodeJS.Timeout>();
  const spaceIndexMap = useMemo(
    () => new Map(spaces.map((space, index) => [space.id, index])),
    [spaces]
  );
  const monitorSections = useMemo(
    () =>
      spaces.reduce<Array<{ key: string; label: string; spaces: Space[]; colorIndex: number }>>(
        (sections, space) => {
          const section = sections.find((item) => item.key === space.monitorId);
          if (section) {
            section.spaces.push(space);
          } else {
            sections.push({
              key: space.monitorId,
              label: space.monitorName,
              spaces: [space],
              colorIndex: sections.length % MONITOR_COLORS.length,
            });
          }
          return sections;
        },
        []
      ),
    [spaces]
  );

  const getConstrainedPosition = useCallback((x: number, y: number, width = 220, height = 340) => {
    const padding = 8;
    const nextX = Math.min(Math.max(x, padding), window.innerWidth - width - padding);
    const nextY = Math.min(Math.max(y, padding), window.innerHeight - height - padding);
    return { x: nextX, y: nextY };
  }, []);

  const handleContextMenu = useCallback((e: React.MouseEvent, spaceId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const pos = getConstrainedPosition(e.clientX - 6, e.clientY - 10);
    setContextMenu({ x: pos.x, y: pos.y, spaceId });
    setSettingsPopover(null);
  }, [getConstrainedPosition]);

  const handleSettingsPopoverOpen = useCallback((e: React.MouseEvent, space: Space) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const pos = getConstrainedPosition(rect.right - 220, rect.bottom + 8);
    setSettingsNameValue(space.name);
    setSettingsPopover({ x: pos.x, y: pos.y, spaceId: space.id });
    setContextMenu(null);
  }, [getConstrainedPosition]);

  const handleRenameStart = useCallback((spaceId: string) => {
    const space = spaces.find((s) => s.id === spaceId);
    if (space) {
      setRenameValue(space.name);
      setRenamingSpaceId(spaceId);
      setContextMenu(null);
    }
  }, [spaces]);

  const handleRenameConfirm = useCallback(() => {
    if (renamingSpaceId && renameValue.trim()) {
      updateSpaceName(renamingSpaceId, renameValue.trim());
    }
    setRenamingSpaceId(null);
  }, [renamingSpaceId, renameValue, updateSpaceName]);

  const handleRenameKeyDown = useCallback((e: React.KeyboardEvent) => {
    e.stopPropagation();
    if (e.key === 'Enter') {
      handleRenameConfirm();
    } else if (e.key === 'Escape') {
      setRenamingSpaceId(null);
    }
  }, [handleRenameConfirm]);

  // Close context menu on mousedown outside
  useEffect(() => {
    if (!contextMenu && !settingsPopover) return;
    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-context-menu]') && !target.closest('[data-settings-popover]')) {
        setContextMenu(null);
        setSettingsPopover(null);
      }
    };
    window.addEventListener('mousedown', handleMouseDown);
    return () => window.removeEventListener('mousedown', handleMouseDown);
  }, [contextMenu, settingsPopover]);

  // Focus rename input when it appears
  useEffect(() => {
    if (renamingSpaceId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingSpaceId]);

  const handleCaptureOne = useCallback(async (spaceId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCapturingSpaceId(spaceId);
    await captureSpaceScreenshot(spaceId);
    setCapturingSpaceId(null);
  }, [captureSpaceScreenshot]);

  // Handle manual scroll - mark that user has scrolled
  const handleScroll = useCallback(() => {
    userScrolledRef.current = true;
    setIsScrolling(true);
    
    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    if (scrollingStateTimeoutRef.current) {
      clearTimeout(scrollingStateTimeoutRef.current);
    }
    
    // Re-enable auto-scroll after 3 seconds of no scrolling
    scrollTimeoutRef.current = setTimeout(() => {
      userScrolledRef.current = false;
    }, 3000);
    scrollingStateTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 700);
  }, []);

  // Auto-scroll to selected item when navigating with keyboard
  useEffect(() => {
    // Only auto-scroll if user hasn't manually scrolled
    if (!userScrolledRef.current && selectedItemRef.current) {
      selectedItemRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest'
      });
    }
  }, [selectedIndex]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      if (scrollingStateTimeoutRef.current) {
        clearTimeout(scrollingStateTimeoutRef.current);
      }
    };
  }, []);

  const rgbCss = useCallback((rgbTriplet: string) => `rgb(${rgbTriplet})`, []);
  const rgbaCss = useCallback((rgbTriplet: string, alpha: number) => `rgba(${rgbTriplet}, ${alpha})`, []);

  const makeColorSet = useCallback((rgbTriplet: string) => ({
    bg: rgbaCss(rgbTriplet, 0.07),
    border: rgbaCss(rgbTriplet, 0.28),
    text: rgbCss(rgbTriplet),
    dot: rgbCss(rgbTriplet),
  }), [rgbCss, rgbaCss]);

  useEffect(() => {
    localStorage.setItem('space_color_family_mode', colorFamily);
  }, [colorFamily]);

  useEffect(() => {
    localStorage.setItem('space_color_overrides', JSON.stringify(spaceColorOverrides));
  }, [spaceColorOverrides]);

  useEffect(() => {
    localStorage.setItem('monitor_color_overrides', JSON.stringify(monitorColorOverrides));
  }, [monitorColorOverrides]);

  useEffect(() => {
    const overlayOverrides: Record<string, string> = {};
    monitorSections.forEach((section, index) => {
      const override = monitorColorOverrides[section.key];
      if (override) {
        overlayOverrides[String(index)] = override;
      }
    });

    const overlayApi = window.electronAPI as typeof window.electronAPI & {
      setOverlayColors?: (colors: Record<string, string>) => Promise<void>;
    };
    void overlayApi.setOverlayColors?.(overlayOverrides);
  }, [monitorColorOverrides, monitorSections]);

  const applySpaceColor = useCallback((spaceId: string, rgbTriplet: string) => {
    setSpaceColorOverrides((prev) => ({ ...prev, [spaceId]: rgbTriplet }));
  }, []);

  const clearSpaceColor = useCallback((spaceId: string) => {
    setSpaceColorOverrides((prev) => {
      const next = { ...prev };
      delete next[spaceId];
      return next;
    });
  }, []);

  const applyMonitorColor = useCallback((monitorId: string, rgbTriplet: string) => {
    setMonitorColorOverrides((prev) => ({ ...prev, [monitorId]: rgbTriplet }));
  }, []);

  const clearMonitorColor = useCallback((monitorId: string) => {
    setMonitorColorOverrides((prev) => {
      const next = { ...prev };
      delete next[monitorId];
      return next;
    });
  }, []);

  const toggleSection = useCallback((sectionKey: string) => {
    setCollapsedSections((prev) => ({ ...prev, [sectionKey]: !prev[sectionKey] }));
  }, []);

  const contextSpace = contextMenu
    ? spaces.find((space) => space.id === contextMenu.spaceId) ?? null
    : null;
  const contextMonitorId = contextSpace?.monitorId ?? null;
  const settingsSpace = settingsPopover
    ? spaces.find((space) => space.id === settingsPopover.spaceId) ?? null
    : null;
  const settingsMonitorId = settingsSpace?.monitorId ?? null;
  const familySwatches = COLOR_FAMILY_SWATCHES[colorFamily];

  return (
    <div
      className={`h-full min-h-0 overflow-y-auto overflow-x-hidden pl-[18px] pr-[17px] ${
        isScrolling ? 'scrollbar-auto-visible' : 'scrollbar-auto-hidden'
      }`}
      ref={containerRef}
      onScroll={handleScroll}
      style={{ paddingTop: topInset, paddingBottom: bottomInset }}
    >
      <div className="space-y-1">
        {monitorSections.map((section) => {
          const monitorOverride = monitorColorOverrides[section.key];
          const color = monitorOverride ? makeColorSet(monitorOverride) : MONITOR_COLORS[section.colorIndex];
          const isMainDisplay = section.label.toLowerCase() === 'main display';
          const isCollapsed = Boolean(collapsedSections[section.key]);
          return (
          <section key={section.key} className="space-y-2">
            <div className="sticky top-0 z-10 flex items-center justify-between px-0 pt-0 pb-1">
              <button
                type="button"
                onClick={() => toggleSection(section.key)}
                className="flex items-center gap-2 rounded-full px-0 py-1 transition-colors hover:bg-white/[0.04]"
                aria-expanded={!isCollapsed}
                aria-label={`${isCollapsed ? 'Expand' : 'Collapse'} ${section.label}`}
              >
                {isMainDisplay ? (
                  <span
                    className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.15em]"
                    style={{ color: color.text }}
                  >
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color.dot }} />
                    <span>{section.label}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: color.text }}>
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color.dot }} />
                    <span>{section.label}</span>
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => toggleSection(section.key)}
                className="flex items-center gap-2 text-[9px] uppercase tracking-[0.16em] text-white/35 transition-colors hover:text-white/55"
                aria-expanded={!isCollapsed}
                aria-label={`${isCollapsed ? 'Expand' : 'Collapse'} ${section.label} spaces`}
              >
                <span>
                  {section.spaces.length} {section.spaces.length === 1 ? 'space' : 'spaces'}
                </span>
                <span className="text-[14px] leading-none">{isCollapsed ? '▸' : '▾'}</span>
              </button>
            </div>

            {!isCollapsed && (
            <div className="grid grid-cols-3 gap-2 auto-rows-min">
              {section.spaces.map((space) => {
                const index = spaceIndexMap.get(space.id) ?? -1;
                const isActiveSpace =
                  activeSpaceId != null ? space.id === activeSpaceId : index === selectedIndex;
                const spaceOverride = spaceColorOverrides[space.id];
                const cardColor = spaceOverride ? makeColorSet(spaceOverride) : color;

                return (
                  <div
                    key={space.id}
                    ref={index === selectedIndex ? selectedItemRef : null}
                    onClick={() => onSpaceClick(space.id)}
                    onContextMenu={(e) => handleContextMenu(e, space.id)}
                    data-no-window-drag="true"
                    className={`group relative cursor-pointer overflow-hidden rounded-[11px] border transition-all ${
                      isActiveSpace
                        ? 'ring-4 ring-offset-2'
                        : 'hover:border-white/15 hover:brightness-105'
                    }`}
                    style={{
                      backgroundColor: cardColor.bg,
                      borderWidth: isActiveSpace ? '3px' : '1px',
                      borderColor:
                        isActiveSpace
                          ? cardColor.dot
                          : 'rgba(126, 140, 168, 0.22)',
                      ...(isActiveSpace
                        ? {
                            boxShadow: `0 0 0 1px rgba(255,255,255,0.06), 0 0 0 4px ${cardColor.dot.replace('rgb', 'rgba').replace(')', ', 0.2)')}, 0 0 28px ${cardColor.dot.replace('rgb', 'rgba').replace(')', ', 0.34)')}`,
                            ['--tw-ring-color' as string]: cardColor.dot,
                            ['--tw-ring-offset-color' as string]: 'rgb(10 14 22)',
                          }
                        : {}),
                    }}
                  >
                    <div className="relative aspect-[16/10] bg-gray-900/50">
                      <SpaceThumbnail
                        screenshot={space.screenshot}
                        alt={space.name}
                        label={space.monitorSpaceNumber}
                        isLoading={false}
                      />

                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: cardColor.bg }} />

                      <div className="absolute top-1.5 right-1.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => handleSettingsPopoverOpen(e, space)}
                          className="p-1 bg-black/55 hover:bg-black/75 rounded"
                          title="Space settings"
                          aria-label="Space settings"
                        >
                          <Cog6ToothIcon className="w-3 h-3 text-white" />
                        </button>

                        <button
                          onClick={(e) => handleCaptureOne(space.id, e)}
                          disabled={capturingSpaceId === space.id}
                          className="p-1 bg-black/55 hover:bg-black/75 rounded disabled:opacity-50"
                          title="Capture screenshot"
                        >
                          {capturingSpaceId === space.id ? (
                            <ArrowPathIcon className="w-3 h-3 text-white animate-spin" />
                          ) : (
                            <CameraIcon className="w-3 h-3 text-white" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="p-1 bg-gradient-to-t from-black/70 to-transparent absolute bottom-0 left-0 right-0">
                      <div className="flex items-center justify-between">
                        {renamingSpaceId === space.id ? (
                          <input
                            ref={renameInputRef}
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onKeyDown={handleRenameKeyDown}
                            onBlur={handleRenameConfirm}
                            onClick={(e) => e.stopPropagation()}
                            className="text-[10px] font-medium text-white bg-white/10 border border-blue-500/50 rounded px-1 py-0 outline-none focus:ring-1 focus:ring-blue-500/50 w-full"
                          />
                        ) : (
                          <div className="pl-[3px] text-[11px] font-medium text-white/90">{space.name}</div>
                        )}
                        {isActiveSpace && renamingSpaceId !== space.id && (
                          <div className="text-[9px] px-1.5 py-0.5 rounded" style={{ color: cardColor.text, backgroundColor: cardColor.dot.replace('rgb', 'rgba').replace(')', ', 0.2)') }}>
                            ↵
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            )}
          </section>
          );
        })}
      </div>

      {contextMenu && (
        <div
          data-context-menu
          className="fixed z-50 min-w-[220px] rounded-md border border-white/20 bg-black/[0.99] shadow-xl p-2"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            className="w-full rounded text-left px-3 py-1.5 text-[11px] font-medium text-white hover:bg-white/16 transition-colors"
            onClick={() => handleRenameStart(contextMenu.spaceId)}
          >
            Rename
          </button>

          <div className="my-2 h-px bg-white/20" />

          <div className="px-1 pb-1">
            <p className="mb-1 text-[10px] uppercase tracking-[0.14em] text-white/80">Color Family</p>
            <div className="flex gap-1">
              {(['pastel', 'neon', 'earthy'] as ColorFamily[]).map((family) => (
                <button
                  key={family}
                  onClick={() => setColorFamily(family)}
                  className={`rounded px-2 py-1 text-[10px] uppercase tracking-[0.1em] transition-colors ${
                    colorFamily === family
                      ? 'bg-white/24 text-white'
                      : 'bg-white/12 text-white/90 hover:bg-white/20'
                  }`}
                >
                  {family}
                </button>
              ))}
            </div>
          </div>

          <div className="px-1 pb-1">
            <p className="mb-1 text-[10px] uppercase tracking-[0.14em] text-white/80">Space Color</p>
            <div className="grid grid-cols-6 gap-1.5">
              {familySwatches.map((swatch) => (
                <button
                  key={`space-${swatch}`}
                  onClick={() => contextSpace && applySpaceColor(contextSpace.id, swatch)}
                  className="h-5 w-5 rounded border border-white/30 transition-transform hover:scale-105"
                  style={{ backgroundColor: rgbaCss(swatch, 0.9) }}
                  aria-label="Set space color"
                />
              ))}
            </div>
            <button
              className="mt-1 w-full rounded px-2 py-1 text-left text-[10px] font-medium text-white/95 bg-white/8 hover:bg-white/16"
              onClick={() => contextSpace && clearSpaceColor(contextSpace.id)}
            >
              Clear space color
            </button>
          </div>

          <div className="px-1">
            <p className="mb-1 text-[10px] uppercase tracking-[0.14em] text-white/80">Monitor Color</p>
            <div className="grid grid-cols-6 gap-1.5">
              {familySwatches.map((swatch) => (
                <button
                  key={`monitor-${swatch}`}
                  onClick={() => contextMonitorId && applyMonitorColor(contextMonitorId, swatch)}
                  className="h-5 w-5 rounded border border-white/30 transition-transform hover:scale-105"
                  style={{ backgroundColor: rgbaCss(swatch, 0.9) }}
                  aria-label="Set monitor color"
                />
              ))}
            </div>
            <button
              className="mt-1 w-full rounded px-2 py-1 text-left text-[10px] font-medium text-white/95 bg-white/8 hover:bg-white/16"
              onClick={() => contextMonitorId && clearMonitorColor(contextMonitorId)}
            >
              Clear monitor color
            </button>
          </div>
        </div>
      )}

      {settingsPopover && settingsSpace && (
        <div
          data-settings-popover
          className="fixed z-50 w-[220px] rounded-md border border-white/15 bg-black/[0.96] p-2 shadow-xl"
          style={{ left: settingsPopover.x, top: settingsPopover.y }}
        >
          <p className="mb-1 text-[10px] uppercase tracking-[0.12em] text-white/70">Space Settings</p>

          <div className="mb-2 rounded border border-white/12 bg-white/[0.03] p-2">
            <label className="mb-1 block text-[10px] uppercase tracking-[0.12em] text-white/70">Name</label>
            <input
              value={settingsNameValue}
              onChange={(e) => setSettingsNameValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && settingsNameValue.trim()) {
                  updateSpaceName(settingsSpace.id, settingsNameValue.trim());
                  setSettingsPopover(null);
                }
                if (e.key === 'Escape') {
                  setSettingsPopover(null);
                }
              }}
              className="w-full rounded border border-white/25 bg-black/70 px-2 py-1 text-[11px] text-white outline-none focus:border-white/45"
            />
            <button
              className="mt-1 w-full rounded bg-white/12 px-2 py-1 text-[10px] font-medium text-white hover:bg-white/20"
              onClick={() => {
                if (settingsNameValue.trim()) {
                  updateSpaceName(settingsSpace.id, settingsNameValue.trim());
                }
                setSettingsPopover(null);
              }}
            >
              Save name
            </button>
          </div>

          <div className="mb-2">
            <p className="mb-1 text-[10px] uppercase tracking-[0.12em] text-white/70">Color Family</p>
            <div className="flex gap-1">
              {(['pastel', 'neon', 'earthy'] as ColorFamily[]).map((family) => (
                <button
                  key={`settings-${family}`}
                  onClick={() => setColorFamily(family)}
                  className={`rounded px-2 py-1 text-[10px] uppercase tracking-[0.08em] ${
                    colorFamily === family ? 'bg-white/22 text-white' : 'bg-white/10 text-white/85 hover:bg-white/18'
                  }`}
                >
                  {family}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-2">
            <p className="mb-1 text-[10px] uppercase tracking-[0.12em] text-white/70">Space Color</p>
            <div className="grid grid-cols-6 gap-1.5">
              {familySwatches.map((swatch) => (
                <button
                  key={`settings-space-${swatch}`}
                  onClick={() => applySpaceColor(settingsSpace.id, swatch)}
                  className="h-5 w-5 rounded border border-white/30"
                  style={{ backgroundColor: rgbaCss(swatch, 0.9) }}
                  aria-label="Set space color"
                />
              ))}
            </div>
            <button
              className="mt-1 w-full rounded bg-white/10 px-2 py-1 text-left text-[10px] text-white/90 hover:bg-white/16"
              onClick={() => clearSpaceColor(settingsSpace.id)}
            >
              Clear space color
            </button>
          </div>

          <div>
            <p className="mb-1 text-[10px] uppercase tracking-[0.12em] text-white/70">Monitor Color</p>
            <div className="grid grid-cols-6 gap-1.5">
              {familySwatches.map((swatch) => (
                <button
                  key={`settings-monitor-${swatch}`}
                  onClick={() => settingsMonitorId && applyMonitorColor(settingsMonitorId, swatch)}
                  className="h-5 w-5 rounded border border-white/30"
                  style={{ backgroundColor: rgbaCss(swatch, 0.9) }}
                  aria-label="Set monitor color"
                />
              ))}
            </div>
            <button
              className="mt-1 w-full rounded bg-white/10 px-2 py-1 text-left text-[10px] text-white/90 hover:bg-white/16"
              onClick={() => settingsMonitorId && clearMonitorColor(settingsMonitorId)}
            >
              Clear monitor color
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const SpaceGrid = React.memo(SpaceGridComponent);
SpaceGrid.displayName = 'SpaceGrid';
