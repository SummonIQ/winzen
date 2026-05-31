import React, { useCallback, useEffect, useRef } from "react";
import { Space } from "../store";

interface SpaceListProps {
  spaces: Space[];
  searchQuery: string;
  activeSpaceId: string | null;
  selectedIndex: number;
  onSpaceClick: (spaceId: string) => void;
  topInset: number;
  bottomInset: number;
}

export const SpaceList: React.FC<SpaceListProps> = ({
  spaces,
  searchQuery,
  activeSpaceId,
  selectedIndex,
  onSpaceClick,
  topInset,
  bottomInset,
}) => {
  const selectedListItemRef = useRef<HTMLDivElement>(null);
  const userScrolledRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();
  const scrollingStateTimeoutRef = useRef<NodeJS.Timeout>();
  const [isScrolling, setIsScrolling] = React.useState(false);

  const handleListScroll = useCallback(() => {
    userScrolledRef.current = true;
    setIsScrolling(true);

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    if (scrollingStateTimeoutRef.current) {
      clearTimeout(scrollingStateTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      userScrolledRef.current = false;
    }, 3000);
    scrollingStateTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 700);
  }, []);

  useEffect(() => {
    if (!userScrolledRef.current && selectedListItemRef.current) {
      selectedListItemRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [selectedIndex]);

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

  return (
    <div
      onScroll={handleListScroll}
      className={`h-full overflow-y-auto px-4 ${
        isScrolling ? "scrollbar-auto-visible" : "scrollbar-auto-hidden"
      }`}
      style={{ paddingTop: topInset, paddingBottom: bottomInset }}
    >
      {spaces.length > 0 ? (
        spaces.map((space, index) => (
          (() => {
            const isActiveSpace =
              activeSpaceId != null ? space.id === activeSpaceId : index === selectedIndex;

            return (
          <div
            key={space.id}
            ref={index === selectedIndex ? selectedListItemRef : null}
            onClick={() => onSpaceClick(space.id)}
            data-no-window-drag="true"
            className={`group mb-3 cursor-pointer overflow-hidden rounded-[22px] border transition-all duration-200 ${
              isActiveSpace
                ? "border-blue-300/90 bg-[linear-gradient(135deg,rgba(26,56,118,0.98),rgba(19,43,92,0.9))] shadow-[0_0_0_2px_rgba(96,165,250,0.38),0_0_0_6px_rgba(37,99,235,0.16),0_24px_48px_-24px_rgba(29,78,216,0.95)]"
                : "border-white/[0.04] bg-[linear-gradient(135deg,rgba(12,16,26,0.86),rgba(8,11,18,0.72))] hover:border-white/[0.07] hover:bg-[linear-gradient(135deg,rgba(17,23,36,0.88),rgba(10,14,24,0.76))]"
            }`}
          >
            <div className="flex items-center justify-between px-5 py-4">
              <div className="min-w-0">
                <div className="mb-2 flex items-center gap-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${
                      isActiveSpace
                        ? "bg-blue-400/16 text-blue-200"
                        : "bg-white/[0.05] text-slate-400"
                    }`}
                  >
                    Space {space.number}
                  </span>
                </div>
                <div
                  className={`truncate text-[18px] font-semibold tracking-[0.01em] ${
                    isActiveSpace ? "text-white" : "text-slate-100"
                  }`}
                >
                  {space.name}
                </div>
              </div>
              {isActiveSpace && (
                <div className="rounded-2xl border border-blue-300/10 bg-blue-400/12 px-4 py-3 text-sm text-blue-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                  ↵
                </div>
              )}
            </div>
          </div>
            );
          })()
        ))
      ) : searchQuery ? (
        <div className="px-6 py-8 text-center">
          <p className="text-slate-400">
            No spaces found matching "{searchQuery}"
          </p>
        </div>
      ) : (
        <div className="px-6 py-8 text-center">
          <p className="text-slate-400">Loading spaces...</p>
        </div>
      )}
    </div>
  );
};
