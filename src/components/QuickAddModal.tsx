import { useState } from 'react';
import { X, Plus, Calendar, Flag, Folder, Sparkles, Flame, Zap, CircleDot, Trash2, ListTodo } from 'lucide-react';
import { Priority, NewTaskInput, Subtask } from '../types.ts';
import { playClickSound } from '../utils/sound.ts';
import { PRIORITY_CONFIG } from './TaskItem.tsx';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (newTask: NewTaskInput) => void;
  categories: string[];
}

export default function QuickAddModal({
  isOpen,
  onClose,
  onAddTask,
  categories,
}: QuickAddModalProps) {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState(categories[0] || 'Deep Work');
  const [priority, setPriority] = useState<Priority>('normal');
  const [estimatedPomodoros, setEstimatedPomodoros] = useState(2);
  const [dueDate, setDueDate] = useState('');
  
  // Optional initial subtasks
  const [initialSubtasks, setInitialSubtasks] = useState<string[]>([]);
  const [subtaskInput, setSubtaskInput] = useState('');

  if (!isOpen) return null;

  const handleAddInitialSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subtaskInput.trim()) return;
    setInitialSubtasks([...initialSubtasks, subtaskInput.trim()]);
    setSubtaskInput('');
  };

  const handleRemoveInitialSubtask = (index: number) => {
    setInitialSubtasks(initialSubtasks.filter((_, idx) => idx !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    playClickSound();

    const formattedSubtasks: Subtask[] = initialSubtasks.map((stText, idx) => ({
      id: `st-${Date.now()}-${idx}`,
      title: stText,
      completed: false,
    }));

    onAddTask({
      title: title.trim(),
      notes: notes.trim() || undefined,
      category,
      priority,
      estimatedPomodoros,
      dueDate: dueDate || undefined,
      subtasks: formattedSubtasks,
    });

    setTitle('');
    setNotes('');
    setInitialSubtasks([]);
    setSubtaskInput('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm select-none"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-2xl bg-pink-950/85 backdrop-blur-2xl border border-pink-300/30 p-6 text-pink-50 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between border-b border-pink-300/20 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-400/30 flex items-center justify-center text-rose-300">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Create New Task</h3>
              <p className="text-[11px] text-pink-300/70">Keyboard shortcut: ⌘N</p>
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-pink-200 mb-1">Task Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What would you like to achieve?"
              className="w-full bg-pink-950/60 border border-pink-300/25 rounded-xl px-3.5 py-2 text-sm text-white placeholder-pink-300/40 outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400/30"
              autoFocus
            />
          </div>

          {/* Priority Options Selector */}
          <div>
            <label className="block text-xs font-medium text-pink-200 mb-1.5 flex items-center gap-1">
              <Flag className="w-3.5 h-3.5 text-rose-300" />
              <span>Task Priority</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['urgent', 'high', 'normal', 'low'] as Priority[]).map((p) => {
                const conf = PRIORITY_CONFIG[p];
                const Icon = conf.icon;
                const isSelected = priority === p;

                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      playClickSound();
                      setPriority(p);
                    }}
                    className={`p-2 rounded-xl border text-xs font-medium transition-all flex flex-col items-center gap-1 ${
                      isSelected
                        ? `${conf.border} ${conf.bg} ${conf.color} ring-2 ring-rose-400/50 shadow-sm`
                        : 'border-pink-300/15 bg-pink-950/40 text-pink-300/70 hover:bg-pink-900/30 hover:text-white'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{conf.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-pink-200 mb-1">Notes / Description</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional details or links..."
              className="w-full bg-pink-950/60 border border-pink-300/25 rounded-xl px-3.5 py-2 text-xs text-white placeholder-pink-300/40 outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400/30 resize-none"
            />
          </div>

          {/* Initial Subtasks (Optional) */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-pink-200 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ListTodo className="w-3.5 h-3.5 text-rose-300" />
                <span>Initial Subtasks (Optional)</span>
              </span>
              <span className="text-[10px] text-pink-300/60 font-mono">
                {initialSubtasks.length} added
              </span>
            </label>

            {initialSubtasks.length > 0 && (
              <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                {initialSubtasks.map((st, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-2 p-1.5 px-2.5 rounded-lg bg-pink-900/20 border border-pink-300/15 text-xs text-pink-100"
                  >
                    <span className="truncate">{st}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveInitialSubtask(idx)}
                      className="text-pink-300/60 hover:text-rose-300 p-0.5"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={subtaskInput}
                onChange={(e) => setSubtaskInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (subtaskInput.trim()) {
                      setInitialSubtasks([...initialSubtasks, subtaskInput.trim()]);
                      setSubtaskInput('');
                    }
                  }
                }}
                placeholder="Add a step... (press Enter to append)"
                className="flex-1 bg-pink-950/60 border border-pink-300/20 rounded-xl px-3 py-1.5 text-xs text-pink-100 placeholder-pink-300/40 outline-none focus:border-rose-400"
              />
              <button
                type="button"
                onClick={(e) => handleAddInitialSubtask(e)}
                disabled={!subtaskInput.trim()}
                className="px-3 py-1.5 rounded-xl bg-pink-800/40 hover:bg-pink-700/50 text-pink-200 text-xs font-medium transition-colors disabled:opacity-40"
              >
                + Step
              </button>
            </div>
          </div>

          {/* Grid of Attributes */}
          <div className="grid grid-cols-3 gap-3">
            {/* Category */}
            <div>
              <label className="block text-[11px] font-medium text-pink-300 mb-1 flex items-center gap-1">
                <Folder className="w-3 h-3" />
                <span>List / Category</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-pink-950/60 border border-pink-300/25 rounded-xl px-2.5 py-1.5 text-xs text-pink-100 outline-none"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-neutral-900 text-pink-100">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Estimated Pomodoro Sessions */}
            <div>
              <label className="block text-[11px] font-medium text-pink-300 mb-1">
                Pomodoros
              </label>
              <select
                value={estimatedPomodoros}
                onChange={(e) => setEstimatedPomodoros(Number(e.target.value))}
                className="w-full bg-pink-950/60 border border-pink-300/25 rounded-xl px-2.5 py-1.5 text-xs text-pink-100 outline-none font-mono"
              >
                <option value={1} className="bg-neutral-900">1 🍅 (25m)</option>
                <option value={2} className="bg-neutral-900">2 🍅 (50m)</option>
                <option value={3} className="bg-neutral-900">3 🍅 (75m)</option>
                <option value={4} className="bg-neutral-900">4 🍅 (100m)</option>
                <option value={5} className="bg-neutral-900">5 🍅 (125m)</option>
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-[11px] font-medium text-pink-300 mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>Due Date</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-pink-950/60 border border-pink-300/25 rounded-xl px-2 py-1.5 text-xs text-pink-100 outline-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-pink-300/15">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl bg-pink-900/30 hover:bg-pink-900/50 text-pink-200 text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 text-white font-medium text-xs shadow-md transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
