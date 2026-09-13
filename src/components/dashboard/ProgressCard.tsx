
import { Flame, Trophy, TrendingUp, Target } from 'lucide-react';
import { useAppStore } from '../../store';

export function ProgressCard() {
  const { getTodayProgress, getOverallStats } = useAppStore();
  const progress = getTodayProgress();
  const stats = getOverallStats();

  const pct = progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0;

  // SVG circle values
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-200">Today's Progress</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {progress.completed} of {progress.total} habits completed
          </p>
        </div>
        <div className="text-xs text-slate-500 font-medium">
          {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Circular progress */}
        <div className="relative shrink-0">
          <svg width="100" height="100" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50" cy="50" r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="8"
            />
            {/* Progress circle */}
            <circle
              cx="50" cy="50" r={radius}
              fill="none"
              stroke="url(#progressGradient)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{
                transform: 'rotate(-90deg)',
                transformOrigin: 'center',
                transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            />
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-white">{pct}%</span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex-1 grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/15">
            <div className="flex items-center gap-1.5 mb-1">
              <Flame size={13} className="text-orange-400" />
              <span className="text-xs text-orange-400 font-semibold">Streak</span>
            </div>
            <p className="text-xl font-bold text-white">{stats.current_streak}</p>
            <p className="text-[10px] text-slate-600">days</p>
          </div>
          <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/15">
            <div className="flex items-center gap-1.5 mb-1">
              <Trophy size={13} className="text-yellow-400" />
              <span className="text-xs text-yellow-400 font-semibold">Best</span>
            </div>
            <p className="text-xl font-bold text-white">{stats.longest_streak}</p>
            <p className="text-[10px] text-slate-600">days</p>
          </div>
          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/15">
            <div className="flex items-center gap-1.5 mb-1">
              <Target size={13} className="text-indigo-400" />
              <span className="text-xs text-indigo-400 font-semibold">Avg</span>
            </div>
            <p className="text-xl font-bold text-white">{stats.avg_daily_completion}%</p>
            <p className="text-[10px] text-slate-600">overall</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/15">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp size={13} className="text-emerald-400" />
              <span className="text-xs text-emerald-400 font-semibold">Done</span>
            </div>
            <p className="text-xl font-bold text-white">{stats.total_completed}</p>
            <p className="text-[10px] text-slate-600">all time</p>
          </div>
        </div>
      </div>
    </div>
  );
}
