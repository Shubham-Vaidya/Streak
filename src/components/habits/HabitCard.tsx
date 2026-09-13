import { useState } from 'react';
import { Flame, Trophy, MoreVertical, Pencil, Trash2, Archive } from 'lucide-react';
import { useAppStore } from '../../store';
import { HABIT_ICONS } from '../../types';
import type { Habit } from '../../types';

interface HabitCardProps {
  habit: Habit;
}

function getIconEmoji(iconId: string): string {
  return HABIT_ICONS.find(i => i.id === iconId)?.emoji || '📌';
}

export function HabitCard({ habit }: HabitCardProps) {
  const { navigateTo, setEditHabitId, setDeleteHabitId, archiveHabit, getHabitStats, isCompletedToday, toggleCompletion } = useAppStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const stats = getHabitStats(habit.id);
  const completedToday = isCompletedToday(habit.id);
  const today = new Date().toISOString().slice(0, 10);

  const handleToggleToday = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleCompletion(habit.id, today);
  };

  return (
    <div
      className="glass-card-hover p-4 cursor-pointer relative group"
      onClick={() => navigateTo('habit-detail', habit.id)}
    >
      {/* Color accent line */}
      <div
        className="absolute left-0 top-0 bottom-0 w-0.5 rounded-full opacity-60"
        style={{ backgroundColor: habit.color }}
      />

      {/* Header row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
            style={{
              backgroundColor: `${habit.color}15`,
              border: `1px solid ${habit.color}30`,
            }}
          >
            {getIconEmoji(habit.icon)}
          </div>
          <div>
            <h3 className="font-semibold text-slate-100 text-sm leading-tight">{habit.name}</h3>
            <span className="text-xs text-slate-500">{habit.category} · {habit.frequency}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Today checkbox */}
          <button
            onClick={handleToggleToday}
            className={`
              w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all duration-200 shrink-0
              ${completedToday
                ? 'border-transparent scale-100'
                : 'border-white/20 hover:border-white/40'
              }
            `}
            style={completedToday ? {
              backgroundColor: habit.color,
              borderColor: habit.color,
              boxShadow: `0 0 12px ${habit.color}50`,
            } : {}}
            title={completedToday ? 'Mark incomplete' : 'Mark complete'}
          >
            {completedToday && (
              <svg width="12" height="9" viewBox="0 0 12 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 4L4.5 7.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>

          {/* Menu */}
          <div className="relative">
            <button
              onClick={e => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-300 hover:bg-white/5 transition-all opacity-0 group-hover:opacity-100"
            >
              <MoreVertical size={14} />
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={e => { e.stopPropagation(); setMenuOpen(false); }} />
                <div className="absolute right-0 top-8 z-20 w-36 glass-card py-1 shadow-xl"
                     style={{ background: 'rgba(22,22,31,0.97)' }}>
                  <button
                    onClick={e => { e.stopPropagation(); setMenuOpen(false); setEditHabitId(habit.id); }}
                    className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-slate-300 hover:bg-white/5 transition-all"
                  >
                    <Pencil size={12} /> Edit
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); setMenuOpen(false); archiveHabit(habit.id); }}
                    className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-slate-300 hover:bg-white/5 transition-all"
                  >
                    <Archive size={12} /> Archive
                  </button>
                  <div className="border-t border-white/5 my-1" />
                  <button
                    onClick={e => { e.stopPropagation(); setMenuOpen(false); setDeleteHabitId(habit.id); }}
                    className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 mt-3">
        <div className="text-center p-2 rounded-lg bg-white/3">
          <div className="flex items-center justify-center gap-1 mb-0.5">
            <Flame size={10} className="text-orange-400" />
            <span className="text-xs font-bold text-white">{stats.current_streak}</span>
          </div>
          <span className="text-[9px] text-slate-600 uppercase tracking-wider">Streak</span>
        </div>
        <div className="text-center p-2 rounded-lg bg-white/3">
          <div className="text-xs font-bold text-white mb-0.5">{stats.completion_rate}%</div>
          <span className="text-[9px] text-slate-600 uppercase tracking-wider">Rate</span>
        </div>
        <div className="text-center p-2 rounded-lg bg-white/3">
          <div className="flex items-center justify-center gap-1 mb-0.5">
            <Trophy size={10} className="text-yellow-400" />
            <span className="text-xs font-bold text-white">{stats.longest_streak}</span>
          </div>
          <span className="text-[9px] text-slate-600 uppercase tracking-wider">Best</span>
        </div>
      </div>

      {/* Completion progress bar */}
      <div className="mt-3">
        <div className="flex justify-between text-[9px] text-slate-600 mb-1">
          <span>Completion</span>
          <span>{stats.total_completed} days</span>
        </div>
        <div className="h-1 rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${stats.completion_rate}%`,
              backgroundColor: habit.color,
              boxShadow: `0 0 6px ${habit.color}60`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
