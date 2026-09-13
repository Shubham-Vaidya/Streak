import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { generateHeatmapData, generateOverallHeatmapData, WEEKDAY_LABELS_SHORT } from '../../lib/heatmapUtils';
import { HeatmapCell } from './HeatmapCell';
import type { HabitCompletion, ExternalActivity } from '../../types';

interface HeatmapProps {
  title?: string;
  habitName?: string;
  baseColor?: string;
  colorMode?: 'habit' | 'github' | 'leetcode' | 'overall';
  isReadOnly?: boolean;
  completions?: HabitCompletion[];
  externalActivity?: ExternalActivity[];
  overallCompletionsByDate?: Map<string, number>;
  onCellClick?: (date: string, completed: boolean) => void;
}

export function Heatmap({
  title,
  habitName,
  baseColor = '#6366f1',
  colorMode = 'habit',
  isReadOnly = false,
  completions = [],
  externalActivity = [],
  overallCompletionsByDate,
  onCellClick,
}: HeatmapProps) {
  const [year, setYear] = useState(new Date().getFullYear());
  const currentYear = new Date().getFullYear();

  const completionsByDate = useMemo((): Map<string, number> => {
    if (overallCompletionsByDate) return overallCompletionsByDate;

    const map = new Map<string, number>();

    if (colorMode === 'github' || colorMode === 'leetcode') {
      for (const activity of externalActivity) {
        map.set(activity.date, activity.count);
      }
    } else if (colorMode === 'overall') {
      // Already provided via overallCompletionsByDate
    } else {
      // Per-habit: 1 if completed, 0 if not
      for (const c of completions) {
        if (c.completed && c.date.startsWith(year.toString())) {
          map.set(c.date, 1);
        }
      }
    }

    return map;
  }, [completions, externalActivity, overallCompletionsByDate, year, colorMode]);

  const heatmapData = useMemo(() => {
    if (colorMode === 'overall' && overallCompletionsByDate) {
      return generateOverallHeatmapData(year, overallCompletionsByDate);
    }
    return generateHeatmapData(year, completionsByDate);
  }, [year, completionsByDate, colorMode, overallCompletionsByDate]);

  const totalCount = useMemo(() => {
    let total = 0;
    completionsByDate.forEach(v => { total += v; });
    return total;
  }, [completionsByDate]);

  const intensityLegend = colorMode === 'github'
    ? ['#0e4429', '#006d32', '#26a641', '#39d353']
    : colorMode === 'leetcode'
      ? ['#5c3a1e', '#9c4221', '#c05621', '#ed8936']
      : [
        `${baseColor}40`,
        `${baseColor}73`,
        `${baseColor}b3`,
        baseColor,
      ];

  return (
    <div className="glass-card p-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          {title && <h3 className="font-semibold text-slate-200 text-sm">{title}</h3>}
          <p className="text-xs text-slate-500 mt-0.5">
            {colorMode === 'github'
              ? `${totalCount.toLocaleString()} contributions in ${year}`
              : colorMode === 'leetcode'
                ? `${totalCount.toLocaleString()} problems solved in ${year}`
                : colorMode === 'overall'
                  ? `${totalCount.toLocaleString()} habit completions in ${year}`
                  : `${completions.filter(c => c.completed && c.date.startsWith(year.toString())).length} days completed in ${year}`
            }
          </p>
        </div>

        {/* Year navigation */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setYear(y => y - 1)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="text-sm font-semibold text-slate-300 w-12 text-center">{year}</span>
          <button
            onClick={() => setYear(y => Math.min(y + 1, currentYear))}
            disabled={year >= currentYear}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight size={14} />
          </button>
          {year !== currentYear && (
            <button
              onClick={() => setYear(currentYear)}
              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors px-1.5"
            >
              Now
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto no-scrollbar pb-1">
        <div className="min-w-max">
          {/* Month labels */}
          <div className="flex mb-1 pl-8">
            {heatmapData.months.map((month, i) => (
              <div
                key={`${month.label}-${i}`}
                className="text-[10px] text-slate-600 font-medium"
                style={{ width: `${14 * (
                  i < heatmapData.months.length - 1
                    ? heatmapData.months[i + 1].weekIndex - month.weekIndex
                    : heatmapData.weeks.length - month.weekIndex
                )}px` }}
              >
                {month.label}
              </div>
            ))}
          </div>

          {/* Weekday labels + grid */}
          <div className="flex gap-1">
            {/* Weekday labels */}
            <div className="flex flex-col gap-[3px] pr-1.5">
              {WEEKDAY_LABELS_SHORT.map((label, i) => (
                <div
                  key={label + i}
                  className="text-[9px] text-slate-700 font-medium h-3 flex items-center justify-end w-5"
                >
                  {i % 2 !== 0 ? label : ''}
                </div>
              ))}
            </div>

            {/* Weeks */}
            <div className="flex gap-[3px]">
              {heatmapData.weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-[3px]">
                      {week.days.map((cell) => (
                    <HeatmapCell
                      key={cell.date}
                      cell={cell}
                      baseColor={baseColor}
                      colorMode={colorMode}
                      isReadOnly={isReadOnly}
                      habitName={habitName}
                      onCellClick={onCellClick}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-3 justify-end">
        <span className="text-[10px] text-slate-600">Less</span>
        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }} />
        {intensityLegend.map((color, i) => (
          <div key={i} className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
        ))}
        <span className="text-[10px] text-slate-600">More</span>
      </div>
    </div>
  );
}
