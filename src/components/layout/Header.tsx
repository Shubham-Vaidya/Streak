
import { format } from 'date-fns';
import { Menu, Plus, Flame, TrendingUp } from 'lucide-react';
import { useAppStore } from '../../store';

export function Header() {
  const { setSidebarOpen, sidebarOpen, setAddHabitModalOpen, getOverallStats, getTodayProgress } = useAppStore();
  const stats = getOverallStats();
  const todayProgress = getTodayProgress();
  const today = new Date();

  const completionPct = todayProgress.total > 0
    ? Math.round((todayProgress.completed / todayProgress.total) * 100)
    : 0;

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-surface-100/50 backdrop-blur-sm sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all lg:hidden"
        >
          <Menu size={18} />
        </button>
        <div>
          <p className="text-xs text-slate-500 font-medium">{format(today, 'EEEE, MMMM d')}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Today's progress pill */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
          <TrendingUp size={13} className="text-indigo-400" />
          <span className="text-xs font-semibold text-slate-300">{completionPct}% today</span>
        </div>

        {/* Streak pill */}
        {stats.current_streak > 0 && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/20">
            <Flame size={13} className="text-orange-400" />
            <span className="text-xs font-semibold text-orange-300">{stats.current_streak} day streak</span>
          </div>
        )}

        {/* Add habit button */}
        <button
          onClick={() => setAddHabitModalOpen(true)}
          className="btn-primary flex items-center gap-1.5 py-1.5 text-xs"
        >
          <Plus size={14} />
          <span className="hidden sm:inline">Add Habit</span>
        </button>
      </div>
    </header>
  );
}
