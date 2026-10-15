import { useState, useMemo } from 'react';
import { Plus, Search, Filter, ArrowUpDown, CheckCircle2, Calendar, Target, Sparkles, Folder, Flag, Sliders } from 'lucide-react';
import { Task, Priority, NewTaskInput, ColorScheme } from '../types.ts';
import TaskItem from './TaskItem.tsx';
import { playClickSound } from '../utils/sound.ts';
import { getColorSchemeConfig } from '../utils/theme.ts';

interface TaskListProps {
  tasks: Task[];
  onAddTask: (newTask: NewTaskInput) => void;
  onToggleComplete: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onStartPomodoro: (task: Task) => void;
  onUpdateTask: (task: Task) => void;
  activePomoTaskId?: string;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  categories: string[];
  isQuickAddOpen?: boolean;
  dailyFocusGoal?: number;
  todaySessions?: number;
  todayFocusMinutes?: number;
  onOpenSettings?: () => void;
  colorScheme?: ColorScheme;
}

export default function TaskList({
  tasks,
  onAddTask,
  onToggleComplete,
  onDeleteTask,
  onStartPomodoro,
  onUpdateTask,
  activePomoTaskId,
  selectedCategory,
  onSelectCategory,
  categories,
  dailyFocusGoal = 8,
  todaySessions = 0,
  todayFocusMinutes = 0,
  onOpenSettings,
  colorScheme = 'pink',
}: TaskListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('active');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'priority' | 'pomodoros' | 'due'>('priority');

  const themeConfig = getColorSchemeConfig(colorScheme);
  const goalProgressPercent = Math.round((todaySessions / Math.max(1, dailyFocusGoal)) * 100);

  // Quick Add Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(categories[0] || 'Deep Work');
  const [priority, setPriority] = useState<Priority>('normal');
  const [estimatedPomodoros, setEstimatedPomodoros] = useState(2);
  const [dueDate, setDueDate] = useState('');
  const [showFullAddForm, setShowFullAddForm] = useState(false);

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    playClickSound();
    onAddTask({
      title: title.trim(),
      category: category || 'Deep Work',
      priority,
      estimatedPomodoros,
      dueDate: dueDate || undefined,
    });
    setTitle('');
    setShowFullAddForm(false);
  };

  // Filtered & Sorted Tasks
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((t) => {
        if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;
        if (statusFilter === 'active' && t.completed) return false;
        if (statusFilter === 'completed' && !t.completed) return false;
        if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = t.title.toLowerCase().includes(q);
          const matchNotes = t.notes?.toLowerCase().includes(q);
          const matchCategory = t.category.toLowerCase().includes(q);
          if (!matchTitle && !matchNotes && !matchCategory) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'priority') {
          const weight: Record<Priority, number> = { urgent: 4, high: 3, normal: 2, low: 1 };
          return weight[b.priority] - weight[a.priority];
        }
        if (sortBy === 'pomodoros') {
          return b.estimatedPomodoros - a.estimatedPomodoros;
        }
        if (sortBy === 'due') {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return a.dueDate.localeCompare(b.dueDate);
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [tasks, selectedCategory, statusFilter, priorityFilter, searchQuery, sortBy]);

  const activeCount = tasks.filter((t) => !t.completed).length;
  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Daily Focus Goal Circular Progress Ring Banner */}
      <div className={`p-3 mx-4 mt-3 rounded-2xl ${colorScheme === 'pink' ? 'bg-gradient-to-r from-pink-950/70 via-pink-900/40 to-rose-950/60 border-pink-300/20' : `${themeConfig.classes.cardBg} ${themeConfig.classes.cardBorder}`} border shadow-sm flex items-center justify-between gap-3 shrink-0`}>
        <div className="flex items-center gap-3.5 min-w-0">
          {/* Circular Progress Ring */}
          <div className="relative shrink-0 w-13 h-13 flex items-center justify-center">
            <svg className="w-13 h-13 -rotate-90" viewBox="0 0 52 52">
              <defs>
                <linearGradient id={`taskListFocusGoalGrad-${colorScheme}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={themeConfig.ringGrad.from} />
                  <stop offset="100%" stopColor={themeConfig.ringGrad.to} />
                </linearGradient>
              </defs>
              {/* Background Ring */}
              <circle
                cx="26"
                cy="26"
                r="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                className="text-neutral-900/60"
              />
              {/* Foreground Animated Ring */}
              <circle
                cx="26"
                cy="26"
                r="20"
                fill="none"
                stroke={`url(#taskListFocusGoalGrad-${colorScheme})`}
                strokeWidth="4"
                strokeDasharray={125.66}
                strokeDashoffset={125.66 - (Math.min(100, goalProgressPercent) / 100) * 125.66}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
                style={{
                  filter: `drop-shadow(0 0 4px ${themeConfig.ringGrad.glow})`,
                }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="font-mono font-bold text-xs text-white leading-none">
                {todaySessions}
              </span>
              <span className={`text-[9px] ${themeConfig.classes.secondaryText} leading-none mt-0.5 font-mono`}>
                /{dailyFocusGoal}
              </span>
            </div>
          </div>

          {/* Text Description */}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-white tracking-tight flex items-center gap-1.5">
                <Target className={`w-3.5 h-3.5 ${themeConfig.classes.accentText}`} />
                <span>Daily Focus Goal</span>
              </span>
              {todaySessions >= dailyFocusGoal ? (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 border border-emerald-400/40 text-emerald-300">
                  Goal Met! 🎯
                </span>
              ) : (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${themeConfig.classes.badgeBg} border ${themeConfig.classes.badgeBorder} ${themeConfig.classes.badgeText} font-mono`}>
                  {goalProgressPercent}%
                </span>
              )}
            </div>
            <p className="text-[11px] text-neutral-300/80 mt-0.5 truncate">
              {todaySessions >= dailyFocusGoal
                ? `Wonderful! ${todaySessions} pomodoros logged today (${todayFocusMinutes}m focus)`
                : `${todaySessions} of ${dailyFocusGoal} pomodoros done · ${Math.max(0, dailyFocusGoal - todaySessions)} more to target`}
            </p>
          </div>
        </div>

        {onOpenSettings && (
          <button
            onClick={() => {
              playClickSound();
              onOpenSettings();
            }}
            className="shrink-0 px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-[11px] text-neutral-200 hover:text-white transition-all flex items-center gap-1 active:scale-95"
            title="Configure Daily Focus Goal & Themes in Settings"
          >
            <Sliders className={`w-3 h-3 ${themeConfig.classes.accentText}`} />
            <span className="hidden sm:inline">Set Goal</span>
          </button>
        )}
      </div>

      {/* Top Header & Search Bar */}
      <div className="p-4 border-b border-pink-300/15 space-y-3 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
              <span>{selectedCategory === 'all' ? 'All Tasks' : selectedCategory}</span>
              <span className="text-xs font-normal text-pink-300/80 font-mono">
                ({filteredTasks.length})
              </span>
            </h2>
            <p className="text-xs text-pink-200/60 mt-0.5">
              {activeCount} active · {completedCount} completed
            </p>
          </div>

          {/* Segmented Status Toggle */}
          <div className="flex items-center gap-1 p-1 bg-pink-950/40 border border-pink-300/20 rounded-lg text-xs">
            <button
              onClick={() => {
                playClickSound();
                setStatusFilter('active');
              }}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                statusFilter === 'active'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-pink-200/70 hover:text-white'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => {
                playClickSound();
                setStatusFilter('completed');
              }}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                statusFilter === 'completed'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-pink-200/70 hover:text-white'
              }`}
            >
              Done ({completedCount})
            </button>
            <button
              onClick={() => {
                playClickSound();
                setStatusFilter('all');
              }}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                statusFilter === 'all'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-pink-200/70 hover:text-white'
              }`}
            >
              All
            </button>
          </div>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex items-center gap-2">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-pink-300/50" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks, notes or tags..."
              className="w-full bg-pink-950/40 border border-pink-300/20 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-pink-300/40 outline-none focus:border-rose-400/60 transition-colors"
            />
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-1 bg-pink-950/40 border border-pink-300/20 rounded-xl px-2 py-1 text-xs text-pink-200">
            <Flag className="w-3.5 h-3.5 text-rose-300" />
            <select
              value={priorityFilter}
              onChange={(e) => {
                playClickSound();
                setPriorityFilter(e.target.value);
              }}
              className="bg-transparent text-xs text-pink-100 outline-none cursor-pointer"
              title="Filter by priority"
            >
              <option value="all" className="bg-neutral-900 text-pink-100">All Priorities</option>
              <option value="urgent" className="bg-neutral-900 text-rose-300">🔥 Urgent Only</option>
              <option value="high" className="bg-neutral-900 text-pink-300">⚡ High Only</option>
              <option value="normal" className="bg-neutral-900 text-pink-100">● Normal Only</option>
              <option value="low" className="bg-neutral-900 text-pink-200">○ Low Only</option>
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1 bg-pink-950/40 border border-pink-300/20 rounded-xl px-2 py-1 text-xs text-pink-200">
            <ArrowUpDown className="w-3.5 h-3.5 text-rose-300" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-xs text-pink-100 outline-none cursor-pointer"
            >
              <option value="priority" className="bg-neutral-900 text-pink-100">Sort: Priority</option>
              <option value="pomodoros" className="bg-neutral-900 text-pink-100">Sort: Pomodoros</option>
              <option value="due" className="bg-neutral-900 text-pink-100">Sort: Due Date</option>
              <option value="newest" className="bg-neutral-900 text-pink-100">Sort: Newest</option>
            </select>
          </div>
        </div>
      </div>

      {/* Quick Add Task Input Card */}
      <div className="p-4 bg-pink-950/25 border-b border-pink-300/15 shrink-0">
        <form onSubmit={handleQuickAdd} className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onFocus={() => setShowFullAddForm(true)}
              placeholder="Add a new task... (press Enter to save)"
              className="flex-1 bg-pink-950/50 border border-pink-300/25 rounded-xl px-3.5 py-2 text-xs text-white placeholder-pink-300/40 outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400/30 transition-all"
            />
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 text-white font-medium text-xs flex items-center gap-1.5 transition-all shadow-sm active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>

          {/* Extended Quick Add options */}
          {showFullAddForm && (
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-pink-200">
              {/* Category */}
              <div className="flex items-center gap-1 bg-pink-950/60 border border-pink-300/20 rounded-lg px-2 py-1">
                <Folder className="w-3 h-3 text-pink-300" />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="bg-transparent text-[11px] text-pink-100 outline-none cursor-pointer"
                >
                  {categories.map((c) => (
                    <option key={c} value={c} className="bg-neutral-900 text-pink-100">
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div className="flex items-center gap-1 bg-pink-950/60 border border-pink-300/20 rounded-lg px-2 py-1">
                <span className="text-[11px] text-pink-300">Priority:</span>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  className="bg-transparent text-[11px] text-pink-100 outline-none cursor-pointer"
                >
                  <option value="urgent" className="bg-neutral-900 text-rose-300">Urgent</option>
                  <option value="high" className="bg-neutral-900 text-pink-300">High</option>
                  <option value="normal" className="bg-neutral-900 text-pink-100">Normal</option>
                  <option value="low" className="bg-neutral-900 text-pink-200">Low</option>
                </select>
              </div>

              {/* Estimated Pomodoros */}
              <div className="flex items-center gap-1 bg-pink-950/60 border border-pink-300/20 rounded-lg px-2 py-1">
                <span className="text-[11px] text-pink-300">Pomodoros:</span>
                <select
                  value={estimatedPomodoros}
                  onChange={(e) => setEstimatedPomodoros(Number(e.target.value))}
                  className="bg-transparent text-[11px] text-pink-100 outline-none cursor-pointer font-mono"
                >
                  <option value={1} className="bg-neutral-900">1 🍅 (25m)</option>
                  <option value={2} className="bg-neutral-900">2 🍅 (50m)</option>
                  <option value={3} className="bg-neutral-900">3 🍅 (75m)</option>
                  <option value={4} className="bg-neutral-900">4 🍅 (100m)</option>
                  <option value={5} className="bg-neutral-900">5 🍅 (125m)</option>
                </select>
              </div>

              {/* Due Date */}
              <div className="flex items-center gap-1 bg-pink-950/60 border border-pink-300/20 rounded-lg px-2 py-1">
                <Calendar className="w-3 h-3 text-pink-300" />
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="bg-transparent text-[11px] text-pink-100 outline-none cursor-pointer"
                />
              </div>

              <button
                type="button"
                onClick={() => setShowFullAddForm(false)}
                className="text-[11px] text-pink-300/60 hover:text-pink-200 ml-auto"
              >
                Hide options
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Task List Items Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggleComplete={onToggleComplete}
              onDelete={onDeleteTask}
              onStartPomodoro={onStartPomodoro}
              onUpdateTask={onUpdateTask}
              isActivePomoTask={activePomoTaskId === task.id}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-52 text-center p-6 rounded-2xl bg-pink-950/15 border border-dashed border-pink-300/20 my-4">
            <div className="w-12 h-12 rounded-full bg-pink-500/10 border border-pink-300/20 flex items-center justify-center text-pink-300 mb-3">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-white">No tasks here</h3>
            <p className="text-xs text-pink-200/60 mt-1 max-w-xs">
              {searchQuery
                ? `No tasks match "${searchQuery}". Try clearing the search.`
                : statusFilter === 'completed'
                ? 'No completed tasks yet. Finish a task to see it celebrated here!'
                : 'All clear! Add a task above or take a relaxing Pomodoro break.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
