
import { Zap, Plus } from 'lucide-react';
import { useAppStore } from '../../store';

export function EmptyState() {
  const { setAddHabitModalOpen } = useAppStore();

  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500/20 to-violet-600/20 border border-indigo-500/20 flex items-center justify-center mb-6">
        <Zap size={32} className="text-indigo-400" />
      </div>

      <h2 className="text-2xl font-bold text-white mb-3">Build your consistency.</h2>
      <p className="text-slate-500 text-sm mb-8 max-w-sm leading-relaxed">
        Create your first habit and start filling your heatmap. Track your daily progress and watch your streaks grow.
      </p>

      {/* Empty heatmap preview */}
      <div className="w-full max-w-md mb-8 opacity-30">
        <div className="flex gap-[3px] justify-center flex-wrap">
          {Array.from({ length: 52 * 7 }).map((_, i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-sm bg-white/5"
            />
          ))}
        </div>
      </div>

      <button
        onClick={() => setAddHabitModalOpen(true)}
        className="btn-primary flex items-center gap-2 px-6 py-3 text-sm"
      >
        <Plus size={16} />
        Add Your First Habit
      </button>
    </div>
  );
}
