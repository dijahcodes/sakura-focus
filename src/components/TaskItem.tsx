import { useState, useRef, useEffect } from 'react';
import { 
  Check, 
  Clock, 
  Trash2, 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  Flag, 
  Target, 
  Edit3, 
  Flame, 
  Zap, 
  CircleDot, 
  CheckCheck, 
  X, 
  Sparkles,
  ListTodo
} from 'lucide-react';
import { Task, Priority, Subtask } from '../types.ts';
import { playTaskPop, playClickSound } from '../utils/sound.ts';
import { triggerSakuraRain } from './SakuraPetalsCanvas.tsx';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onStartPomodoro: (task: Task) => void;
  onUpdateTask: (task: Task) => void;
  isActivePomoTask: boolean;
}

export const PRIORITY_CONFIG: Record<
  Priority, 
  { label: string; icon: typeof Flame; color: string; border: string; bg: string; activeRing: string }
> = {
  urgent: { 
    label: 'Urgent', 
    icon: Flame, 
    color: 'text-rose-300', 
    border: 'border-rose-400/50', 
    bg: 'bg-rose-500/25', 
    activeRing: 'ring-rose-400 bg-rose-500/35 text-white' 
  },
  high: { 
    label: 'High', 
    icon: Zap, 
    color: 'text-pink-300', 
    border: 'border-pink-400/40', 
    bg: 'bg-pink-500/20', 
    activeRing: 'ring-pink-400 bg-pink-500/30 text-white' 
  },
  normal: { 
    label: 'Normal', 
    icon: CircleDot, 
    color: 'text-pink-200/90', 
    border: 'border-pink-300/25', 
    bg: 'bg-pink-900/30', 
    activeRing: 'ring-pink-300 bg-pink-800/40 text-white' 
  },
  low: { 
    label: 'Low', 
    icon: CircleDot, 
    color: 'text-pink-200/60', 
    border: 'border-pink-300/15', 
    bg: 'bg-pink-950/30', 
    activeRing: 'ring-pink-200/50 bg-pink-950/50 text-pink-100' 
  },
};

