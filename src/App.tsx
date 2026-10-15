import { useState, useEffect, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { 
  Task, 
  NewTaskInput,
  PomodoroMode, 
  PomodoroSettings, 
  PomodoroStats, 
  DesktopSettings 
} from './types.ts';
import { 
  loadTasks, 
  saveTasks, 
  loadPomoSettings, 
  savePomoSettings, 
  loadStats, 
  saveStats, 
  loadDesktopSettings, 
  saveDesktopSettings, 
  DEFAULT_TASKS 
} from './utils/storage.ts';
import { 
  playCompletionChime, 
  playClickSound, 
  ambientEngine 
} from './utils/sound.ts';

import MacMenuBar from './components/MacMenuBar.tsx';
import MacDock from './components/MacDock.tsx';
import MacWindow from './components/MacWindow.tsx';
import StatsModal from './components/StatsModal.tsx';
import ControlCenterModal from './components/ControlCenterModal.tsx';
import TrashModal from './components/TrashModal.tsx';
import QuickAddModal from './components/QuickAddModal.tsx';
import { MacAppModal } from './components/MacAppModal.tsx';
import SakuraPetalsCanvas, { triggerSakuraRain } from './components/SakuraPetalsCanvas.tsx';
import { getColorSchemeConfig } from './utils/theme.ts';

// Wallpapers generated for the app
import wallpaperSakura from './assets/images/wallpaper_sakura_pink_1790194354209.jpg';
import wallpaperSilk from './assets/images/wallpaper_rose_silk_1790194361992.jpg';

export default function App() {
  // Persistence state
  const [tasks, setTasks] = useState<Task[]>(loadTasks);
  const [deletedTasks, setDeletedTasks] = useState<Task[]>([]);
  const [pomoSettings, setPomoSettings] = useState<PomodoroSettings>(loadPomoSettings);
  const [stats, setStats] = useState<PomodoroStats>(loadStats);
  const [desktopSettings, setDesktopSettings] = useState<DesktopSettings>(loadDesktopSettings);

  // Active view: 'split' | 'tasks' | 'pomodoro'
  const [activeView, setActiveView] = useState<'split' | 'tasks' | 'pomodoro'>('split');
  const [isWindowMinimized, setIsWindowMinimized] = useState(false);
  const [isWindowClosed, setIsWindowClosed] = useState(false);

  // Modals
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isControlCenterOpen, setIsControlCenterOpen] = useState(false);
  const [isTrashOpen, setIsTrashOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isMacAppModalOpen, setIsMacAppModalOpen] = useState(false);

  // Pomodoro clock timer state
  const [pomoMode, setPomoMode] = useState<PomodoroMode>('focus');
  const [pomoTimeRemaining, setPomoTimeRemaining] = useState(pomoSettings.focusDuration * 60);
  const [pomoIsRunning, setPomoIsRunning] = useState(false);
  const [activePomoTaskId, setActivePomoTaskId] = useState<string | undefined>(undefined);

  // Ambient sound
  const [ambientSound, setAmbientSound] = useState<'none' | 'pinkNoise' | 'rain' | 'lofiChords'>(
    pomoSettings.ambientSound
  );

  // Sync tasks to storage & macOS Dock badge if in Electron
  useEffect(() => {
    saveTasks(tasks);
    const pendingCount = tasks.filter((t) => !t.completed).length;
    const electronAPI = (window as unknown as { electronAPI?: { setDockBadge?: (b: string) => void } })?.electronAPI;
    if (electronAPI?.setDockBadge) {
      electronAPI.setDockBadge(pendingCount > 0 ? String(pendingCount) : '');
    }
  }, [tasks]);

  // Handle native Electron system menu shortcuts
  useEffect(() => {
    const electronAPI = (window as unknown as { electronAPI?: { onMenuTrigger?: (cb: (action: string) => void) => void } })?.electronAPI;
    if (electronAPI?.onMenuTrigger) {
      electronAPI.onMenuTrigger((action: string) => {
        if (action === 'preferences') setIsControlCenterOpen(true);
        else if (action === 'new-task') setIsQuickAddOpen(true);
        else if (action === 'export') setIsMacAppModalOpen(true);
        else if (action === 'toggle-timer') setPomoIsRunning((r) => !r);
        else if (action === 'mode-focus') {
          setPomoMode('focus');
          setPomoTimeRemaining(pomoSettings.focusDuration * 60);
        } else if (action === 'mode-short-break') {
          setPomoMode('shortBreak');
          setPomoTimeRemaining(pomoSettings.shortBreakDuration * 60);
        }
      });
    }
  }, [pomoSettings]);

  // Sync pomoSettings to storage
  useEffect(() => {
    savePomoSettings(pomoSettings);
    ambientEngine.setVolume(pomoSettings.soundVolume);
  }, [pomoSettings]);

  // Sync stats to storage
  useEffect(() => {
    saveStats(stats);
  }, [stats]);

  // Sync desktopSettings to storage
  useEffect(() => {
    saveDesktopSettings(desktopSettings);
  }, [desktopSettings]);

  // Handle ambient sound changes
  const handleSelectAmbient = useCallback(
    (sound: 'none' | 'pinkNoise' | 'rain' | 'lofiChords') => {
      setAmbientSound(sound);
      setPomoSettings((prev) => ({ ...prev, ambientSound: sound }));
      ambientEngine.play(sound);
    },
    []
  );

  // Find active task object
  const activePomoTask = useMemo(() => {
    return tasks.find((t) => t.id === activePomoTaskId);
  }, [tasks, activePomoTaskId]);

  // Handle ticking Pomodoro clock
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (pomoIsRunning) {
      interval = setInterval(() => {
        setPomoTimeRemaining((prev) => {
          if (prev <= 1) {
            // Timer expired!
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [pomoIsRunning, pomoMode, pomoSettings, activePomoTaskId]);

  // Handle timer completion
  const handleTimerComplete = () => {
    setPomoIsRunning(false);
    playCompletionChime(pomoSettings.soundVolume);
    triggerSakuraRain(45);

    const electronAPI = (window as unknown as { electronAPI?: { showNotification?: (p: { title: string; body: string }) => void } })?.electronAPI;
    if (electronAPI?.showNotification) {
      electronAPI.showNotification({
        title: pomoMode === 'focus' ? 'Focus Session Complete! 🌸' : 'Break Finished! ⏱️',
        body: pomoMode === 'focus' ? 'Great work! Take a refreshing break.' : 'Ready to start your next session?',
      });
    }

    if (pomoMode === 'focus') {
      // Completed focus session
      const durationMin = pomoSettings.focusDuration;
      setStats((prev) => ({
        ...prev,
        todaySessions: prev.todaySessions + 1,
        todayFocusMinutes: prev.todayFocusMinutes + durationMin,
      }));

      // Increment active task pomodoro
      if (activePomoTaskId) {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === activePomoTaskId
              ? { ...t, completedPomodoros: t.completedPomodoros + 1 }
              : t
          )
        );
      }

      // Auto-advance to break
      if (pomoSettings.autoStartBreaks) {
        setPomoMode('shortBreak');
        setPomoTimeRemaining(pomoSettings.shortBreakDuration * 60);
        setPomoIsRunning(true);
      } else {
        setPomoMode('shortBreak');
        setPomoTimeRemaining(pomoSettings.shortBreakDuration * 60);
      }
    } else {
      // Completed break
      if (pomoSettings.autoStartPomodoros) {
        setPomoMode('focus');
        setPomoTimeRemaining(pomoSettings.focusDuration * 60);
        setPomoIsRunning(true);
      } else {
        setPomoMode('focus');
        setPomoTimeRemaining(pomoSettings.focusDuration * 60);
      }
    }
  };

  // Keyboard shortcuts (⌘N, ⌘P, Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setIsQuickAddOpen(true);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setActiveView((v) => (v === 'pomodoro' ? 'split' : 'pomodoro'));
      } else if (e.key === 'Escape') {
        setIsStatsOpen(false);
        setIsControlCenterOpen(false);
        setIsTrashOpen(false);
        setIsQuickAddOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Task Actions
  const handleAddTask = (newTaskData: NewTaskInput) => {
    const newTask: Task = {
      ...newTaskData,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
      completedPomodoros: 0,
      completed: false,
      subtasks: newTaskData.subtasks || [],
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleToggleComplete = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const isNowDone = !t.completed;
          if (isNowDone) {
            setStats((s) => ({ ...s, totalCompletedTasks: s.totalCompletedTasks + 1 }));
            triggerSakuraRain(35);
          }
          return {
            ...t,
            completed: isNowDone,
            completedAt: isNowDone ? new Date().toISOString() : undefined,
          };
        }
        return t;
      })
    );
  };

  const handleDeleteTask = (id: string) => {
    const taskToDelete = tasks.find((t) => t.id === id);
    if (taskToDelete) {
      setDeletedTasks((prev) => [taskToDelete, ...prev]);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      if (activePomoTaskId === id) {
        setActivePomoTaskId(undefined);
      }
    }
  };

  const handleRestoreTask = (taskToRestore: Task) => {
    setDeletedTasks((prev) => prev.filter((t) => t.id !== taskToRestore.id));
    setTasks((prev) => [taskToRestore, ...prev]);
  };

  const handleEmptyTrash = () => {
    setDeletedTasks([]);
  };

  const handleStartPomodoroOnTask = (task: Task) => {
    setActivePomoTaskId(task.id);
    if (activeView === 'tasks') {
      setActiveView('split');
    }
    // Switch to focus mode if currently on break
    if (pomoMode !== 'focus') {
      setPomoMode('focus');
      setPomoTimeRemaining(pomoSettings.focusDuration * 60);
    }
    setPomoIsRunning(true);
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
  };

  const handleCompleteActiveTask = (taskId: string) => {
    handleToggleComplete(taskId);
    setActivePomoTaskId(undefined);
  };

  const handleIncrementPomodoro = (taskId?: string) => {
    setStats((prev) => ({
      ...prev,
      todaySessions: prev.todaySessions + 1,
      todayFocusMinutes: prev.todayFocusMinutes + pomoSettings.focusDuration,
    }));
    if (taskId) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId ? { ...t, completedPomodoros: t.completedPomodoros + 1 } : t
        )
      );
    }
  };

  const handleClearCompleted = () => {
    playClickSound();
    const completedList = tasks.filter((t) => t.completed);
    setDeletedTasks((prev) => [...completedList, ...prev]);
    setTasks((prev) => prev.filter((t) => !t.completed));
  };

  const handleResetSampleTasks = () => {
    playClickSound();
    setTasks(DEFAULT_TASKS);
  };

  // Background style renderer
  const renderBackground = () => {
    const currentTheme = getColorSchemeConfig(desktopSettings.colorScheme);
    const bgData = currentTheme.getDesktopBackground(desktopSettings.wallpaper);

    return (
      <div
        className="fixed inset-0 transition-all duration-700 pointer-events-none"
        style={bgData.style}
      />
    );
  };

  const categories = [
    'Deep Work',
    'Design',
    'Learning & Study',
    'Personal & Wellness',
  ];

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none bg-neutral-950 font-sans">
      {/* Dynamic Desktop Wallpaper Background */}
      {renderBackground()}

      {/* Subtle floating particles / ambient haze overlay */}
      <div className="fixed inset-0 pointer-events-none bg-radial from-transparent via-black/10 to-black/35" />

      {/* macOS Top Menu Bar */}
      <MacMenuBar
        onOpenControlCenter={() => setIsControlCenterOpen(true)}
        onOpenNewTask={() => setIsQuickAddOpen(true)}
        onTogglePomodoro={() =>
          setActiveView((v) => (v === 'pomodoro' ? 'split' : 'pomodoro'))
        }
        onClearCompleted={handleClearCompleted}
        onResetTasks={handleResetSampleTasks}
        pomoTimeRemaining={pomoTimeRemaining}
        pomoIsRunning={pomoIsRunning}
        pomoMode={pomoMode}
        activeTaskTitle={activePomoTask?.title}
        ambientSound={ambientSound}
        onSelectAmbient={handleSelectAmbient}
        opacity={desktopSettings.opacity}
        onSetOpacity={(op) => setDesktopSettings((s) => ({ ...s, opacity: op }))}
        onShowerSakura={() => triggerSakuraRain(40)}
        colorScheme={desktopSettings.colorScheme}
        onSelectColorScheme={(scheme) => setDesktopSettings((s) => ({ ...s, colorScheme: scheme }))}
        onOpenMacAppModal={() => setIsMacAppModalOpen(true)}
      />

      {/* Main Mac App Window */}
      {!isWindowClosed && (
        <MacWindow
          tasks={tasks}
          onAddTask={handleAddTask}
          onToggleComplete={handleToggleComplete}
          onDeleteTask={handleDeleteTask}
          onStartPomodoro={handleStartPomodoroOnTask}
          onUpdateTask={handleUpdateTask}
          activePomoTaskId={activePomoTaskId}
          activePomoTask={activePomoTask}
          onSelectActiveTask={(id) => setActivePomoTaskId(id)}
          onCompleteActiveTask={handleCompleteActiveTask}
          onIncrementPomodoroCount={handleIncrementPomodoro}
          pomoTimeRemaining={pomoTimeRemaining}
          setPomoTimeRemaining={setPomoTimeRemaining}
          pomoIsRunning={pomoIsRunning}
          setPomoIsRunning={setPomoIsRunning}
          pomoMode={pomoMode}
          setPomoMode={setPomoMode}
          pomoSettings={pomoSettings}
          sessionsCompletedToday={stats.todaySessions}
          totalFocusMinutesToday={stats.todayFocusMinutes}
          activeView={activeView}
          onSelectView={setActiveView}
          desktopSettings={desktopSettings}
          onUpdateDesktopSettings={(patch) => setDesktopSettings((s) => ({ ...s, ...patch }))}
          onOpenQuickAdd={() => setIsQuickAddOpen(true)}
          isMinimized={isWindowMinimized}
          onToggleMinimize={() => setIsWindowMinimized(!isWindowMinimized)}
          onCloseWindow={() => setIsWindowClosed(true)}
          ambientSound={ambientSound}
          onSelectAmbient={handleSelectAmbient}
          onOpenSettings={() => setIsControlCenterOpen(true)}
        />
      )}

      {/* macOS Floating Dock at Bottom */}
      <MacDock
        activeView={activeView}
        onSelectView={(v) => {
          setIsWindowClosed(false);
          setIsWindowMinimized(false);
          setActiveView(v);
        }}
        onOpenQuickAdd={() => {
          setIsWindowClosed(false);
          setIsWindowMinimized(false);
          setIsQuickAddOpen(true);
        }}
        onOpenStats={() => setIsStatsOpen(true)}
        onOpenAppearance={() => setIsControlCenterOpen(true)}
        onOpenTrash={() => setIsTrashOpen(true)}
        onOpenMacApp={() => setIsMacAppModalOpen(true)}
        pendingTasksCount={tasks.filter((t) => !t.completed).length}
        pomoIsRunning={pomoIsRunning}
        trashCount={deletedTasks.length}
      />

      {/* Modals */}
      <StatsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        stats={stats}
      />

      <ControlCenterModal
        isOpen={isControlCenterOpen}
        onClose={() => setIsControlCenterOpen(false)}
        desktopSettings={desktopSettings}
        onUpdateDesktopSettings={(patch) => setDesktopSettings((s) => ({ ...s, ...patch }))}
        pomoSettings={pomoSettings}
        onUpdatePomoSettings={(patch) => setPomoSettings((s) => ({ ...s, ...patch }))}
        onOpenMacAppModal={() => setIsMacAppModalOpen(true)}
      />

      <TrashModal
        isOpen={isTrashOpen}
        onClose={() => setIsTrashOpen(false)}
        deletedTasks={deletedTasks}
        onRestoreTask={handleRestoreTask}
        onEmptyTrash={handleEmptyTrash}
      />

      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onAddTask={handleAddTask}
        categories={categories}
      />

      <MacAppModal
        isOpen={isMacAppModalOpen}
        onClose={() => setIsMacAppModalOpen(false)}
        colorScheme={desktopSettings.colorScheme}
      />

      {/* Falling Nature & Sakura Petals Canvas */}
      <SakuraPetalsCanvas colorScheme={desktopSettings.colorScheme} />
    </div>
  );
}
