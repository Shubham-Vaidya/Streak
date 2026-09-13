
import { ArrowLeft, Flame, Trophy, Target, CheckCircle2 } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import { useAppStore } from '../store';
import { Heatmap } from '../components/heatmap/Heatmap';
import { HABIT_ICONS } from '../types';
import { format, parseISO, eachMonthOfInterval, startOfYear } from 'date-fns';

function getIconEmoji(iconId: string): string {
  return HABIT_ICONS.find(i => i.id === iconId)?.emoji || '📌';
}

const TOOLTIP_STYLE = {
  background: 'rgba(22, 22, 31, 0.95)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '10px',
  color: '#e2e8f0',
  fontSize: '12px',
};

export function HabitDetailPage() {
  const { selectedHabitId, habits, completions, getHabitStats, navigateTo, toggleCompletion } = useAppStore();
  const habit = habits.find(h => h.id === selectedHabitId);

  if (!habit) {
    return (
      <div className="p-6 text-center py-20">
        <p className="text-slate-500">Habit not found</p>
        <button onClick={() => navigateTo('habits')} className="btn-secondary mt-4">Back to Habits</button>
      </div>
    );
  }

  const habitCompletions = completions.filter(c => c.habit_id === habit.id);
  const stats = getHabitStats(habit.id);

  // Monthly trend data
  const yearStart = startOfYear(new Date());
  const months = eachMonthOfInterval({ start: yearStart, end: new Date() });
  const monthlyTrend = months.map(month => {
    const monthStr = format(month, 'yyyy-MM');
    const count = habitCompletions.filter(c => c.completed && c.date.startsWith(monthStr)).length;
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    return {
      month: format(month, 'MMM'),
      count,
      rate: Math.round((count / daysInMonth) * 100),
    };
  });

  // Weekly trend (last 8 weeks)
  const weeklyTrend = Array.from({ length: 8 }, (_, i) => {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - (7 * (7 - i)));
    const weekLabel = format(weekStart, 'MMM d');
    let count = 0;
    for (let d = 0; d < 7; d++) {
      const day = new Date(weekStart);
      day.setDate(day.getDate() + d);
      const dateStr = format(day, 'yyyy-MM-dd');
      if (habitCompletions.some(c => c.date === dateStr && c.completed)) count++;
    }
    return { week: weekLabel, count };
  });

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigateTo('habits')}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-300 transition-colors text-sm"
      >
        <ArrowLeft size={16} />
        Back to Habits
      </button>

      {/* Habit header */}
      <div className="glass-card p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
              style={{
                backgroundColor: `${habit.color}20`,
                border: `2px solid ${habit.color}40`,
                boxShadow: `0 0 24px ${habit.color}20`,
              }}
            >
              {getIconEmoji(habit.icon)}
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{habit.name}</h1>
              {habit.description && (
                <p className="text-sm text-slate-400 mt-0.5">{habit.description}</p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <span className="badge bg-white/5 border border-white/10 text-slate-400 text-[10px]">
                  {habit.category}
                </span>
                <span className="badge bg-white/5 border border-white/10 text-slate-400 text-[10px]">
                  {habit.frequency}
                </span>
                <span className="badge bg-white/5 border border-white/10 text-slate-500 text-[10px]">
                  Since {format(parseISO(habit.created_at), 'MMM d, yyyy')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card p-4 text-center" style={{ borderTop: `2px solid ${habit.color}60` }}>
          <div className="flex items-center justify-center gap-1 mb-1">
            <Flame size={14} className="text-orange-400" />
          </div>
          <p className="text-2xl font-black text-white">{stats.current_streak}</p>
          <p className="text-[10px] text-slate-600 uppercase tracking-wider mt-0.5">Current Streak</p>
        </div>
        <div className="glass-card p-4 text-center" style={{ borderTop: `2px solid ${habit.color}60` }}>
          <div className="flex items-center justify-center gap-1 mb-1">
            <Trophy size={14} className="text-yellow-400" />
          </div>
          <p className="text-2xl font-black text-white">{stats.longest_streak}</p>
          <p className="text-[10px] text-slate-600 uppercase tracking-wider mt-0.5">Longest Streak</p>
        </div>
        <div className="glass-card p-4 text-center" style={{ borderTop: `2px solid ${habit.color}60` }}>
          <div className="flex items-center justify-center gap-1 mb-1">
            <Target size={14} className="text-indigo-400" />
          </div>
          <p className="text-2xl font-black text-white">{stats.completion_rate}%</p>
          <p className="text-[10px] text-slate-600 uppercase tracking-wider mt-0.5">Completion Rate</p>
        </div>
        <div className="glass-card p-4 text-center" style={{ borderTop: `2px solid ${habit.color}60` }}>
          <div className="flex items-center justify-center gap-1 mb-1">
            <CheckCircle2 size={14} className="text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white">{stats.total_completed}</p>
          <p className="text-[10px] text-slate-600 uppercase tracking-wider mt-0.5">Days Completed</p>
        </div>
      </div>

      {/* Full heatmap */}
      <Heatmap
        title={`${getIconEmoji(habit.icon)} ${habit.name} — Heatmap`}
        habitName={habit.name}
        baseColor={habit.color}
        colorMode="habit"
        isReadOnly={false}
        completions={habitCompletions}
        onCellClick={(date) => toggleCompletion(habit.id, date)}
      />

      {/* Statistics panel */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-slate-200 mb-4">Statistics</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { label: 'Current Streak', value: `${stats.current_streak} days`, icon: '🔥' },
            { label: 'Longest Streak', value: `${stats.longest_streak} days`, icon: '🏆' },
            { label: 'Total Completed', value: `${stats.total_completed} days`, icon: '✅' },
            { label: 'Days Missed', value: `${stats.days_missed} days`, icon: '❌' },
            { label: 'Completion Rate', value: `${stats.completion_rate}%`, icon: '📊' },
            { label: 'Total Days', value: `${stats.total_days} days`, icon: '📅' },
            ...(stats.best_month ? [{ label: 'Best Month', value: stats.best_month, icon: '🌟' }] : []),
            ...(stats.best_week ? [{ label: 'Best Week', value: stats.best_week, icon: '🎯' }] : []),
          ].map((item, i) => (
            <div key={i} className="p-3 rounded-xl bg-white/3 border border-white/5">
              <p className="text-xs text-slate-500 mb-1">{item.icon} {item.label}</p>
              <p className="text-sm font-semibold text-white">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-slate-200 mb-4">Monthly Completion</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={monthlyTrend} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="count" name="Days Completed" fill={habit.color} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-slate-200 mb-4">Weekly Trend (8 weeks)</h3>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={weeklyTrend} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="week" tick={{ fill: '#475569', fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 7]} tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Line
                type="monotone" dataKey="count" name="Days Completed"
                stroke={habit.color} strokeWidth={2} dot={{ fill: habit.color, r: 3 }}
                activeDot={{ r: 5, fill: habit.color }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
