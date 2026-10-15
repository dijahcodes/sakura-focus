export type Priority = 'low' | 'normal' | 'high' | 'urgent';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface NewTaskInput {
  title: string;
  notes?: string;
  category: string;
  priority: Priority;
  estimatedPomodoros: number;
  dueDate?: string;
  subtasks?: Subtask[];
}

export interface Task {
  id: string;
  title: string;
  notes?: string;
  category: string;
  priority: Priority;
  estimatedPomodoros: number;
  completedPomodoros: number;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
  dueDate?: string;
  subtasks: Subtask[];
}

export type PomodoroMode = 'focus' | 'shortBreak' | 'longBreak';

export interface PomodoroSettings {
  focusDuration: number; // in minutes
  shortBreakDuration: number; // in minutes
  longBreakDuration: number; // in minutes
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  soundEnabled: boolean;
  soundVolume: number; // 0 to 1
  ambientSound: 'none' | 'pinkNoise' | 'rain' | 'lofiChords';
  dailyFocusGoal: number; // target completed pomodoros per day (e.g. 8)
}

export interface PomodoroStats {
  todaySessions: number;
  todayFocusMinutes: number;
  streakDays: number;
  totalCompletedTasks: number;
  weeklyHistory: { date: string; focusMinutes: number; sessions: number }[];
}

export type GlassTheme = 'sakura' | 'candy' | 'cyber' | 'frost';

export type ColorScheme = 'pink' | 'yellow' | 'blue' | 'red' | 'orange' | 'green' | 'blackGrey';

export interface DesktopSettings {
  colorScheme: ColorScheme;
  wallpaper: 'dunes' | 'sakura' | 'cyber' | 'silk';
  opacity: number; // 0.5 to 0.95
  blurStrength: number; // in px, e.g. 16 to 32
  theme: GlassTheme;
  windowMaximized: boolean;
  soundVolume: number;
}
