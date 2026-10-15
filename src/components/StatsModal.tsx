import { X, Flame, Target, CheckCircle2, Clock, Calendar } from 'lucide-react';
import { PomodoroStats } from '../types.ts';
import { playClickSound } from '../utils/sound.ts';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: PomodoroStats;
}

export default function StatsModal({ isOpen, onClose, stats }: StatsModalProps) {
  if (!isOpen) return null;

  const maxMinutes = Math.max(...stats.weeklyHistory.map((d) => d.focusMinutes), 120);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm select-none"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl bg-pink-950/80 backdrop-blur-2xl border border-pink-300/30 p-6 text-pink-50 shadow-2xl space-y-5"
      >
        {/* Header with macOS style close */}
        <div className="flex items-center justify-between border-b border-pink-300/20 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-400/30 flex items-center justify-center text-rose-300">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Focus & Habit Insights</h3>
              <p className="text-[11px] text-pink-300/70">Daily Pomodoro productivity metrics</p>
            </div>
          </div>
          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="p-1 rounded-lg hover:bg-pink-800/40 text-pink-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 3 Key Stats Grid */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="p-3 rounded-xl bg-pink-900/30 border border-pink-300/15 flex flex-col items-center text-center">
            <span className="text-[10px] uppercase font-semibold text-pink-300/70">Streak</span>
            <div className="text-2xl font-bold text-white font-mono mt-0.5 flex items-center gap-1">
              <span>{stats.streakDays}</span>
              <span className="text-sm">🔥</span>
            </div>
            <span className="text-[10px] text-pink-300/60 mt-0.5">consecutive days</span>
          </div>

          <div className="p-3 rounded-xl bg-pink-900/30 border border-pink-300/15 flex flex-col items-center text-center">
            <span className="text-[10px] uppercase font-semibold text-pink-300/70">Today</span>
            <div className="text-2xl font-bold text-white font-mono mt-0.5">
              {stats.todayFocusMinutes}<span className="text-xs font-normal text-pink-300">m</span>
            </div>
            <span className="text-[10px] text-pink-300/60 mt-0.5">{stats.todaySessions} pomodoros</span>
          </div>

          <div className="p-3 rounded-xl bg-pink-900/30 border border-pink-300/15 flex flex-col items-center text-center">
            <span className="text-[10px] uppercase font-semibold text-pink-300/70">Done Tasks</span>
            <div className="text-2xl font-bold text-emerald-300 font-mono mt-0.5">
              {stats.totalCompletedTasks}
            </div>
            <span className="text-[10px] text-pink-300/60 mt-0.5">all-time finished</span>
          </div>
        </div>

        {/* 7-Day Bar Chart */}
        <div className="p-4 rounded-xl bg-pink-900/20 border border-pink-300/15">
          <div className="flex items-center justify-between mb-3 text-xs">
            <span className="font-semibold text-white">Weekly Focus Time</span>
            <span className="text-[11px] text-pink-300/70 font-mono">Total: {stats.weeklyHistory.reduce((a, b) => a + b.focusMinutes, 0)} min</span>
          </div>

          <div className="flex items-end justify-between gap-2 h-28 pt-2">
            {stats.weeklyHistory.map((day) => {
              const heightPercent = Math.max(8, (day.focusMinutes / maxMinutes) * 100);
              const isToday = day.date === 'Wed';

              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                  <span className="text-[10px] font-mono text-pink-300 opacity-0 group-hover:opacity-100 transition-opacity">
                    {day.focusMinutes}m
                  </span>
                  <div className="w-full bg-pink-950/40 rounded-t-md overflow-hidden flex items-end h-20">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full rounded-t transition-all duration-500 ${
                        isToday
                          ? 'bg-gradient-to-t from-rose-500 to-pink-400 shadow-[0_0_10px_rgba(244,63,94,0.5)]'
                          : 'bg-rose-500/40 group-hover:bg-rose-500/70'
                      }`}
                    />
                  </div>
                  <span className={`text-[10px] font-mono ${isToday ? 'text-rose-300 font-bold' : 'text-pink-300/70'}`}>
                    {day.date}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Motivational Footer */}
        <p className="text-center text-xs text-pink-200/70 italic">
          "Focus on one single intention at a time. Soft rhythm brings sustained greatness."
        </p>
      </div>
    </div>
  );
}
