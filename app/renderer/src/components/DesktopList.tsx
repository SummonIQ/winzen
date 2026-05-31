import React from "react";
import { useStore } from "../store";
import { Squares2X2Icon, ArrowPathIcon } from "@heroicons/react/24/outline";

export const DesktopList: React.FC = () => {
  const { spaces, windows, loadSpaces } = useStore();

  const getWindowsForSpace = (spaceId: string) => {
    return windows.filter((w) => w.spaceId === spaceId);
  };

  return (
    <div className="flex flex-1 flex-col px-4 pb-4 pt-3.5 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Spaces</h2>
        <button
          onClick={() => loadSpaces()}
          className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition-colors border border-blue-500/20"
        >
          <ArrowPathIcon className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {spaces.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 text-center">
          <Squares2X2Icon className="w-16 h-16 mb-4 text-blue-500/50" />
          <h3 className="text-lg font-semibold text-white mb-2">
            No Spaces Found
          </h3>
          <p className="text-sm text-gray-400 max-w-xs">
            Click refresh to scan for spaces on your system
          </p>
        </div>
      ) : (
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
          {spaces.map((space) => {
            const spaceWindows = getWindowsForSpace(space.id);
            return (
              <div
                key={space.id}
                className="bg-gradient-to-br from-neutral-900/40 to-neutral-950/60 backdrop-blur-xl border border-neutral-700/30 rounded-lg p-4 hover:border-neutral-600/40 transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-white">
                    {space.name}
                  </h3>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-500/15 text-blue-400 border border-blue-500/20">
                    {spaceWindows.length} windows
                  </span>
                </div>

                {spaceWindows.length > 0 ? (
                  <div className="space-y-2">
                    {spaceWindows.map((window) => (
                      <div
                        key={window.id}
                        className="text-xs text-gray-300 bg-neutral-800/40 rounded px-2 py-1.5 border border-neutral-700/20"
                      >
                        {window.title}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 text-center py-2">
                    No windows
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