export default function TaskItem({
  task,
  onToggleComplete,
  onDelete,
  onStartPomodoro,
  onUpdateTask,
  isActivePomoTask,
}: TaskItemProps) {
  const [expanded, setExpanded] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);
  const [editSubtaskText, setEditSubtaskText] = useState('');
  
  // Full task edit mode
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editNotes, setEditNotes] = useState(task.notes || '');

  const newSubtaskInputRef = useRef<HTMLInputElement | null>(null);

  const priorityStyle = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.normal;
  const PriorityIcon = priorityStyle.icon;

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    playTaskPop();
    if (!task.completed) {
      triggerSakuraRain(35);
    }
    onToggleComplete(task.id);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // If user clicked inside an input, button, or link, don't toggle
    const target = e.target as HTMLElement;
    if (
      target.closest('button') ||
      target.closest('input') ||
      target.closest('textarea') ||
      target.closest('select') ||
      isEditingTask
    ) {
      return;
    }
    playClickSound();
    setExpanded((prev) => !prev);
  };

  // Subtask handlers
  const handleToggleSubtask = (subtaskId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    playTaskPop();
    
    const wasAllOthersCompleted = task.subtasks.every((st) =>
      st.id === subtaskId ? true : st.completed
    );

    const updatedSubtasks = task.subtasks.map((st) =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );

    // If this subtask completion finishes all subtasks, shower a burst of sakura!
    const targetSt = task.subtasks.find((s) => s.id === subtaskId);
    if (targetSt && !targetSt.completed && wasAllOthersCompleted) {
      triggerSakuraRain(25);
    }

    onUpdateTask({ ...task, subtasks: updatedSubtasks });
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    playClickSound();
    
    const newSt: Subtask = {
      id: `st-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: newSubtaskTitle.trim(),
      completed: false,
    };
    
    onUpdateTask({ ...task, subtasks: [...task.subtasks, newSt] });
    setNewSubtaskTitle('');
    // Keep focus on input for fast rapid entry
    setTimeout(() => {
      newSubtaskInputRef.current?.focus();
    }, 50);
  };

  const handleDeleteSubtask = (subtaskId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    playClickSound();
    const updated = task.subtasks.filter((s) => s.id !== subtaskId);
    onUpdateTask({ ...task, subtasks: updated });
  };

  const handleStartEditSubtask = (st: Subtask, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSubtaskId(st.id);
    setEditSubtaskText(st.title);
  };

  const handleSaveSubtaskEdit = (subtaskId: string) => {
    if (!editSubtaskText.trim()) {
      handleDeleteSubtask(subtaskId);
      setEditingSubtaskId(null);
      return;
    }
    const updated = task.subtasks.map((s) =>
      s.id === subtaskId ? { ...s, title: editSubtaskText.trim() } : s
    );
    onUpdateTask({ ...task, subtasks: updated });
    setEditingSubtaskId(null);
  };

  const handleClearCompletedSubtasks = (e: React.MouseEvent) => {
    e.stopPropagation();
    playClickSound();
    const remaining = task.subtasks.filter((s) => !s.completed);
    onUpdateTask({ ...task, subtasks: remaining });
  };

  const handleToggleAllSubtasks = (e: React.MouseEvent) => {
    e.stopPropagation();
    playClickSound();
    const allDone = task.subtasks.every((s) => s.completed);
    const updated = task.subtasks.map((s) => ({ ...s, completed: !allDone }));
    if (!allDone) {
      triggerSakuraRain(30);
    }
    onUpdateTask({ ...task, subtasks: updated });
  };

  // Priority switcher handler
  const handleSetPriority = (newPriority: Priority, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    playClickSound();
    onUpdateTask({ ...task, priority: newPriority });
  };

  // Save main task edit
  const handleSaveTaskEdit = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!editTitle.trim()) return;
    onUpdateTask({
      ...task,
      title: editTitle.trim(),
      notes: editNotes.trim() || undefined,
    });
    setIsEditingTask(false);
  };

  const completedSubtasksCount = task.subtasks.filter((s) => s.completed).length;
  const totalSubtasksCount = task.subtasks.length;
  const progressPercent = totalSubtasksCount > 0 ? Math.round((completedSubtasksCount / totalSubtasksCount) * 100) : 0;

  return (
    <div
      onClick={handleCardClick}
      className={`group relative rounded-xl border transition-all duration-200 cursor-pointer ${
        isActivePomoTask
          ? 'bg-rose-950/50 border-rose-400/50 shadow-[0_0_15px_rgba(244,63,94,0.25)] ring-1 ring-rose-400/40'
          : expanded
          ? 'bg-pink-950/45 border-pink-300/35 shadow-md ring-1 ring-pink-300/20'
          : task.completed
          ? 'bg-pink-950/20 border-pink-300/10 opacity-70'
          : 'bg-pink-950/35 hover:bg-pink-900/40 border-pink-300/20 hover:border-pink-300/35 shadow-sm'
      }`}
    >
      <div className="p-3.5 flex items-start gap-3">
        {/* Checkbox button */}
        <button
          onClick={handleCheckboxClick}
          className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center transition-all shrink-0 ${
            task.completed
              ? 'bg-gradient-to-tr from-rose-500 to-pink-400 text-white shadow-sm ring-1 ring-rose-400'
              : 'border border-pink-300/40 hover:border-rose-400 bg-pink-950/40'
          }`}
          aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
        >
          {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {isEditingTask ? (
            <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full bg-pink-950/80 border border-pink-400/40 rounded-lg px-2.5 py-1 text-sm text-white outline-none focus:ring-1 focus:ring-rose-400"
                autoFocus
              />
              <textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Notes or description..."
                rows={2}
                className="w-full bg-pink-950/80 border border-pink-400/30 rounded-lg px-2.5 py-1 text-xs text-pink-100 outline-none resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveTaskEdit}
                  className="px-2.5 py-1 rounded bg-rose-500 hover:bg-rose-400 text-white text-xs font-medium"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditingTask(false)}
                  className="px-2.5 py-1 rounded bg-pink-950/50 hover:bg-pink-900/60 text-pink-200 text-xs"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <h4
                  className={`text-sm font-medium leading-snug break-words transition-all ${
                    task.completed ? 'line-through text-pink-300/50' : 'text-white'
                  }`}
                >
                  {task.title}
                </h4>
                {isActivePomoTask && (
                  <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500 text-white animate-pulse">
                    Active Focus
                  </span>
                )}
              </div>

              {task.notes && (
                <p className="text-xs text-pink-200/70 mt-1 line-clamp-2 leading-relaxed">
                  {task.notes}
                </p>
              )}

              {/* Metadata unboxed items with separators */}
              <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-pink-300/80">
                <span className="font-medium text-pink-200">{task.category}</span>
                <span aria-hidden="true">·</span>

                {/* Priority Badge - Click to toggle expand and see priority options */}
                <span
                  className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-medium transition-colors ${priorityStyle.border} ${priorityStyle.bg} ${priorityStyle.color}`}
                  title="Current task priority"
                >
                  <PriorityIcon className="w-2.5 h-2.5" />
                  <span>{priorityStyle.label}</span>
                </span>

                <span aria-hidden="true">·</span>

                {/* Pomodoro sessions count */}
                <span className="inline-flex items-center gap-1 text-rose-300 font-mono">
                  <span>🍅</span>
                  <span>{task.completedPomodoros}/{task.estimatedPomodoros}</span>
                </span>

                {task.dueDate && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="text-pink-300/70 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{task.dueDate}</span>
                    </span>
                  </>
                )}

                {/* Subtask count indicator */}
                <span aria-hidden="true">·</span>
                <span
                  className={`flex items-center gap-1 text-[11px] font-mono ${
                    totalSubtasksCount > 0 && progressPercent === 100
                      ? 'text-emerald-300'
                      : totalSubtasksCount > 0
                      ? 'text-pink-200'
                      : 'text-pink-300/70'
                  }`}
                >
                  <ListTodo className="w-3 h-3" />
                  <span>
                    {totalSubtasksCount > 0
                      ? `${completedSubtasksCount}/${totalSubtasksCount} subtasks (${progressPercent}%)`
                      : 'Subtasks'}
                  </span>
                </span>
              </div>
            </>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity shrink-0">
          {!task.completed && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                playClickSound();
                onStartPomodoro(task);
              }}
              className={`p-1.5 rounded-lg border text-xs font-medium flex items-center gap-1 transition-all ${
                isActivePomoTask
                  ? 'bg-rose-500 text-white border-rose-400'
                  : 'bg-pink-900/50 hover:bg-rose-600/40 text-rose-200 border-pink-400/25'
              }`}
              title="Focus on this task with Pomodoro clock"
            >
              <Target className="w-3.5 h-3.5 text-rose-300" />
              <span className="text-[11px] hidden sm:inline">Focus</span>
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              playClickSound();
              setIsEditingTask(!isEditingTask);
            }}
            className="p-1.5 rounded-lg hover:bg-pink-800/40 text-pink-300/70 hover:text-pink-100 transition-colors"
            title="Edit task name and notes"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              playClickSound();
              onDelete(task.id);
            }}
            className="p-1.5 rounded-lg hover:bg-rose-950/60 text-pink-300/70 hover:text-rose-300 transition-colors"
            title="Delete task"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {/* Expand / Collapse Chevron */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              playClickSound();
              setExpanded(!expanded);
            }}
            className="p-1.5 rounded-lg hover:bg-pink-800/40 text-pink-300 hover:text-white transition-colors"
            title={expanded ? 'Collapse subtasks & details' : 'Click to view subtasks & priority'}
          >
            {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Subtasks & Priority Management Panel */}
      {expanded && (
        <div
          className="px-4 pb-4 pt-2 border-t border-pink-300/15 bg-pink-950/25 rounded-b-xl space-y-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Priority Options Selector */}
          <div className="p-2.5 rounded-xl bg-pink-950/40 border border-pink-300/15 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-medium text-pink-200">
              <Flag className="w-3.5 h-3.5 text-rose-300" />
              <span>Priority:</span>
            </div>

            {/* Segmented Priority Buttons */}
            <div className="flex items-center gap-1 p-0.5 rounded-lg bg-pink-900/30 border border-pink-300/20 text-xs">
              {(['urgent', 'high', 'normal', 'low'] as Priority[]).map((p) => {
                const conf = PRIORITY_CONFIG[p];
                const Icon = conf.icon;
                const isSelected = task.priority === p;

                return (
                  <button
                    key={p}
                    onClick={() => handleSetPriority(p)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all flex items-center gap-1 ${
                      isSelected
                        ? conf.activeRing
                        : 'text-pink-300/70 hover:text-white hover:bg-pink-800/25'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{conf.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subtasks Section Header & Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <ListTodo className="w-3.5 h-3.5 text-pink-300" />
                  <span>Subtasks List</span>
                </span>
                <span className="text-[11px] text-pink-300/70 font-mono">
                  {completedSubtasksCount} of {totalSubtasksCount} completed
                </span>
              </div>

              {totalSubtasksCount > 0 && (
                <div className="flex items-center gap-2 text-[11px]">
                  <button
                    onClick={handleToggleAllSubtasks}
                    className="text-pink-300 hover:text-white flex items-center gap-1 transition-colors"
                    title={completedSubtasksCount === totalSubtasksCount ? 'Uncheck all' : 'Check all'}
                  >
                    <CheckCheck className="w-3 h-3" />
                    <span>{completedSubtasksCount === totalSubtasksCount ? 'Uncheck all' : 'Check all'}</span>
                  </button>

                  {completedSubtasksCount > 0 && (
                    <>
                      <span className="text-pink-400/40">|</span>
                      <button
                        onClick={handleClearCompletedSubtasks}
                        className="text-pink-300/70 hover:text-rose-300 transition-colors"
                      >
                        Clear done
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Progress Bar */}
            {totalSubtasksCount > 0 && (
              <div className="w-full bg-pink-950/60 rounded-full h-1.5 overflow-hidden border border-pink-300/15">
                <div
                  className="h-full bg-gradient-to-r from-rose-500 to-pink-400 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            )}
          </div>

          {/* Subtasks Items List */}
          <div className="space-y-1.5">
            {task.subtasks.map((st) => (
              <div
                key={st.id}
                className="flex items-center justify-between gap-2.5 p-2 rounded-lg bg-pink-900/25 hover:bg-pink-900/40 border border-pink-300/10 transition-colors group/sub"
              >
                {/* Subtask Checkbox */}
                <button
                  onClick={(e) => handleToggleSubtask(st.id, e)}
                  className={`w-4 h-4 rounded flex items-center justify-center transition-all shrink-0 ${
                    st.completed
                      ? 'bg-rose-500 text-white'
                      : 'border border-pink-300/40 hover:border-rose-400 bg-pink-950/60'
                  }`}
                >
                  {st.completed && <Check className="w-3 h-3 stroke-[3]" />}
                </button>

                {/* Subtask Title (view or inline edit) */}
                <div className="flex-1 min-w-0">
                  {editingSubtaskId === st.id ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={editSubtaskText}
                        onChange={(e) => setEditSubtaskText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveSubtaskEdit(st.id);
                          if (e.key === 'Escape') setEditingSubtaskId(null);
                        }}
                        className="w-full bg-pink-950/80 border border-rose-400/50 rounded px-2 py-0.5 text-xs text-white outline-none"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveSubtaskEdit(st.id)}
                        className="px-2 py-0.5 rounded bg-rose-500 text-white text-[11px]"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <span
                      onDoubleClick={(e) => handleStartEditSubtask(st, e)}
                      onClick={(e) => handleToggleSubtask(st.id, e)}
                      className={`text-xs cursor-pointer select-none block truncate ${
                        st.completed ? 'line-through text-pink-300/50' : 'text-pink-100'
                      }`}
                    >
                      {st.title}
                    </span>
                  )}
                </div>

                {/* Subtask Action Buttons */}
                <div className="flex items-center gap-1 opacity-0 group-hover/sub:opacity-100 transition-opacity">
                  {editingSubtaskId !== st.id && (
                    <button
                      onClick={(e) => handleStartEditSubtask(st, e)}
                      className="p-1 rounded hover:bg-pink-800/40 text-pink-300/70 hover:text-pink-100 transition-colors"
                      title="Rename subtask"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    onClick={(e) => handleDeleteSubtask(st.id, e)}
                    className="p-1 rounded hover:bg-rose-950/60 text-pink-400/70 hover:text-rose-300 transition-colors"
                    title="Delete subtask"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}

            {task.subtasks.length === 0 && (
              <p className="text-xs text-pink-300/60 italic py-1 text-center">
                No subtasks yet. Add steps below to break down this goal!
              </p>
            )}
          </div>

          {/* Add Subtask Input Form */}
          <form onSubmit={handleAddSubtask} className="flex items-center gap-2 pt-1">
            <input
              ref={newSubtaskInputRef}
              type="text"
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              placeholder="Add a new subtask... (press Enter to save)"
              className="flex-1 bg-pink-950/60 border border-pink-300/25 rounded-xl px-3 py-1.5 text-xs text-pink-100 placeholder-pink-300/40 outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400/30 transition-all"
            />
            <button
              type="submit"
              disabled={!newSubtaskTitle.trim()}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 text-white font-medium text-xs flex items-center gap-1 transition-all shadow-sm active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
