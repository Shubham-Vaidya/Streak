
import { format } from 'date-fns';
import { CalendarCheck, CheckCircle2 } from 'lucide-react';
import { useAppStore } from '../store';
import { HabitChecklist } from '../components/habits/HabitChecklist';
import { EmptyState } from '../components/common/EmptyState';

export function TodayPage() {
  const { getActiveHabits, getTodayProgress, completions } = useAppStore();
  const habits = getActiveHabits();
  const today = format(new Date(), 'yyyy-MM-dd');
  const progress = getTodayProgress();

  const pct = progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0;

  if (habits.length === 0) {
    return <div className="p-6"><EmptyState /></div>;
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <CalendarCheck size={18} className="text-indigo-400" />
          <h1 className="text-xl font-bold text-white">Today</h1>
        </div>
        <p className="text-slate-400 text-sm">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
      </div>

      {/* Score card */}
      <div className="glass-card p-6 mb-6 text-center gradient-border">
        <div className="text-5xl font-black text-white mb-1" style={{
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          {pct}%
        </div>
        <p className="text-slate-400 text-sm font-medium">Today's Score</p>
        <p className="text-slate-500 text-xs mt-1">
          {progress.completed} of {progress.total} habits completed
        </p>

        {/* Progress bar */}
        <div className="mt-4 h-2 rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${pct}%`,
              background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
              boxShadow: '0 0 8px rgba(99,102,241,0.5)',
            }}
          />
        </div>

        {pct === 100 && (
          <div className="mt-3 flex items-center justify-center gap-2 text-sm text-emerald-400 font-semibold animate-bounce">
            <CheckCircle2 size={16} />
            Perfect day! All habits completed! 🎉
          </div>
        )}
      </div>

      {/* Habit checklist */}
      <div className="glass-card p-5">
        <h2 className="text-sm font-semibold text-slate-200 mb-4">Habits for Today</h2>
        <HabitChecklist date={today} />
      </div>

      {/* Summary table */}
      <div className="glass-card mt-4 overflow-hidden">
        <div className="px-5 py-3 border-b border-white/5">
          <h3 className="text-sm font-semibold text-slate-200">Summary</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left px-5 py-2 text-xs font-medium text-slate-500 uppercase tracking-wider">Habit</th>
              <th className="text-left px-5 py-2 text-xs font-medium text-slate-500 uppercase tracking-wider">Category</th>
              <th className="text-right px-5 py-2 text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody>
            {habits.map((habit, i) => {
              const done = completions.some(c => c.habit_id === habit.id && c.date === today && c.completed);
              return (
                <tr key={habit.id} className={`border-b border-white/5 ${i % 2 === 0 ? 'bg-white/[0.01]' : ''}`}>
                  <td className="px-5 py-3 text-slate-200 font-medium text-sm">{habit.name}</td>
                  <td className="px-5 py-3 text-slate-500 text-xs">{habit.category}</td>
                  <td className="px-5 py-3 text-right">
                    {done ? (
                      <span className="badge bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">✓ Done</span>
                    ) : (
                      <span className="badge bg-white/5 text-slate-500 border border-white/10">Pending</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
