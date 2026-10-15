import { Task, PomodoroSettings, PomodoroStats, DesktopSettings } from '../types.ts';

const TASKS_KEY = 'sakurafocus_tasks_v1';
const POMO_SETTINGS_KEY = 'sakurafocus_pomo_settings_v1';
const POMO_STATS_KEY = 'sakurafocus_pomo_stats_v1';
const DESKTOP_SETTINGS_KEY = 'sakurafocus_desktop_settings_v1';

export const DEFAULT_TASKS: Task[] = [
  {
    id: 't-1',
    title: 'Polish macOS pink glass interface & translucency',
    notes: 'Ensure backdrop blur, specular highlight border, and responsive traffic light controls feel authentic.',
    category: 'Design',
    priority: 'high',
    estimatedPomodoros: 3,
    completedPomodoros: 2,
    completed: false,
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    dueDate: new Date().toISOString().split('T')[0],
    subtasks: [
      { id: 'st-1', title: 'Tune frosted glass blur and opacity curve', completed: true },
      { id: 'st-2', title: 'Verify traffic lights hover state', completed: true },
      { id: 'st-3', title: 'Check contrast against wallpapers', completed: false },
    ],
  },
  {
    id: 't-2',
    title: 'Deep focus: Review project deliverables & roadmaps',
    notes: 'Block out uninterrupted 25-minute sprint with pink noise enabled.',
    category: 'Deep Work',
    priority: 'urgent',
    estimatedPomodoros: 4,
    completedPomodoros: 1,
    completed: false,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    dueDate: new Date().toISOString().split('T')[0],
    subtasks: [
      { id: 'st-4', title: 'Collate team milestone feedback', completed: false },
      { id: 'st-5', title: 'Finalize Q4 release schedule', completed: false },
    ],
  },
  {
    id: 't-3',
    title: 'Curate typography & color palette balance',
    notes: 'Verify 60-30-10 palette rules: 60% glass canvas, 30% structural surfaces, 10% rose pink accents.',
    category: 'Design',
    priority: 'normal',
    estimatedPomodoros: 2,
    completedPomodoros: 0,
    completed: false,
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    subtasks: [],
  },
  {
    id: 't-4',
    title: 'Read chapter on flow state & timeboxing habits',
    notes: 'From Deep Work & Pomodoro methodology book.',
    category: 'Learning & Study',
    priority: 'normal',
    estimatedPomodoros: 2,
    completedPomodoros: 1,
    completed: false,
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    subtasks: [],
  },
  {
    id: 't-5',
    title: 'Morning matcha latte & mindful reflection',
    notes: '5 minutes of breathing before opening the laptop.',
    category: 'Personal & Wellness',
    priority: 'low',
    estimatedPomodoros: 1,
    completedPomodoros: 1,
    completed: true,
    completedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    subtasks: [],
  },
];

export const DEFAULT_POMO_SETTINGS: PomodoroSettings = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  autoStartBreaks: true,
  autoStartPomodoros: false,
  soundEnabled: true,
  soundVolume: 0.7,
  ambientSound: 'none',
  dailyFocusGoal: 8,
};

export const DEFAULT_STATS: PomodoroStats = {
  todaySessions: 3,
  todayFocusMinutes: 75,
  streakDays: 5,
  totalCompletedTasks: 12,
  weeklyHistory: [
    { date: 'Mon', focusMinutes: 100, sessions: 4 },
    { date: 'Tue', focusMinutes: 125, sessions: 5 },
    { date: 'Wed', focusMinutes: 75, sessions: 3 },
    { date: 'Thu', focusMinutes: 150, sessions: 6 },
    { date: 'Fri', focusMinutes: 125, sessions: 5 },
    { date: 'Sat', focusMinutes: 50, sessions: 2 },
    { date: 'Sun', focusMinutes: 75, sessions: 3 },
  ],
};

export const DEFAULT_DESKTOP_SETTINGS: DesktopSettings = {
  colorScheme: 'pink',
  wallpaper: 'sakura',
  opacity: 0.82,
  blurStrength: 24,
  theme: 'sakura',
  windowMaximized: false,
  soundVolume: 0.7,
};

export function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(TASKS_KEY);
    if (raw === null) return DEFAULT_TASKS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_TASKS;
  } catch {
    return DEFAULT_TASKS;
  }
}

export function saveTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.error('Failed to save tasks', e);
  }
}

export function loadPomoSettings(): PomodoroSettings {
  try {
    const raw = localStorage.getItem(POMO_SETTINGS_KEY);
    if (!raw) return DEFAULT_POMO_SETTINGS;
    return { ...DEFAULT_POMO_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_POMO_SETTINGS;
  }
}

export function savePomoSettings(settings: PomodoroSettings): void {
  try {
    localStorage.setItem(POMO_SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save pomo settings', e);
  }
}

export function loadStats(): PomodoroStats {
  try {
    const raw = localStorage.getItem(POMO_STATS_KEY);
    if (!raw) return DEFAULT_STATS;
    return { ...DEFAULT_STATS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STATS;
  }
}

export function saveStats(stats: PomodoroStats): void {
  try {
    localStorage.setItem(POMO_STATS_KEY, JSON.stringify(stats));
  } catch (e) {
    console.error('Failed to save stats', e);
  }
}

export function loadDesktopSettings(): DesktopSettings {
  try {
    const raw = localStorage.getItem(DESKTOP_SETTINGS_KEY);
    if (!raw) return DEFAULT_DESKTOP_SETTINGS;
    return { ...DEFAULT_DESKTOP_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_DESKTOP_SETTINGS;
  }
}

export function saveDesktopSettings(settings: DesktopSettings): void {
  try {
    localStorage.setItem(DESKTOP_SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save desktop settings', e);
  }
}
