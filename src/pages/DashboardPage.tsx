import { useMemo } from 'react';
import { format } from 'date-fns';
import { Plus, Zap } from 'lucide-react';
import { useAppStore } from '../store';
import { ProgressCard } from '../components/dashboard/ProgressCard';
import { HabitChecklist } from '../components/habits/HabitChecklist';
import { Heatmap } from '../components/heatmap/Heatmap';
import { EmptyState } from '../components/common/EmptyState';
import { HABIT_ICONS } from '../types';

function getIconEmoji(iconId: string): string {
  return HABIT_ICONS.find(i => i.id === iconId)?.emoji || '📌';
}

export function DashboardPage() {
  const {
    getActiveHabits, completions, setAddHabitModalOpen, integrations,
    externalActivity, navigateTo, toggleCompletion
  } = useAppStore();

  const habits = getActiveHabits();
  const today = format(new Date(), 'yyyy-MM-dd');


  // Build overall completions map: date -> count
  const overallByDate = useMemo(() => {
    const map = new Map<string, number>();

    // Count habit completions per day
    for (const c of completions) {
      if (c.completed && habits.some(h => h.id === c.habit_id)) {
        map.set(c.date, (map.get(c.date) || 0) + 1);
      }
    }

    // Add external activity if toggled in
    for (const integration of integrations) {
      if (!integration.include_in_overall_heatmap) continue;
      const providerActivity = externalActivity.filter(a => a.provider === integration.provider);
      for (const activity of providerActivity) {
        map.set(activity.date, (map.get(activity.date) || 0) + activity.count);
      }
    }

    return map;
  }, [completions, habits, integrations, externalActivity]);

  if (habits.length === 0) {
    return (
      <div className="p-6">
        <EmptyState />
      </div>
    );
  }

  const githubIntegration = integrations.find(i => i.provider === 'github');
  const leetcodeIntegration = integrations.find(i => i.provider === 'leetcode');
  const githubActivity = externalActivity.filter(a => a.provider === 'github');
  const leetcodeActivity = externalActivity.filter(a => a.provider === 'leetcode');

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Welcome header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Zap size={20} className="text-indigo-400" fill="currentColor" />
            Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
        </div>
        <button onClick={() => setAddHabitModalOpen(true)} className="btn-primary flex items-center gap-1.5 text-xs py-1.5">
          <Plus size={14} />
          Add Habit
        </button>
      </div>

      {/* Progress + Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2">
          <ProgressCard />
        </div>
        <div className="lg:col-span-3 glass-card p-5">
          <h3 className="text-sm font-semibold text-slate-200 mb-3">Today's Habits</h3>
          <HabitChecklist date={today} />
        </div>
      </div>

      {/* Overall Activity Heatmap */}
      <div>
        <Heatmap
          title="Overall Activity"
          colorMode="overall"
          baseColor="#6366f1"
          isReadOnly={false}
          overallCompletionsByDate={overallByDate}
          onCellClick={() => {
            // For overall heatmap, clicking just shows the day — we don't toggle
          }}
        />
      </div>

      {/* GitHub Heatmap */}
      {githubIntegration ? (
        <Heatmap
          title={`GitHub Contributions — @${githubIntegration.username}`}
          colorMode="github"
          baseColor="#39d353"
          isReadOnly={true}
          externalActivity={githubActivity}
        />
      ) : (
        <div className="glass-card p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-lg">🐙</div>
            <div>
              <p className="text-sm font-semibold text-slate-200">Connect your GitHub</p>
              <p className="text-xs text-slate-500">See your contribution heatmap alongside your habits</p>
            </div>
          </div>
          <button onClick={() => navigateTo('settings')} className="btn-secondary text-xs">Connect →</button>
        </div>
      )}

      {/* LeetCode Heatmap */}
      {leetcodeIntegration ? (
        <Heatmap
          title={`LeetCode Activity — ${leetcodeIntegration.username}`}
          colorMode="leetcode"
          baseColor="#ed8936"
          isReadOnly={true}
          externalActivity={leetcodeActivity}
        />
      ) : (
        <div className="glass-card p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-lg">🧩</div>
            <div>
              <p className="text-sm font-semibold text-slate-200">Connect your LeetCode</p>
              <p className="text-xs text-slate-500">Visualize your daily problem-solving consistency</p>
            </div>
          </div>
          <button onClick={() => navigateTo('settings')} className="btn-secondary text-xs">Connect →</button>
        </div>
      )}

      {/* Individual Habit Heatmaps */}
      <div>
        <h2 className="text-sm font-bold text-slate-300 mb-4 uppercase tracking-wider">Habit Heatmaps</h2>
        <div className="space-y-4">
          {habits.map(habit => {
            const habitCompletions = completions.filter(c => c.habit_id === habit.id);
            return (
              <div
                key={habit.id}
                className="cursor-pointer"
                onClick={() => navigateTo('habit-detail', habit.id)}
              >
                <Heatmap
                  title={`${getIconEmoji(habit.icon)} ${habit.name}`}
                  habitName={habit.name}
                  baseColor={habit.color}
                  colorMode="habit"
                  isReadOnly={false}
                  completions={habitCompletions}
                  onCellClick={(date) => {
                    toggleCompletion(habit.id, date);
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
