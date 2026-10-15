import { useState } from 'react';
import { 
  CheckSquare, 
  Clock, 
  Columns, 
  Maximize2, 
  Minimize2, 
  Plus, 
  Folder, 
  Sparkles, 
  Flame, 
  ChevronLeft, 
  ChevronRight,
  HelpCircle,
  Hash,
  Palette
} from 'lucide-react';
import { Task, NewTaskInput, DesktopSettings, PomodoroMode, PomodoroSettings } from '../types.ts';
import TaskList from './TaskList.tsx';
import PomodoroClock from './PomodoroClock.tsx';
import { playClickSound } from '../utils/sound.ts';
import { getColorSchemeConfig } from '../utils/theme.ts';

interface MacWindowProps {
  tasks: Task[];
  onAddTask: (newTask: NewTaskInput) => void;
  onToggleComplete: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onStartPomodoro: (task: Task) => void;
  onUpdateTask: (task: Task) => void;
  activePomoTaskId?: string;
  activePomoTask?: Task;
  onSelectActiveTask: (taskId: string | undefined) => void;
  onCompleteActiveTask: (taskId: string) => void;
  onIncrementPomodoroCount: (taskId?: string) => void;

  // Pomodoro timer state
  pomoTimeRemaining: number;
  setPomoTimeRemaining: (val: number | ((prev: number) => number)) => void;
  pomoIsRunning: boolean;
  setPomoIsRunning: (running: boolean) => void;
  pomoMode: PomodoroMode;
  setPomoMode: (mode: PomodoroMode) => void;
  pomoSettings: PomodoroSettings;
  sessionsCompletedToday: number;
  totalFocusMinutesToday: number;

  // View state
  activeView: 'split' | 'tasks' | 'pomodoro';
  onSelectView: (view: 'split' | 'tasks' | 'pomodoro') => void;
  desktopSettings: DesktopSettings;
  onUpdateDesktopSettings: (settings: Partial<DesktopSettings>) => void;
  onOpenQuickAdd: () => void;
  isMinimized: boolean;
  onToggleMinimize: () => void;
  onCloseWindow: () => void;

  // Ambient sound
  ambientSound: 'none' | 'pinkNoise' | 'rain' | 'lofiChords';
  onSelectAmbient: (ambient: 'none' | 'pinkNoise' | 'rain' | 'lofiChords') => void;
  onOpenSettings?: () => void;
}

