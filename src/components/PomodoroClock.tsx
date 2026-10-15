import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, SkipForward, Plus, Minus, CheckCircle2, Volume2, VolumeX, Sparkles, Flame, Coffee, Target } from 'lucide-react';
import { PomodoroMode, PomodoroSettings, Task } from '../types.ts';
import { playCompletionChime, playClickSound, playTaskPop } from '../utils/sound.ts';
import { triggerSakuraRain } from './SakuraPetalsCanvas.tsx';

interface PomodoroClockProps {
  timeRemaining: number;
  setTimeRemaining: (val: number | ((prev: number) => number)) => void;
  isRunning: boolean;
  setIsRunning: (running: boolean) => void;
  mode: PomodoroMode;
  setMode: (mode: PomodoroMode) => void;
  settings: PomodoroSettings;
  activeTask?: Task;
  allTasks: Task[];
  onSelectActiveTask: (taskId: string | undefined) => void;
  onCompleteActiveTask: (taskId: string) => void;
  onIncrementPomodoroCount: (taskId?: string) => void;
  ambientSound: 'none' | 'pinkNoise' | 'rain' | 'lofiChords';
  onSelectAmbient: (ambient: 'none' | 'pinkNoise' | 'rain' | 'lofiChords') => void;
  sessionsCompletedToday: number;
  totalFocusMinutesToday: number;
}

