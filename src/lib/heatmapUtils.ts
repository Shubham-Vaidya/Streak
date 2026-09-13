import { format, startOfYear, endOfYear, addDays, isFuture, getDay, getMonth } from 'date-fns';
import type { DayCell, HeatmapData, MonthLabel, WeekData } from '../types';

function intensityFromCount(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count === 0) return 0;
  if (count === 1) return 1;
  if (count === 2) return 2;
  if (count === 3) return 3;
  return 4;
}

export function generateHeatmapData(
  year: number,
  completionsByDate: Map<string, number> // date -> count
): HeatmapData {
  const yearStart = startOfYear(new Date(year, 0, 1));
  const yearEnd = endOfYear(new Date(year, 11, 31));
  const today = new Date();

  // Find the Sunday on or before Jan 1
  let gridStart = yearStart;
  const startDow = getDay(gridStart); // 0=Sun
  if (startDow !== 0) {
    gridStart = addDays(gridStart, -startDow);
  }

  const weeks: WeekData[] = [];
  const months: MonthLabel[] = [];

  let cursor = gridStart;
  let weekIndex = 0;
  let lastMonth = -1;

  while (cursor <= yearEnd || (weeks.length === 0)) {
    const week: DayCell[] = [];

    for (let d = 0; d < 7; d++) {
      const dateStr = format(cursor, 'yyyy-MM-dd');
      const isInYear = cursor >= yearStart && cursor <= yearEnd;
      const future = isFuture(cursor) || format(cursor, 'yyyy-MM-dd') > format(today, 'yyyy-MM-dd');
      const todayCell = format(cursor, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');

      let count = 0;
      if (isInYear && !future) {
        count = completionsByDate.get(dateStr) || 0;
      }

      week.push({
        date: dateStr,
        intensity: isInYear ? intensityFromCount(count) : 0,
        count,
        isFuture: future && isInYear,
        isToday: todayCell,
      });

      // Track month labels — show when we enter a new month
      if (isInYear) {
        const monthNum = getMonth(cursor);
        if (monthNum !== lastMonth && d === 0) {
          months.push({ label: format(cursor, 'MMM'), weekIndex });
          lastMonth = monthNum;
        } else if (monthNum !== lastMonth) {
          // Month starts mid-week, label next week
          months.push({ label: format(cursor, 'MMM'), weekIndex: weekIndex + 1 });
          lastMonth = monthNum;
        }
      }

      cursor = addDays(cursor, 1);
    }

    weeks.push({ days: week });
    weekIndex++;

    if (cursor > yearEnd && cursor > addDays(yearEnd, 7)) break;
    if (weeks.length > 54) break; // safety
  }

  return { year, weeks, months };
}

export function generateOverallHeatmapData(
  year: number,
  completionsByDate: Map<string, number> // date -> total completed habits count
): HeatmapData {
  const yearStart = startOfYear(new Date(year, 0, 1));
  const yearEnd = endOfYear(new Date(year, 11, 31));
  const today = new Date();

  let gridStart = yearStart;
  const startDow = getDay(gridStart);
  if (startDow !== 0) {
    gridStart = addDays(gridStart, -startDow);
  }

  const weeks: WeekData[] = [];
  const months: MonthLabel[] = [];
  let cursor = gridStart;
  let weekIndex = 0;
  let lastMonth = -1;

  while (cursor <= yearEnd) {
    const week: DayCell[] = [];

    for (let d = 0; d < 7; d++) {
      const dateStr = format(cursor, 'yyyy-MM-dd');
      const isInYear = cursor >= yearStart && cursor <= yearEnd;
      const future = format(cursor, 'yyyy-MM-dd') > format(today, 'yyyy-MM-dd');
      const todayCell = format(cursor, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');

      let count = 0;
      if (isInYear && !future) {
        count = completionsByDate.get(dateStr) || 0;
      }

      // 0=empty, 1=1 habit, 2=2, 3=3, 4=4+
      let intensity: 0 | 1 | 2 | 3 | 4 = 0;
      if (count >= 4) intensity = 4;
      else intensity = count as 0 | 1 | 2 | 3 | 4;

      week.push({
        date: dateStr,
        intensity: isInYear ? intensity : 0,
        count,
        isFuture: future && isInYear,
        isToday: todayCell,
      });

      if (isInYear) {
        const monthNum = getMonth(cursor);
        if (monthNum !== lastMonth && d === 0) {
          months.push({ label: format(cursor, 'MMM'), weekIndex });
          lastMonth = monthNum;
        } else if (monthNum !== lastMonth) {
          months.push({ label: format(cursor, 'MMM'), weekIndex: weekIndex + 1 });
          lastMonth = monthNum;
        }
      }

      cursor = addDays(cursor, 1);
    }

    weeks.push({ days: week });
    weekIndex++;
    if (weeks.length > 54) break;
  }

  return { year, weeks, months };
}

export const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const WEEKDAY_LABELS_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function getColorForIntensity(baseColor: string, intensity: 0 | 1 | 2 | 3 | 4): string {
  // Returns CSS color with opacity based on intensity
  if (intensity === 0) return 'transparent';
  const opacities = [0, 0.25, 0.45, 0.7, 1.0];
  return `${baseColor}${Math.round(opacities[intensity] * 255).toString(16).padStart(2, '0')}`;
}

export function getGitHubColorForIntensity(intensity: 0 | 1 | 2 | 3 | 4): string {
  const colors = ['transparent', '#0e4429', '#006d32', '#26a641', '#39d353'];
  return colors[intensity];
}

export function getLeetCodeColorForIntensity(intensity: 0 | 1 | 2 | 3 | 4): string {
  const colors = ['transparent', '#5c3a1e', '#9c4221', '#c05621', '#ed8936'];
  return colors[intensity];
}