export default function MacWindow({
  tasks,
  onAddTask,
  onToggleComplete,
  onDeleteTask,
  onStartPomodoro,
  onUpdateTask,
  activePomoTaskId,
  activePomoTask,
  onSelectActiveTask,
  onCompleteActiveTask,
  onIncrementPomodoroCount,
  pomoTimeRemaining,
  setPomoTimeRemaining,
  pomoIsRunning,
  setPomoIsRunning,
  pomoMode,
  setPomoMode,
  pomoSettings,
  sessionsCompletedToday,
  totalFocusMinutesToday,
  activeView,
  onSelectView,
  desktopSettings,
  onUpdateDesktopSettings,
  onOpenQuickAdd,
  isMinimized,
  onToggleMinimize,
  onCloseWindow,
  ambientSound,
  onSelectAmbient,
  onOpenSettings,
}: MacWindowProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showSidebar, setShowSidebar] = useState(true);
  const [trafficHover, setTrafficHover] = useState(false);
  const [newCatInput, setNewCatInput] = useState('');
  const [customCategories, setCustomCategories] = useState<string[]>([
    'Deep Work',
    'Design',
    'Learning & Study',
    'Personal & Wellness',
  ]);

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatInput.trim()) return;
    if (!customCategories.includes(newCatInput.trim())) {
      setCustomCategories([...customCategories, newCatInput.trim()]);
    }
    setSelectedCategory(newCatInput.trim());
    setNewCatInput('');
  };

  const currentTheme = getColorSchemeConfig(desktopSettings.colorScheme);

  // Glass styles computation based on theme, opacity and blur
  const getGlassStyle = () => {
    const opacity = desktopSettings.opacity;
    const blur = desktopSettings.blurStrength;
    const scheme = desktopSettings.colorScheme || 'pink';

    if (scheme !== 'pink') {
      return currentTheme.getGlassStyle(opacity, blur);
    }

    let baseBg = `rgba(50, 15, 30, ${opacity})`;
    let borderColor = 'rgba(251, 113, 133, 0.3)';

    if (desktopSettings.theme === 'candy') {
      baseBg = `rgba(75, 18, 48, ${opacity})`;
      borderColor = 'rgba(244, 114, 182, 0.35)';
    } else if (desktopSettings.theme === 'cyber') {
      baseBg = `rgba(32, 8, 28, ${opacity})`;
      borderColor = 'rgba(236, 72, 153, 0.4)';
    } else if (desktopSettings.theme === 'frost') {
      baseBg = `rgba(45, 18, 32, ${opacity * 0.9})`;
      borderColor = 'rgba(254, 205, 211, 0.28)';
    }

    return {
      backgroundColor: baseBg,
      backdropFilter: `blur(${blur}px)`,
      WebkitBackdropFilter: `blur(${blur}px)`,
      borderColor,
    };
  };

  if (isMinimized) {
    // macOS minimized compact pill floating at bottom right
    return (
      <div
        onClick={onToggleMinimize}
        className="fixed bottom-20 right-6 z-40 cursor-pointer p-3 rounded-2xl bg-pink-950/80 backdrop-blur-xl border border-pink-300/30 text-white shadow-2xl flex items-center gap-3 hover:scale-105 transition-all"
        title="Click to restore SakuraFocus window"
      >
        <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
        <div className="flex flex-col">
          <span className="text-xs font-semibold">SakuraFocus (Minimized)</span>
          <span className="text-[10px] text-pink-300 font-mono">
            {pomoIsRunning ? '🍅 Running' : 'Paused'} · {tasks.filter((t) => !t.completed).length} tasks
          </span>
        </div>
      </div>
    );
  }

  const isMaximized = desktopSettings.windowMaximized;

  return (
    <main
      style={getGlassStyle()}
      className={`fixed transition-all duration-300 z-30 rounded-2xl border shadow-[inset_0_1px_1px_rgba(255,255,255,0.25),0_25px_60px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden text-pink-50 ${
        isMaximized
          ? 'top-9 bottom-20 left-4 right-4'
          : 'top-12 bottom-24 left-6 right-6 md:left-14 md:right-14 max-w-6xl mx-auto h-[calc(100vh-140px)]'
      }`}
    >
      {/* Authentic macOS Window Title Bar */}
      <header
        className="h-10 px-4 border-b border-pink-300/20 bg-pink-950/20 flex items-center justify-between select-none shrink-0"
        onMouseEnter={() => setTrafficHover(true)}
        onMouseLeave={() => setTrafficHover(false)}
      >
        {/* Left: Authentic macOS Traffic Light Buttons */}
        <div className="flex items-center gap-2 w-32">
          {/* Red: Close button */}
          <button
            onClick={() => {
              playClickSound();
              onCloseWindow();
            }}
            className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E] flex items-center justify-center transition-all group"
            title="Close / Hide Window"
          >
            <span className={`text-[8px] text-red-950 font-bold leading-none ${trafficHover ? 'opacity-100' : 'opacity-0'}`}>
              ×
            </span>
          </button>

          {/* Yellow: Minimize button */}
          <button
            onClick={() => {
              playClickSound();
              onToggleMinimize();
            }}
            className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123] flex items-center justify-center transition-all group"
            title="Minimize to Dock"
          >
            <span className={`text-[8px] text-yellow-950 font-bold leading-none ${trafficHover ? 'opacity-100' : 'opacity-0'}`}>
              −
            </span>
          </button>

          {/* Green: Zoom / Fullscreen toggle */}
          <button
            onClick={() => {
              playClickSound();
              onUpdateDesktopSettings({ windowMaximized: !isMaximized });
            }}
            className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29] flex items-center justify-center transition-all group"
            title={isMaximized ? 'Restore Normal Window' : 'Zoom Window'}
          >
            <span className={`text-[7px] text-emerald-950 font-bold leading-none ${trafficHover ? 'opacity-100' : 'opacity-0'}`}>
              +
            </span>
          </button>

          {/* Toggle Sidebar Icon */}
          <button
            onClick={() => {
              playClickSound();
              setShowSidebar(!showSidebar);
            }}
            className="p-1 rounded hover:bg-pink-400/20 text-pink-300/70 hover:text-pink-100 ml-1.5 transition-colors"
            title="Toggle Sidebar"
          >
            {showSidebar ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Center: View Switcher (Split, Tasks, Pomodoro) */}
        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-pink-950/50 border border-pink-300/20">
          <button
            onClick={() => {
              playClickSound();
              onSelectView('split');
            }}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeView === 'split'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'text-pink-200/70 hover:text-white'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Split View</span>
          </button>
          <button
            onClick={() => {
              playClickSound();
              onSelectView('tasks');
            }}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeView === 'tasks'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'text-pink-200/70 hover:text-white'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Tasks Only</span>
          </button>
          <button
            onClick={() => {
              playClickSound();
              onSelectView('pomodoro');
            }}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeView === 'pomodoro'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'text-pink-200/70 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Focus Clock</span>
          </button>
        </div>

        {/* Right: Quick actions */}
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={() => {
              playClickSound();
              if (onOpenSettings) onOpenSettings();
            }}
            className="p-1 px-2 rounded-lg bg-white/10 hover:bg-white/15 border border-white/15 text-xs flex items-center gap-1.5 transition-colors text-neutral-200"
            title="App Color Scheme & Wallpaper Settings"
          >
            <div className={`w-2.5 h-2.5 rounded-full bg-gradient-to-tr ${currentTheme.swatchGradient} ring-1 ring-white/40 shadow-sm`} />
            <span className="text-[11px] hidden sm:inline font-medium">{currentTheme.name}</span>
          </button>

          <button
            onClick={onOpenQuickAdd}
            className={`p-1.5 rounded-lg ${currentTheme.classes.badgeBg} hover:opacity-90 ${currentTheme.classes.badgeText} border ${currentTheme.classes.badgeBorder} text-xs flex items-center gap-1 transition-colors`}
            title="Add Task"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="text-[11px] hidden md:inline font-medium">New</span>
          </button>
        </div>
      </header>

      {/* Main Window Split Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left macOS Finder-Style Sidebar */}
        {showSidebar && (
          <aside className="w-56 border-r border-pink-300/15 bg-pink-950/20 p-3 flex flex-col justify-between shrink-0 overflow-y-auto">
            <div className="space-y-4">
              {/* Profile / Daily Streak Banner */}
              <div className="p-3 rounded-xl bg-pink-900/30 border border-pink-300/15 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-400 to-pink-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                  🌸
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white">Daily Focus</p>
                  <p className="text-[11px] text-pink-300 font-mono flex items-center gap-1">
                    <Flame className="w-3 h-3 text-rose-400" />
                    <span>{sessionsCompletedToday}/4 Sessions</span>
                  </p>
                </div>
              </div>

              {/* Smart Lists */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-pink-300/60 px-2">
                  Views
                </span>
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-rose-500 text-white font-medium shadow-sm'
                      : 'text-pink-200/80 hover:bg-pink-900/30'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span>All Tasks</span>
                  </div>
                  <span className="font-mono text-[11px] opacity-80">
                    {tasks.filter((t) => !t.completed).length}
                  </span>
                </button>
              </div>

              {/* Categories & Lists */}
              <div className="space-y-1">
                <div className="flex items-center justify-between px-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-pink-300/60">
                    Lists
                  </span>
                </div>

                {customCategories.map((cat) => {
                  const count = tasks.filter((t) => t.category === cat && !t.completed).length;
                  const isSelected = selectedCategory === cat;

                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                        isSelected
                          ? 'bg-rose-500 text-white font-medium shadow-sm'
                          : 'text-pink-200/80 hover:bg-pink-900/30'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Folder className="w-3.5 h-3.5 text-pink-300" />
                        <span className="truncate">{cat}</span>
                      </div>
                      {count > 0 && (
                        <span className="font-mono text-[11px] opacity-80 ml-1 shrink-0">
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}

                {/* Add new category inline */}
                <form onSubmit={handleAddCategory} className="pt-2">
                  <div className="flex items-center gap-1 bg-pink-950/50 border border-pink-300/15 rounded-lg px-2 py-1">
                    <Plus className="w-3 h-3 text-pink-300/60" />
                    <input
                      type="text"
                      value={newCatInput}
                      onChange={(e) => setNewCatInput(e.target.value)}
                      placeholder="New List..."
                      className="bg-transparent text-[11px] text-pink-100 placeholder-pink-300/40 outline-none w-full"
                    />
                  </div>
                </form>
              </div>
            </div>

            {/* Bottom Mini Pomodoro Widget (if in tasks only view) */}
            {activeView === 'tasks' && (
              <div className="p-3 rounded-xl bg-pink-900/30 border border-pink-300/15 text-xs space-y-2 mt-4">
                <div className="flex items-center justify-between text-pink-200">
                  <span className="font-semibold flex items-center gap-1">
                    <Clock className="w-3 h-3 text-rose-400" />
                    <span>Pomodoro</span>
                  </span>
                  <span className="font-mono tabular-nums text-white">
                    {Math.floor(pomoTimeRemaining / 60)}:{String(pomoTimeRemaining % 60).padStart(2, '0')}
                  </span>
                </div>
                <button
                  onClick={() => onSelectView('pomodoro')}
                  className="w-full py-1.5 rounded-lg bg-rose-500 hover:bg-rose-400 text-white text-[11px] font-medium text-center transition-colors"
                >
                  Open Clock View
                </button>
              </div>
            )}
          </aside>
        )}

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Tasks Column (Shown in Split or Tasks view) */}
          {(activeView === 'split' || activeView === 'tasks') && (
            <div
              className={`h-full overflow-hidden ${
                activeView === 'split' ? 'w-full lg:w-[58%] border-r border-pink-300/15' : 'w-full'
              }`}
            >
              <TaskList
                tasks={tasks}
                onAddTask={onAddTask}
                onToggleComplete={onToggleComplete}
                onDeleteTask={onDeleteTask}
                onStartPomodoro={onStartPomodoro}
                onUpdateTask={onUpdateTask}
                activePomoTaskId={activePomoTaskId}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                categories={customCategories}
                dailyFocusGoal={pomoSettings.dailyFocusGoal || 8}
                todaySessions={sessionsCompletedToday}
                todayFocusMinutes={totalFocusMinutesToday}
                onOpenSettings={onOpenSettings}
                colorScheme={desktopSettings.colorScheme}
              />
            </div>
          )}

          {/* Pomodoro Clock Column (Shown in Split or Pomodoro view) */}
          {(activeView === 'split' || activeView === 'pomodoro') && (
            <div
              className={`h-full overflow-y-auto ${
                activeView === 'split' ? 'hidden lg:flex lg:w-[42%] flex-col' : 'w-full flex flex-col'
              }`}
            >
              <PomodoroClock
                timeRemaining={pomoTimeRemaining}
                setTimeRemaining={setPomoTimeRemaining}
                isRunning={pomoIsRunning}
                setIsRunning={setPomoIsRunning}
                mode={pomoMode}
                setMode={setPomoMode}
                settings={pomoSettings}
                activeTask={activePomoTask}
                allTasks={tasks}
                onSelectActiveTask={onSelectActiveTask}
                onCompleteActiveTask={onCompleteActiveTask}
                onIncrementPomodoroCount={onIncrementPomodoroCount}
                ambientSound={ambientSound}
                onSelectAmbient={onSelectAmbient}
                sessionsCompletedToday={sessionsCompletedToday}
                totalFocusMinutesToday={totalFocusMinutesToday}
              />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
