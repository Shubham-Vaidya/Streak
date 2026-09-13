import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { getColorForIntensity, getGitHubColorForIntensity, getLeetCodeColorForIntensity } from '../../lib/heatmapUtils';
import type { DayCell } from '../../types';

interface HeatmapCellProps {
  cell: DayCell;
  baseColor: string;
  colorMode?: 'habit' | 'github' | 'leetcode' | 'overall';
  isReadOnly?: boolean;
  habitName?: string;
  onCellClick?: (date: string, completed: boolean) => void;
}

export function HeatmapCell({
  cell,
  baseColor,
  colorMode = 'habit',
  isReadOnly = false,
  habitName,
  onCellClick,
}: HeatmapCellProps) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number } | null>(null);
  const [animated, setAnimated] = useState(false);

  const getCellColor = (): string => {
    if (cell.intensity === 0) return 'rgba(255,255,255,0.05)';
    switch (colorMode) {
      case 'github': return getGitHubColorForIntensity(cell.intensity);
      case 'leetcode': return getLeetCodeColorForIntensity(cell.intensity);
      case 'overall':
      case 'habit':
      default: return getColorForIntensity(baseColor, cell.intensity);
    }
  };

  const handleMouseEnter = (e: React.MouseEvent) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setTooltip({ x: rect.left, y: rect.top });
  };

  const handleClick = () => {
    if (isReadOnly || cell.isFuture) return;
    setAnimated(true);
    setTimeout(() => setAnimated(false), 400);
    const newCompleted = cell.intensity === 0;
    onCellClick?.(cell.date, newCompleted);
  };

  const tooltipContent = () => {
    const dateLabel = format(parseISO(cell.date), 'MMMM d, yyyy');
    if (colorMode === 'github') {
      return `${dateLabel} · ${cell.count} contribution${cell.count !== 1 ? 's' : ''}`;
    }
    if (colorMode === 'leetcode') {
      return `${dateLabel} · ${cell.count} problem${cell.count !== 1 ? 's' : ''} solved`;
    }
    if (colorMode === 'overall') {
      return `${dateLabel} · ${cell.count} habit${cell.count !== 1 ? 's' : ''} completed`;
    }
    if (habitName) {
      return `${dateLabel} · ${habitName} · ${cell.intensity > 0 ? 'Completed ✓' : 'Not completed'}`;
    }
    return dateLabel;
  };

  const isClickable = !isReadOnly && !cell.isFuture;

  return (
    <div className="relative group">
      <div
        className={`
          w-3 h-3 rounded-sm transition-all duration-150
          ${isClickable ? 'cursor-pointer hover:ring-1 hover:ring-white/50 hover:scale-110' : ''}
          ${cell.isFuture ? 'opacity-15 cursor-not-allowed' : ''}
          ${cell.isToday ? 'ring-1 ring-white/40' : ''}
          ${animated ? 'animate-cell-fill' : ''}
        `}
        style={{ backgroundColor: getCellColor() }}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setTooltip(null)}
        aria-label={tooltipContent()}
        role={isClickable ? 'button' : 'presentation'}
      />

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 px-2.5 py-1.5 rounded-lg text-xs font-medium pointer-events-none
                     bg-slate-800/95 border border-white/10 text-slate-200 shadow-xl
                     whitespace-nowrap backdrop-blur-sm"
          style={{
            left: tooltip.x + 20,
            top: tooltip.y - 36,
            transform: 'translateX(-50%)',
          }}
        >
          {tooltipContent()}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800/95" />
        </div>
      )}
    </div>
  );
}
