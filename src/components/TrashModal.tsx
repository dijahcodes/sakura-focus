import { X, Trash2, RotateCcw, Sparkles } from 'lucide-react';
import { Task } from '../types.ts';
import { playClickSound } from '../utils/sound.ts';

interface TrashModalProps {
  isOpen: boolean;
  onClose: () => void;
  deletedTasks: Task[];
  onRestoreTask: (task: Task) => void;
  onEmptyTrash: () => void;
}

export default function TrashModal({
  isOpen,
  onClose,
  deletedTasks,
  onRestoreTask,
  onEmptyTrash,
}: TrashModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm select-none"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl bg-pink-950/85 backdrop-blur-2xl border border-pink-300/30 p-6 text-pink-50 shadow-2xl space-y-4"
      >
        <div className="flex items-center justify-between border-b border-pink-300/20 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-pink-900/40 border border-pink-400/30 flex items-center justify-center text-pink-300">
              <Trash2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Trash Bin</h3>
              <p className="text-[11px] text-pink-300/70">{deletedTasks.length} deleted tasks</p>
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

        {deletedTasks.length > 0 ? (
          <>
            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {deletedTasks.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-pink-900/25 border border-pink-300/15"
                >
                  <div className="min-w-0 flex-1 mr-2">
                    <p className="text-xs font-medium text-white truncate">{t.title}</p>
                    <p className="text-[10px] text-pink-300/60">{t.category}</p>
                  </div>
                  <button
                    onClick={() => {
                      playClickSound();
                      onRestoreTask(t);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-pink-800/40 hover:bg-pink-700/50 text-pink-100 text-xs flex items-center gap-1 transition-colors shrink-0"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Restore</span>
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-pink-300/15">
              <span className="text-[11px] text-pink-300/60">Trash will clear upon manual empty</span>
              <button
                onClick={() => {
                  playClickSound();
                  onEmptyTrash();
                }}
                className="px-3 py-1.5 rounded-xl bg-rose-600/30 hover:bg-rose-600/50 text-rose-200 border border-rose-500/30 text-xs font-medium transition-colors"
              >
                Empty Trash Bin
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <Sparkles className="w-8 h-8 text-pink-300/50 mx-auto mb-2" />
            <p className="text-xs text-pink-200/70">Trash is completely empty</p>
          </div>
        )}
      </div>
    </div>
  );
}
