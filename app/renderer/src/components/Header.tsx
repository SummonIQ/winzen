import React from 'react';

export const Header: React.FC = () => {
  return (
    <div className="flex select-none flex-col bg-gradient-to-r from-neutral-900/35 to-neutral-800/50 backdrop-blur-xl border-b border-neutral-500/10 rounded-t-md">
      {/* Title Bar */}
      <div className="flex h-[32px] items-center justify-between px-2.5 py-0 drag-region rounded-t-xl relative">
        <div className="flex items-center space-x-3 h-full">
          <div className="flex items-center space-x-2 -translate-x-1.5 p-[1.5px]">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-neutral-800/80 to-neutral-900/80 flex items-center justify-center shadow-lg">
              <div className="relative w-3 h-3">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-purple-600 animate-pulse-slow" />
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 blur-sm opacity-60" />
                <div className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full bg-white/40" />
              </div>
            </div>
            <span className="text-[13px] font-semibold text-violet-400/80 -translate-y-[0px]">
              Winzen
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 h-full relative z-[100] no-drag">
          <div className="w-px h-[calc(100%-20px)] bg-neutral-500/25" />

          <button
            onClick={() => window.electronAPI?.minimizeWindow?.()}
            className="w-5 h-5 rounded-full bg-yellow-500/15 hover:bg-yellow-500/25 transition-all duration-200 flex items-center justify-center group cursor-pointer"
            title="Minimize"
          >
            <svg className="w-3.5 h-3.5 text-yellow-400 group-hover:text-yellow-300 transition-colors pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>

          <button
            onClick={() => window.electronAPI?.closeWindow?.()}
            className="w-5 h-5 rounded-full bg-red-500/15 hover:bg-red-500/25 transition-all duration-200 flex items-center justify-center group cursor-pointer"
            title="Close"
          >
            <svg className="w-3.5 h-3.5 text-red-400 group-hover:text-red-300 transition-colors pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
