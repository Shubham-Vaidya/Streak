import { useState } from 'react';
import { format } from 'date-fns';
import { useAppStore } from '../../store';
import { HABIT_ICONS } from '../../types';
import type { Habit } from '../../types';

interface HabitChecklistProps {
  date?: string; // defaults to today
  showDate?: boolean;
}

function getIconEmoji(iconId: string): string {
  return HABIT_ICONS.find(i => i.id === iconId)?.emoji || '📌';
}

export function HabitChecklist({ date, showDate = false }: HabitChecklistProps) {
  const { getActiveHabits, completions, toggleCompletion } = useAppStore();
  const [animatingIds, setAnimatingIds] = useState<Set<string>>(new Set());

  const targetDate = date || format(new Date(), 'yyyy-MM-dd');
  const habits = getActiveHabits();

  const isCompleted = (habitId: string): boolean => {
    return completions.some(c => c.habit_id === habitId && c.date === targetDate && c.completed);
  };

  const handleToggle = async (habit: Habit) => {
    setAnimatingIds(prev => new Set(prev).add(habit.id));
    await toggleCompletion(habit.id, targetDate);
    setTimeout(() => {
      setAnimatingIds(prev => {
        const next = new Set(prev);
        next.delete(habit.id);
        return next;
      });
    }, 400);
  };

  if (habits.length === 0) return null;

  return (
    <div className="space-y-2">
      {showDate && (
        <p className="text-xs text-slate-500 font-medium mb-3">
          {format(new Date(targetDate + 'T12:00:00'), 'EEEE, MMMM d')}
        </p>
      )}
      {habits.map(habit => {
        const completed = isCompleted(habit.id);
        const animating = animatingIds.has(habit.id);

        return (
          <button
            key={habit.id}
            onClick={() => handleToggle(habit)}
            className={`
              w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
              ${completed
                ? 'bg-white/5 border border-white/5'
                : 'bg-white/3 border border-transparent hover:bg-white/5 hover:border-white/5'
              }
            `}
          >
            {/* Custom checkbox */}
            <div
              className={`
                relative w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0
                transition-all duration-200
                ${completed ? 'border-transparent' : 'border-white/25 hover:border-white/40'}
                ${animating ? 'animate-pulse-once' : ''}
              `}
              style={completed ? {
                backgroundColor: habit.color,
                borderColor: habit.color,
                boxShadow: `0 0 10px ${habit.color}50`,
              } : {}}
            >
              {completed && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 3.5L3.8 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>

            {/* Icon */}
            <span className={`text-base transition-all ${completed ? 'opacity-60' : 'opacity-100'}`}>
              {getIconEmoji(habit.icon)}
            </span>

            {/* Name */}
            <span
              className={`text-sm font-medium flex-1 text-left transition-all ${
                completed ? 'text-slate-500 line-through decoration-slate-600' : 'text-slate-200'
              }`}
            >
              {habit.name}
            </span>

            {/* Category badge */}
            <span className="text-[10px] text-slate-600 font-medium hidden sm:block">
              {habit.category}
            </span>

            {/* Color dot */}
            <div
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ backgroundColor: habit.color, opacity: completed ? 0.4 : 0.8 }}
            />
          </button>
        );
      })}
    </div>
  );
}
