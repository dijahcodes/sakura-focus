import { useState } from 'react';
import { CheckSquare, Clock, PlusCircle, BarChart3, Palette, Trash2, Laptop } from 'lucide-react';
import { playClickSound } from '../utils/sound.ts';

interface MacDockProps {
  activeView: 'split' | 'tasks' | 'pomodoro';
  onSelectView: (view: 'split' | 'tasks' | 'pomodoro') => void;
  onOpenQuickAdd: () => void;
  onOpenStats: () => void;
  onOpenAppearance: () => void;
  onOpenTrash: () => void;
  onOpenMacApp?: () => void;
  pendingTasksCount: number;
  pomoIsRunning: boolean;
  trashCount: number;
}

interface DockItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: number | string;
  isActive?: boolean;
  onClick: () => void;
}

export default function MacDock({
  activeView,
  onSelectView,
  onOpenQuickAdd,
  onOpenStats,
  onOpenAppearance,
  onOpenTrash,
  onOpenMacApp,
  pendingTasksCount,
  pomoIsRunning,
  trashCount,
}: MacDockProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const items: DockItem[] = [
    {
      id: 'tasks',
      label: 'To-Do Tasks',
      icon: <CheckSquare className="w-6 h-6 text-pink-100" />,
      badge: pendingTasksCount > 0 ? pendingTasksCount : undefined,
      isActive: activeView === 'tasks' || activeView === 'split',
      onClick: () => {
        playClickSound();
        onSelectView(activeView === 'tasks' ? 'split' : 'tasks');
      },
    },
    {
      id: 'pomodoro',
      label: 'Pomodoro Focus Clock',
      icon: <Clock className={`w-6 h-6 ${pomoIsRunning ? 'text-rose-200 animate-pulse' : 'text-pink-100'}`} />,
      badge: pomoIsRunning ? '●' : undefined,
      isActive: activeView === 'pomodoro' || activeView === 'split',
      onClick: () => {
        playClickSound();
        onSelectView(activeView === 'pomodoro' ? 'split' : 'pomodoro');
      },
    },
    {
      id: 'quickAdd',
      label: 'New Task (⌘N)',
      icon: <PlusCircle className="w-6 h-6 text-pink-100" />,
      onClick: () => {
        playClickSound();
        onOpenQuickAdd();
      },
    },
    {
      id: 'stats',
      label: 'Focus Insights & Streak',
      icon: <BarChart3 className="w-6 h-6 text-pink-100" />,
      onClick: () => {
        playClickSound();
        onOpenStats();
      },
    },
    {
      id: 'appearance',
      label: 'Glass & Wallpaper Settings',
      icon: <Palette className="w-6 h-6 text-pink-100" />,
      onClick: () => {
        playClickSound();
        onOpenAppearance();
      },
    },
    {
      id: 'macApp',
      label: 'Native macOS App (.dmg)',
      icon: <Laptop className="w-6 h-6 text-emerald-200" />,
      badge: 'macOS',
      onClick: () => {
        playClickSound();
        onOpenMacApp?.();
      },
    },
    {
      id: 'trash',
      label: `Trash (${trashCount} items)`,
      icon: <Trash2 className="w-6 h-6 text-pink-200/80" />,
      badge: trashCount > 0 ? trashCount : undefined,
      onClick: () => {
        playClickSound();
        onOpenTrash();
      },
    },
  ];

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 select-none">
      <div className="flex items-end gap-2.5 px-4 py-2.5 rounded-2xl bg-pink-950/40 backdrop-blur-2xl border border-pink-300/30 shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
        {items.map((item, idx) => {
          const isHovered = hoveredIndex === idx;
          const isNeighbor = hoveredIndex !== null && Math.abs(hoveredIndex - idx) === 1;

          // Scale factor simulation of macOS dock
          const scaleClass = isHovered
            ? 'scale-125 -translate-y-2'
            : isNeighbor
            ? 'scale-110 -translate-y-1'
            : 'scale-100 translate-y-0';

          return (
            <div key={item.id} className="relative flex flex-col items-center group">
              {/* Tooltip */}
              <div
                className={`absolute -top-9 px-2.5 py-1 rounded-md bg-neutral-900/90 border border-pink-300/30 text-white text-[11px] whitespace-nowrap shadow-lg transition-all duration-150 pointer-events-none ${
                  isHovered ? 'opacity-100 scale-100 -translate-y-1' : 'opacity-0 scale-95 pointer-events-none'
                }`}
              >
                {item.label}
              </div>

              {/* Icon button */}
              <button
                onClick={item.onClick}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`relative w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 bg-gradient-to-b from-pink-500/20 to-pink-900/40 border border-pink-300/30 hover:border-rose-400 shadow-md ${scaleClass} active:scale-95`}
              >
                {item.icon}

                {/* Badge */}
                {item.badge !== undefined && (
                  <span className="absolute -top-1 -right-1 px-1.5 min-w-[18px] h-[18px] rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-md border border-white/40">
                    {item.badge}
                  </span>
                )}
              </button>

              {/* macOS Active Indicator Dot */}
              <div className="h-1 mt-1 flex items-center justify-center">
                {item.isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-300 shadow-[0_0_6px_#f43f5e]" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
