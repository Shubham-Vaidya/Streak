import { format, parseISO, startOfDay, addDays, differenceInDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import type { HabitCompletion, HabitStats } from '../types';

const today = () => startOfDay(new Date());

export function computeCurrentStreak(completions: HabitCompletion[]): number {
  const completedDates = new Set(
    completions.filter(c => c.completed).map(c => c.date)
  );
  
  let streak = 0;
  let cursor = today();
  
  // If today isn't complete, start checking from yesterday
  if (!completedDates.has(format(cursor, 'yyyy-MM-dd'))) {
    cursor = addDays(cursor, -1);
  }
  
  while (completedDates.has(format(cursor, 'yyyy-MM-dd'))) {
    streak++;
    cursor = addDays(cursor, -1);
  }
  
  return streak;
}

export function computeLongestStreak(completions: HabitCompletion[]): number {
  const completedDates = completions
    .filter(c => c.completed)
    .map(c => c.date)
    .sort();
  
  if (completedDates.length === 0) return 0;
  
  let longest = 1;
  let current = 1;
  
  for (let i = 1; i < completedDates.length; i++) {
    const prev = parseISO(completedDates[i - 1]);
    const curr = parseISO(completedDates[i]);
    const diff = differenceInDays(curr, prev);
    
    if (diff === 1) {
      current++;
      if (current > longest) longest = current;
    } else if (diff > 1) {
      current = 1;
    }
    // diff === 0 means duplicate date, skip
  }
  
  return longest;
}

export function computeCompletionRate(completions: HabitCompletion[], habitCreatedAt: string): number {
  const created = parseISO(habitCreatedAt);
  const now = today();
  const totalDays = Math.max(1, differenceInDays(now, created) + 1);
  const completedDays = completions.filter(c => c.completed).length;
  return Math.round((completedDays / totalDays) * 100);
}

export function computeBestMonth(completions: HabitCompletion[]): string | null {
  const byMonth: Record<string, number> = {};
  for (const c of completions) {
    if (!c.completed) continue;
    const monthKey = c.date.substring(0, 7); // YYYY-MM
    byMonth[monthKey] = (byMonth[monthKey] || 0) + 1;
  }
  
  let bestMonth: string | null = null;
  let bestCount = 0;
  
  for (const [month, count] of Object.entries(byMonth)) {
    if (count > bestCount) {
      bestCount = count;
      bestMonth = month;
    }
  }
  
  if (!bestMonth) return null;
  
  const [year, month] = bestMonth.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  return format(date, 'MMMM yyyy');
}

export function computeBestWeek(completions: HabitCompletion[]): string | null {
  const byWeek: Record<string, number> = {};
  for (const c of completions) {
    if (!c.completed) continue;
    const d = parseISO(c.date);
    const weekStart = format(startOfWeek(d, { weekStartsOn: 1 }), 'yyyy-MM-dd');
    byWeek[weekStart] = (byWeek[weekStart] || 0) + 1;
  }
  
  let bestWeek: string | null = null;
  let bestCount = 0;
  
  for (const [week, count] of Object.entries(byWeek)) {
    if (count > bestCount) {
      bestCount = count;
      bestWeek = week;
    }
  }
  
  if (!bestWeek) return null;
  
  const d = parseISO(bestWeek);
  const end = endOfWeek(d, { weekStartsOn: 1 });
  return `${format(d, 'MMM d')} – ${format(end, 'MMM d, yyyy')}`;
}

export function computeHabitStats(completions: HabitCompletion[], habit: { id: string; created_at: string }): HabitStats {
  const created = parseISO(habit.created_at);
  const now = today();
  const totalDays = Math.max(1, differenceInDays(now, created) + 1);
  const totalCompleted = completions.filter(c => c.completed).length;
  
  return {
    habit_id: habit.id,
    current_streak: computeCurrentStreak(completions),
    longest_streak: computeLongestStreak(completions),
    total_completed: totalCompleted,
    total_days: totalDays,
    completion_rate: Math.round((totalCompleted / totalDays) * 100),
    days_missed: totalDays - totalCompleted,
    best_month: computeBestMonth(completions),
    best_week: computeBestWeek(completions),
  };
}

// For overall streak: "was there at least 1 habit completed today?"
export function computeOverallCurrentStreak(
  allCompletions: HabitCompletion[],
  habitIds: string[]
): number {
  const completionsByDate = new Map<string, Set<string>>();
  for (const c of allCompletions) {
    if (!c.completed || !habitIds.includes(c.habit_id)) continue;
    if (!completionsByDate.has(c.date)) completionsByDate.set(c.date, new Set());
    completionsByDate.get(c.date)!.add(c.habit_id);
  }
  
  let streak = 0;
  let cursor = today();
  
  if (!completionsByDate.has(format(cursor, 'yyyy-MM-dd'))) {
    cursor = addDays(cursor, -1);
  }
  
  while (completionsByDate.has(format(cursor, 'yyyy-MM-dd'))) {
    streak++;
    cursor = addDays(cursor, -1);
  }
  
  return streak;
}

export function computeOverallLongestStreak(
  allCompletions: HabitCompletion[],
  habitIds: string[]
): number {
  const datesWithAny = new Set<string>();
  for (const c of allCompletions) {
    if (c.completed && habitIds.includes(c.habit_id)) {
      datesWithAny.add(c.date);
    }
  }
  
  const sorted = Array.from(datesWithAny).sort();
  if (sorted.length === 0) return 0;
  
  let longest = 1;
  let current = 1;
  
  for (let i = 1; i < sorted.length; i++) {
    const diff = differenceInDays(parseISO(sorted[i]), parseISO(sorted[i - 1]));
    if (diff === 1) {
      current++;
      if (current > longest) longest = current;
    } else if (diff > 1) {
      current = 1;
    }
  }
  
  return longest;
}

export function getWeeklyActivity(
  allCompletions: HabitCompletion[]
): { day: string; count: number }[] {
  const now = today();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: weekStart, end: now });
  
  return days.map(d => {
    const dateStr = format(d, 'yyyy-MM-dd');
    const count = allCompletions.filter(c => c.date === dateStr && c.completed).length;
    return { day: format(d, 'EEE'), count };
  });
}

export function getMonthlyActivity(
  allCompletions: HabitCompletion[]
): { month: string; count: number; rate: number; totalHabits: number }[] {
  const byMonth: Record<string, { count: number; days: Set<string> }> = {};
  
  for (const c of allCompletions) {
    if (!c.completed) continue;
    const monthKey = c.date.substring(0, 7);
    if (!byMonth[monthKey]) byMonth[monthKey] = { count: 0, days: new Set() };
    byMonth[monthKey].count++;
    byMonth[monthKey].days.add(c.date);
  }
  
  const months = Object.keys(byMonth).sort().slice(-6); // last 6 months
  
  return months.map(m => {
    const [year, month] = m.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return {
      month: format(date, 'MMM'),
      count: byMonth[m].count,
      rate: Math.round((byMonth[m].count / (byMonth[m].days.size * 5)) * 100), // approximate
      totalHabits: byMonth[m].days.size,
    };
  });
}
