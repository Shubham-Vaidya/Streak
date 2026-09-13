import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useAppStore } from '../../store';

interface DeleteConfirmDialogProps {
  habitId: string;
}

export function DeleteConfirmDialog({ habitId }: DeleteConfirmDialogProps) {
  const { setDeleteHabitId, deleteHabit, habits } = useAppStore();
  const [loading, setLoading] = useState(false);
  const habit = habits.find(h => h.id === habitId);

  if (!habit) return null;

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteHabit(habitId);
    } catch (err) {
      console.error('Failed to delete habit:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop">
      <div className="glass-card w-full max-w-sm animate-scale-in p-6"
           style={{ background: 'rgba(22, 22, 31, 0.97)' }}>
        <div className="flex items-start gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle size={18} className="text-red-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Delete Habit</h2>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Are you sure you want to delete <span className="text-white font-semibold">"{habit.name}"</span>?
              This will permanently delete all completion history and cannot be undone.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setDeleteHabitId(null)}
            className="btn-secondary flex-1"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 px-4 py-2 rounded-xl font-medium text-sm text-white bg-red-500/80 hover:bg-red-500 border border-red-500/40 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Deleting…' : 'Delete Habit'}
          </button>
        </div>
      </div>
    </div>
  );
}
