import { useMemo } from 'react';
import { BarChart3, Flame, Trophy, Target, TrendingUp, TrendingDown, Zap } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, AreaChart, Area
} from 'recharts';
import { useAppStore } from '../store';
import { getWeeklyActivity, getMonthlyActivity, computeLongestStreak, computeCurrentStreak } from '../lib/streaks';

const RECHARTS_TOOLTIP_STYLE = {
  background: 'rgba(22, 22, 31, 0.95)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '10px',
  color: '#e2e8f0',
  fontSize: '12px',
};

export function AnalyticsPage() {
  const { getActiveHabits, completions, getHabitStats, getOverallStats, integrations, externalActivity } = useAppStore();
  const habits = getActiveHabits();
  const overallStats = getOverallStats();


  const weeklyData = useMemo(() => getWeeklyActivity(completions.filter(
    c => habits.some(h => h.id === c.habit_id)
  )), [completions, habits]);

  const monthlyData = useMemo(() => getMonthlyActivity(completions.filter(
    c => habits.some(h => h.id === c.habit_id)
  )), [completions, habits]);

  // Per-habit completion rates
  const habitRates = useMemo(() => habits.map(h => {
    const stats = getHabitStats(h.id);
    return { name: h.name, rate: stats.completion_rate, color: h.color, streak: stats.current_streak };
  }).sort((a, b) => b.rate - a.rate), [habits, getHabitStats]);

  // Coding activity
  const githubIntegration = integrations.find(i => i.provider === 'github');
  const leetcodeIntegration = integrations.find(i => i.provider === 'leetcode');
  const githubActivity = externalActivity.filter(a => a.provider === 'github');
  const leetcodeActivity = externalActivity.filter(a => a.provider === 'leetcode');
  const currentYear = new Date().getFullYear().toString();

  const githubThisYear = githubActivity.filter(a => a.date.startsWith(currentYear));
  const leetcodeThisYear = leetcodeActivity.filter(a => a.date.startsWith(currentYear));

  const githubTotal = githubThisYear.reduce((s, a) => s + a.count, 0);
  const leetcodeTotal = leetcodeThisYear.reduce((s, a) => s + a.count, 0);

  const githubCompletions = githubThisYear.map(a => ({
    id: `gh_${a.date}`, habit_id: 'github', date: a.date, completed: true,
    created_at: a.fetched_at, updated_at: a.fetched_at,
  }));
  const leetcodeCompletions = leetcodeThisYear.map(a => ({
    id: `lc_${a.date}`, habit_id: 'leetcode', date: a.date, completed: true,
    created_at: a.fetched_at, updated_at: a.fetched_at,
  }));

  const githubStreak = computeCurrentStreak(githubCompletions);
  const githubLongest = computeLongestStreak(githubCompletions);
  const leetcodeStreak = computeCurrentStreak(leetcodeCompletions);
  const leetcodeLongest = computeLongestStreak(leetcodeCompletions);

  const showCodingSection = githubIntegration || leetcodeIntegration;

  const bestHabit = habits.find(h => h.id === overallStats.best_habit_id);
  const worstHabit = habits.find(h => h.id === overallStats.worst_habit_id);

  if (habits.length === 0) {
    return (
      <div className="p-6 text-center py-20">
        <BarChart3 size={40} className="text-slate-700 mx-auto mb-4" />
        <p className="text-slate-500">Add some habits to see analytics</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <BarChart3 size={20} className="text-indigo-400" />
        <h1 className="text-xl font-bold text-white">Analytics</h1>
      </div>

      {/* Overall stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Total Habits', value: overallStats.total_habits, icon: <Target size={14} />, color: 'text-indigo-400' },
          { label: 'Total Completed', value: overallStats.total_completed.toLocaleString(), icon: <Zap size={14} />, color: 'text-violet-400' },
          { label: 'Current Streak', value: `${overallStats.current_streak}d`, icon: <Flame size={14} />, color: 'text-orange-400' },
          { label: 'Longest Streak', value: `${overallStats.longest_streak}d`, icon: <Trophy size={14} />, color: 'text-yellow-400' },
          { label: 'Avg Completion', value: `${overallStats.avg_daily_completion}%`, icon: <TrendingUp size={14} />, color: 'text-emerald-400' },
          { label: 'Best Habit', value: bestHabit?.name?.split(' ')[0] || '—', icon: <TrendingUp size={14} />, color: 'text-cyan-400' },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-4">
            <div className={`flex items-center gap-1.5 mb-2 ${stat.color}`}>
              {stat.icon}
              <span className="text-[10px] font-semibold uppercase tracking-wider">{stat.label}</span>
            </div>
            <div className="text-xl font-bold text-white truncate">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Activity */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-slate-200 mb-4">This Week's Activity</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weeklyData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={RECHARTS_TOOLTIP_STYLE} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="count" name="Habits Completed" fill="url(#barGradient)" radius={[4, 4, 0, 0]} />
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly trend */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-slate-200 mb-4">Monthly Completions</h3>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={monthlyData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={RECHARTS_TOOLTIP_STYLE} cursor={{ stroke: 'rgba(99,102,241,0.3)' }} />
              <Area type="monotone" dataKey="count" name="Completions" stroke="#6366f1" strokeWidth={2} fill="url(#areaGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Completion by habit */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-slate-200 mb-4">Completion Rate by Habit</h3>
        <ResponsiveContainer width="100%" height={Math.max(120, habitRates.length * 42)}>
          <BarChart data={habitRates} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
            <XAxis type="number" domain={[0, 100]} tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
            <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} width={110} />
            <Tooltip contentStyle={RECHARTS_TOOLTIP_STYLE} formatter={(v) => [`${v}%`, 'Completion']} />
            <Bar dataKey="rate" radius={[0, 4, 4, 0]}>
              {habitRates.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Coding Activity section */}
      {showCodingSection && (
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-slate-200 mb-4">Coding Activity {new Date().getFullYear()}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {githubIntegration && (
              <div className="p-4 rounded-xl bg-white/3 border border-white/5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">🐙</span>
                  <span className="text-sm font-semibold text-slate-200">GitHub</span>
                  <span className="text-xs text-slate-500 ml-1">@{githubIntegration.username}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xl font-bold text-white">{githubTotal.toLocaleString()}</p>
                    <p className="text-[10px] text-slate-600 uppercase tracking-wider">Total contributions</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-white">{githubStreak}</p>
                    <p className="text-[10px] text-slate-600 uppercase tracking-wider">Current streak</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-white">{githubLongest}</p>
                    <p className="text-[10px] text-slate-600 uppercase tracking-wider">Longest streak</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-white">{githubThisYear.length}</p>
                    <p className="text-[10px] text-slate-600 uppercase tracking-wider">Active days</p>
                  </div>
                </div>
              </div>
            )}
            {leetcodeIntegration && (
              <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/10">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">🧩</span>
                  <span className="text-sm font-semibold text-slate-200">LeetCode</span>
                  <span className="text-xs text-slate-500 ml-1">{leetcodeIntegration.username}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xl font-bold text-white">{leetcodeTotal.toLocaleString()}</p>
                    <p className="text-[10px] text-slate-600 uppercase tracking-wider">Problems solved</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-white">{leetcodeStreak}</p>
                    <p className="text-[10px] text-slate-600 uppercase tracking-wider">Current streak</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-white">{leetcodeLongest}</p>
                    <p className="text-[10px] text-slate-600 uppercase tracking-wider">Longest streak</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-white">{leetcodeThisYear.length}</p>
                    <p className="text-[10px] text-slate-600 uppercase tracking-wider">Active days</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Best / Worst */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {bestHabit && (
          <div className="glass-card p-4 border-l-2" style={{ borderLeftColor: bestHabit.color }}>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={14} className="text-emerald-400" />
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Best Habit</span>
            </div>
            <p className="font-bold text-white">{bestHabit.name}</p>
            <p className="text-xs text-slate-500">{getHabitStats(bestHabit.id).completion_rate}% completion</p>
          </div>
        )}
        {worstHabit && worstHabit.id !== bestHabit?.id && (
          <div className="glass-card p-4 border-l-2 border-l-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown size={14} className="text-slate-500" />
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Needs Attention</span>
            </div>
            <p className="font-bold text-white">{worstHabit.name}</p>
            <p className="text-xs text-slate-500">{getHabitStats(worstHabit.id).completion_rate}% completion</p>
          </div>
        )}
      </div>
    </div>
  );
}
