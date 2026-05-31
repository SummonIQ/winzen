import React, { useRef, useState, useLayoutEffect } from 'react';
import { cn } from '../../lib/utils';

export interface Tab {
  id: string;
  label: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (id: string) => void;
  className?: string;
  stretch?: boolean;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className,
  stretch = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number } | null>(null);
  const hasAnimatedOnce = useRef(false);

  useLayoutEffect(() => {
    const activeEl = tabRefs.current.get(activeTab);
    const container = containerRef.current;
    if (activeEl && container) {
      const containerRect = container.getBoundingClientRect();
      const tabRect = activeEl.getBoundingClientRect();
      setIndicatorStyle({
        left: tabRect.left - containerRect.left,
        width: tabRect.width,
      });
    }
  }, [activeTab, tabs]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative flex gap-1 overflow-hidden bg-neutral-950/50 rounded-lg p-1 border-b border-b-neutral-700/30',
        stretch ? 'w-full' : 'w-fit',
        className,
      )}
      style={{ boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.4)' }}
    >
      {indicatorStyle && (
        <div
          className="absolute top-1 bottom-1 rounded-md bg-neutral-700/60 shadow-md shadow-black/25 border-t border-t-white/10 border-l border-l-white/5 border-r border-r-white/5 border-b border-b-black/5 origin-center"
          style={{
            left: indicatorStyle.left,
            width: indicatorStyle.width,
            transition: hasAnimatedOnce.current
              ? 'left 220ms cubic-bezier(0.22, 1, 0.36, 1), width 220ms cubic-bezier(0.22, 1, 0.36, 1)'
              : 'none',
          }}
        />
      )}
      {tabs.map(tab => (
        <button
          key={tab.id}
          ref={el => {
            if (el) tabRefs.current.set(tab.id, el);
          }}
          onClick={() => {
            hasAnimatedOnce.current = true;
            onTabChange(tab.id);
          }}
          className={cn(
            'relative z-10 min-w-0 rounded-[4px] border-none px-3 py-2 text-xs font-medium text-gray-400 outline-none transition-colors',
            stretch ? 'flex-1 text-center' : 'whitespace-nowrap',
            activeTab === tab.id ? 'text-white' : 'hover:text-gray-300',
          )}
        >
          <span className="block truncate">{tab.label}</span>
        </button>
      ))}
    </div>
  );
};