export default function PomodoroClock({
  timeRemaining,
  setTimeRemaining,
  isRunning,
  setIsRunning,
  mode,
  setMode,
  settings,
  activeTask,
  allTasks,
  onSelectActiveTask,
  onCompleteActiveTask,
  onIncrementPomodoroCount,
  ambientSound,
  onSelectAmbient,
  sessionsCompletedToday,
  totalFocusMinutesToday,
}: PomodoroClockProps) {
  const [cycleCount, setCycleCount] = useState(1); // 1 through 4

  // Mode durations in seconds
  const totalDuration =
    mode === 'focus'
      ? settings.focusDuration * 60
      : mode === 'shortBreak'
      ? settings.shortBreakDuration * 60
      : settings.longBreakDuration * 60;

  // Progress percentage
  const progressPercent = Math.max(0, Math.min(100, ((totalDuration - timeRemaining) / totalDuration) * 100));

  // Circular progress SVG values
  const strokeRadius = 110;
  const circumference = 2 * Math.PI * strokeRadius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  // Minutes & Seconds
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Switch mode handler
  const handleSwitchMode = (newMode: PomodoroMode) => {
    playClickSound();
    setIsRunning(false);
    setMode(newMode);
    const dur =
      newMode === 'focus'
        ? settings.focusDuration * 60
        : newMode === 'shortBreak'
        ? settings.shortBreakDuration * 60
        : settings.longBreakDuration * 60;
    setTimeRemaining(dur);
  };

  // Skip / Next session
  const handleSkipOrNext = () => {
    playClickSound();
    setIsRunning(false);
    if (mode === 'focus') {
      // Finished a focus
      onIncrementPomodoroCount(activeTask?.id);
      playCompletionChime(settings.soundVolume);
      triggerSakuraRain(45);

      if (cycleCount >= 4) {
        setCycleCount(1);
        handleSwitchMode('longBreak');
      } else {
        setCycleCount((c) => c + 1);
        handleSwitchMode('shortBreak');
      }
    } else {
      // Finished break, return to focus
      handleSwitchMode('focus');
    }
  };

  // Reset current session
  const handleReset = () => {
    playClickSound();
    setIsRunning(false);
    const dur =
      mode === 'focus'
        ? settings.focusDuration * 60
        : mode === 'shortBreak'
        ? settings.shortBreakDuration * 60
        : settings.longBreakDuration * 60;
    setTimeRemaining(dur);
  };

  // Adjust time (+5m / -1m)
  const handleAdjustTime = (deltaMinutes: number) => {
    playClickSound();
    setTimeRemaining((prev) => Math.max(10, prev + deltaMinutes * 60));
  };

  return (
    <div className="flex flex-col items-center justify-between p-6 h-full text-pink-50 select-none">
      {/* Top Segmented Mode Selector */}
      <div className="w-full flex items-center justify-between mb-4">
        <div className="inline-flex p-1 rounded-xl bg-pink-950/40 border border-pink-300/20 backdrop-blur-md">
          <button
            onClick={() => handleSwitchMode('focus')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              mode === 'focus'
                ? 'bg-rose-500 text-white shadow-[0_2px_10px_rgba(244,63,94,0.4)]'
                : 'text-pink-200/80 hover:text-white'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Focus ({settings.focusDuration}m)</span>
          </button>
          <button
            onClick={() => handleSwitchMode('shortBreak')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              mode === 'shortBreak'
                ? 'bg-rose-500 text-white shadow-[0_2px_10px_rgba(244,63,94,0.4)]'
                : 'text-pink-200/80 hover:text-white'
            }`}
          >
            <Coffee className="w-3.5 h-3.5" />
            <span>Short Break ({settings.shortBreakDuration}m)</span>
          </button>
          <button
            onClick={() => handleSwitchMode('longBreak')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              mode === 'longBreak'
                ? 'bg-rose-500 text-white shadow-[0_2px_10px_rgba(244,63,94,0.4)]'
                : 'text-pink-200/80 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Long Break ({settings.longBreakDuration}m)</span>
          </button>
        </div>

        {/* Ambient Noise Selector */}
        <div className="flex items-center gap-1.5 bg-pink-950/40 border border-pink-300/20 rounded-xl px-2.5 py-1 text-xs text-pink-200">
          <Volume2 className="w-3.5 h-3.5 text-rose-300" />
          <select
            value={ambientSound}
            onChange={(e) => onSelectAmbient(e.target.value as any)}
            className="bg-transparent text-xs text-pink-100 outline-none cursor-pointer"
          >
            <option value="none" className="bg-neutral-900 text-pink-100">Sound: Mute</option>
            <option value="pinkNoise" className="bg-neutral-900 text-pink-100">Pink Noise</option>
            <option value="rain" className="bg-neutral-900 text-pink-100">Gentle Rain</option>
            <option value="lofiChords" className="bg-neutral-900 text-pink-100">Lofi Harmony</option>
          </select>
        </div>
      </div>

      {/* Main Dial & Progress Ring */}
      <div className="relative my-auto flex items-center justify-center">
        {/* Glow backdrop circle */}
        <div
          className={`absolute w-64 h-64 rounded-full filter blur-2xl transition-opacity duration-700 pointer-events-none ${
            isRunning ? 'bg-rose-500/25 opacity-100' : 'bg-pink-400/10 opacity-40'
          }`}
        />

        {/* SVG Progress Ring */}
        <svg className="w-72 h-72 transform -rotate-90" viewBox="0 0 260 260">
          {/* Subtle track */}
          <circle
            cx="130"
            cy="130"
            r={strokeRadius}
            stroke="rgba(244, 114, 182, 0.15)"
            strokeWidth="10"
            fill="transparent"
          />

          {/* Glowing Animated Gradient Progress */}
          <defs>
            <linearGradient id="pomoRoseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="50%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#fb7185" />
            </linearGradient>
          </defs>
          <circle
            cx="130"
            cy="130"
            r={strokeRadius}
            stroke="url(#pomoRoseGradient)"
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-300 ease-out"
          />
        </svg>

        {/* Center Digital Display */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-pink-300/80 mb-1">
            {mode === 'focus' ? 'Focus Session' : mode === 'shortBreak' ? 'Rest & Recharge' : 'Deep Restoration'}
          </span>
          <div className="text-5xl font-extrabold tracking-tight font-mono tabular-nums text-white drop-shadow-[0_2px_12px_rgba(244,63,94,0.4)]">
            {formattedTime}
          </div>
          
          {/* Cycle dots: 4 beads */}
          <div className="flex items-center gap-2 mt-3">
            {[1, 2, 3, 4].map((idx) => {
              const isDone = idx < cycleCount;
              const isCurrent = idx === cycleCount;
              return (
                <div
                  key={idx}
                  title={`Session ${idx}`}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    isDone
                      ? 'bg-rose-400 shadow-[0_0_8px_#f43f5e]'
                      : isCurrent
                      ? 'bg-white ring-2 ring-rose-400 animate-pulse'
                      : 'bg-pink-300/20'
                  }`}
                />
              );
            })}
          </div>
          <span className="text-[10px] text-pink-300/60 mt-1">
            Round {cycleCount} of 4
          </span>
        </div>
      </div>

      {/* Linked Task Banner */}
      <div className="w-full max-w-md my-4 p-3 rounded-xl bg-pink-950/30 border border-pink-300/20 backdrop-blur-md">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5 text-xs text-pink-200">
            <Target className="w-3.5 h-3.5 text-rose-400" />
            <span className="font-medium">Active Focus Target</span>
          </div>
          {activeTask && (
            <button
              onClick={() => onSelectActiveTask(undefined)}
              className="text-[11px] text-pink-300/70 hover:text-pink-100"
            >
              Detach
            </button>
          )}
        </div>

        {activeTask ? (
          <div className="flex items-center justify-between gap-3 bg-pink-900/40 rounded-lg p-2.5 border border-pink-400/20">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate">{activeTask.title}</p>
              <div className="flex items-center gap-2 text-[11px] text-pink-300/80 mt-0.5">
                <span>{activeTask.category}</span>
                <span>·</span>
                <span>
                  {activeTask.completedPomodoros}/{activeTask.estimatedPomodoros} 🍅
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                playTaskPop();
                triggerSakuraRain(35);
                onCompleteActiveTask(activeTask.id);
              }}
              className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 text-xs font-medium flex items-center gap-1 transition-all shrink-0"
              title="Mark task done"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Complete</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-pink-200/70 italic">No task attached to this session</span>
            <select
              defaultValue=""
              onChange={(e) => {
                if (e.target.value) onSelectActiveTask(e.target.value);
              }}
              className="bg-pink-900/60 text-xs text-pink-100 border border-pink-300/30 rounded-lg px-2.5 py-1 outline-none cursor-pointer hover:bg-pink-900/80"
            >
              <option value="" disabled>Link a To-Do Task...</option>
              {allTasks
                .filter((t) => !t.completed)
                .map((t) => (
                  <option key={t.id} value={t.id} className="bg-neutral-900 text-pink-100">
                    {t.title}
                  </option>
                ))}
            </select>
          </div>
        )}
      </div>

      {/* Main Interactive Controls */}
      <div className="w-full flex items-center justify-center gap-4 mt-1">
        {/* Subtract 1 min */}
        <button
          onClick={() => handleAdjustTime(-1)}
          className="p-2.5 rounded-xl bg-pink-950/40 hover:bg-pink-900/50 border border-pink-300/20 text-pink-200 transition-transform active:scale-95"
          title="Subtract 1 minute"
        >
          <Minus className="w-4 h-4" />
        </button>

        {/* Reset */}
        <button
          onClick={handleReset}
          className="p-3 rounded-xl bg-pink-950/40 hover:bg-pink-900/50 border border-pink-300/20 text-pink-200 transition-transform active:scale-95"
          title="Reset session"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Big Start / Pause Play button */}
        <button
          onClick={() => {
            playClickSound();
            setIsRunning(!isRunning);
          }}
          className={`px-8 py-3.5 rounded-2xl font-semibold text-sm tracking-wide transition-all duration-200 flex items-center gap-2 shadow-lg active:scale-95 ${
            isRunning
              ? 'bg-amber-500/90 hover:bg-amber-500 text-white shadow-amber-500/30 ring-2 ring-amber-400/40'
              : 'bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 text-white shadow-[0_4px_20px_rgba(244,63,94,0.45)] ring-2 ring-white/20'
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-5 h-5 fill-current" />
              <span>Pause Focus</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-current ml-0.5" />
              <span>Start Focus</span>
            </>
          )}
        </button>

        {/* Skip session */}
        <button
          onClick={handleSkipOrNext}
          className="p-3 rounded-xl bg-pink-950/40 hover:bg-pink-900/50 border border-pink-300/20 text-pink-200 transition-transform active:scale-95"
          title="Skip session"
        >
          <SkipForward className="w-4 h-4" />
        </button>

        {/* Add 5 min */}
        <button
          onClick={() => handleAdjustTime(5)}
          className="p-2.5 rounded-xl bg-pink-950/40 hover:bg-pink-900/50 border border-pink-300/20 text-pink-200 transition-transform active:scale-95"
          title="Add 5 minutes"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom Summary Bar */}
      <div className="w-full flex items-center justify-between text-xs text-pink-200/80 pt-4 mt-2 border-t border-pink-300/15">
        <div className="flex items-center gap-1.5">
          <Flame className="w-4 h-4 text-rose-400" />
          <span>Daily Total: <strong className="text-white font-mono">{totalFocusMinutesToday}m</strong> focus</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>Completed today: <strong className="text-white font-mono">{sessionsCompletedToday}</strong> 🍅</span>
        </div>
      </div>
    </div>
  );
}
