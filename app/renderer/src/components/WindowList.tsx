import React from 'react';
import { useStore } from '../store';
import { ArrowPathIcon, WindowIcon } from '@heroicons/react/24/outline';

export const WindowList: React.FC = () => {
  const { windows, desktops, moveWindow, loadWindows } = useStore();

  const handleMoveWindow = async (windowId: string, desktopId: string) => {
    await moveWindow(windowId, desktopId);
  };

  return (
    <div className="flex flex-1 flex-col px-4 pb-4 pt-3.5 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Active Windows</h2>
        <button
          onClick={() => loadWindows()}
          className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition-colors border border-blue-500/20"
        >
          <ArrowPathIcon className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {windows.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 text-center">
          <WindowIcon className="w-16 h-16 mb-4 text-blue-500/50" />
          <h3 className="text-lg font-semibold text-white mb-2">No Windows Found</h3>
          <p className="text-sm text-gray-400 max-w-xs">
            Click refresh to scan for open windows on your system
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {windows.map((window) => (
            <div
              key={window.id}
              className="bg-gradient-to-br from-neutral-900/40 to-neutral-950/60 backdrop-blur-xl border border-neutral-700/30 rounded-lg p-4 hover:border-neutral-600/40 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-white mb-1">
                    {window.title}
                  </h3>
                  <p className="text-xs text-gray-400">
                    {window.app}
                  </p>
                  {window.desktop && (
                    <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-500/15 text-blue-400 border border-blue-500/20">
                      Desktop: {window.desktop}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <select
                  className="flex-1 bg-neutral-800/60 border border-neutral-700/40 text-white text-sm rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all"
                  onChange={(e) => handleMoveWindow(window.id, e.target.value)}
                  defaultValue=""
                >
                  <option value="" disabled>
                    Move to desktop...
                  </option>
                  {desktops.map((desktop) => (
                    <option key={desktop.id} value={desktop.id} className="bg-neutral-800">
                      {desktop.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
