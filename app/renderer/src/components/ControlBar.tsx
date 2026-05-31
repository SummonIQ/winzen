import React from 'react';
import {
  WindowIcon,
  Squares2X2Icon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import { useStore } from '../store';

export const ControlBar: React.FC = () => {
  const { currentView, setCurrentView } = useStore();

  const navItems = [
    { id: 'windows' as const, icon: WindowIcon, label: 'Windows' },
    { id: 'desktops' as const, icon: Squares2X2Icon, label: 'Desktops' },
    { id: 'rules' as const, icon: Cog6ToothIcon, label: 'Rules' },
  ];

  return (
    <div className="border-t border-neutral-700/50 bg-neutral-900/50 backdrop-blur-sm">
      {/* Navigation */}
      <div className="flex items-center justify-center px-2 py-2">
        <div className="flex items-center justify-center space-x-1 max-w-full overflow-x-auto scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`flex flex-col items-center justify-center space-y-0.5 px-2 py-1.5 rounded-lg transition-all min-w-[60px] flex-shrink-0 relative ${
                  isActive
                    ? 'text-theme'
                    : 'text-neutral-400 hover:text-neutral-300 hover:bg-neutral-700/30'
                }`}
              >
                {isActive && (
                  <div
                    className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg pointer-events-none"
                    style={{
                      background: 'var(--theme-to)',
                      opacity: 0.1,
                    }}
                  />
                )}
                <Icon className="w-5 h-5 relative z-10" />
                <span className="text-[10px] font-medium whitespace-nowrap relative z-10">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
