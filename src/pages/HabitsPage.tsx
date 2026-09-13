import { useState } from 'react';
import { Plus, LayoutGrid, List, Archive, Flame } from 'lucide-react';
import { useAppStore } from '../store';
import { HabitCard } from '../components/habits/HabitCard';
import { EmptyState } from '../components/common/EmptyState';
import type { Category } from '../types';

const CATEGORIES: (Category | 'All')[] = ['All', 'Learning', 'Fitness', 'Project', 'Personal', 'Other'];

export function HabitsPage() {
  const { getActiveHabits, habits, setAddHabitModalOpen } = useAppStore();
  const [filter, setFilter] = useState<Category | 'All'>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const activeHabits = getActiveHabits();
  const archivedHabits = habits.filter(h => h.archived);
  const filtered = filter === 'All' ? activeHabits : activeHabits.filter(h => h.category === filter);

  if (activeHabits.length === 0 && archivedHabits.length === 0) {
    return <div className="p-6"><EmptyState /></div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Flame size={20} className="text-orange-400" />
            Habits
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">{activeHabits.length} active habit{activeHabits.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode(v => v === 'grid' ? 'list' : 'grid')}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all"
          >
            {viewMode === 'grid' ? <List size={16} /> : <LayoutGrid size={16} />}
          </button>
          <button onClick={() => setAddHabitModalOpen(true)} className="btn-primary flex items-center gap-1.5 text-xs py-1.5">
            <Plus size={14} />
            Add Habit
          </button>
        </div>
      </div>

      {/* Category filters */}
      <div className="flex gap-2 flex-wrap mb-6">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all border ${
              filter === cat
                ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
                : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
            }`}
          >
            {cat}
            {cat !== 'All' && (
              <span className="ml-1.5 text-slate-600">
                {activeHabits.filter(h => h.category === cat).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Habits grid/list */}
      {filtered.length > 0 ? (
        <div className={viewMode === 'grid'
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
          : 'flex flex-col gap-3'
        }>
          {filtered.map(habit => (
            <HabitCard key={habit.id} habit={habit} />
          ))}
          {/* Add habit card */}
          <button
            onClick={() => setAddHabitModalOpen(true)}
            className="glass-card border-dashed border-white/10 flex flex-col items-center justify-center gap-2 py-8 hover:bg-white/5 transition-all cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
              <Plus size={18} className="text-slate-500" />
            </div>
            <p className="text-xs text-slate-500 font-medium">Add Habit</p>
          </button>
        </div>
      ) : (
        <div className="text-center py-16 text-slate-500">
          <p className="text-sm">No habits in this category</p>
          <button onClick={() => setFilter('All')} className="text-xs text-indigo-400 hover:text-indigo-300 mt-2">
            Clear filter
          </button>
        </div>
      )}

      {/* Archived habits */}
      {archivedHabits.length > 0 && (
        <div className="mt-10">
          <h2 className="text-sm font-semibold text-slate-500 flex items-center gap-2 mb-3">
            <Archive size={14} />
            Archived ({archivedHabits.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {archivedHabits.map(habit => (
              <div key={habit.id} className="glass-card p-4 opacity-50">
                <p className="text-sm font-medium text-slate-300">{habit.name}</p>
                <p className="text-xs text-slate-600">{habit.category}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
