import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { useAppStore } from '../../store';
import { HABIT_ICONS, HABIT_COLORS, CATEGORY_COLORS } from '../../types';
import type { Category, Frequency } from '../../types';

const CATEGORIES: Category[] = ['Learning', 'Fitness', 'Project', 'Personal', 'Other'];
const FREQUENCIES: Frequency[] = ['Daily', 'Weekly', 'Custom'];

export function AddHabitModal() {
  const { setAddHabitModalOpen, createHabit } = useAppStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>('Learning');
  const [selectedIcon, setSelectedIcon] = useState('book');
  const [selectedColor, setSelectedColor] = useState(HABIT_COLORS[0]);
  const [frequency, setFrequency] = useState<Frequency>('Daily');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('Habit name is required'); return; }
    setLoading(true);
    try {
      await createHabit({
        name: name.trim(),
        description: description.trim(),
        category,
        icon: selectedIcon,
        color: selectedColor,
        frequency,
      });
      setAddHabitModalOpen(false);
    } catch (err) {
      setError('Failed to create habit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop">
      <div className="glass-card w-full max-w-lg animate-scale-in max-h-[90vh] overflow-y-auto no-scrollbar"
           style={{ background: 'rgba(22, 22, 31, 0.97)' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div>
            <h2 className="text-base font-bold text-white">New Habit</h2>
            <p className="text-xs text-slate-500 mt-0.5">Add a new habit to track your consistency</p>
          </div>
          <button
            onClick={() => setAddHabitModalOpen(false)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Name */}
          <div>
            <label className="label-text">Habit Name *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Morning Workout"
              className="input-field"
              maxLength={60}
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="label-text">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What does this habit help you achieve?"
              className="input-field resize-none"
              rows={2}
              maxLength={200}
            />
          </div>

          {/* Category */}
          <div>
            <label className="label-text">Category</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    category === cat
                      ? 'text-white border'
                      : 'bg-white/5 text-slate-400 border border-transparent hover:bg-white/10'
                  }`}
                  style={category === cat ? {
                    backgroundColor: `${CATEGORY_COLORS[cat]}20`,
                    borderColor: `${CATEGORY_COLORS[cat]}60`,
                    color: CATEGORY_COLORS[cat],
                  } : {}}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Frequency */}
          <div>
            <label className="label-text">Frequency</label>
            <div className="flex gap-2">
              {FREQUENCIES.map(freq => (
                <button
                  key={freq}
                  type="button"
                  onClick={() => setFrequency(freq)}
                  className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all border ${
                    frequency === freq
                      ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  {freq}
                </button>
              ))}
            </div>
          </div>

          {/* Icon picker */}
          <div>
            <label className="label-text">Icon</label>
            <div className="flex flex-wrap gap-1.5">
              {HABIT_ICONS.slice(0, 16).map(icon => (
                <button
                  key={icon.id}
                  type="button"
                  onClick={() => setSelectedIcon(icon.id)}
                  title={icon.label}
                  className={`w-9 h-9 rounded-xl text-base transition-all ${
                    selectedIcon === icon.id
                      ? 'bg-indigo-500/30 ring-2 ring-indigo-500/60 scale-110'
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  {icon.emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Color picker */}
          <div>
            <label className="label-text">Accent Color</label>
            <div className="flex gap-2 flex-wrap">
              {HABIT_COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className="w-7 h-7 rounded-full transition-all hover:scale-110"
                  style={{ backgroundColor: color }}
                >
                  {selectedColor === color && (
                    <Check size={12} className="text-white mx-auto" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
              style={{ backgroundColor: `${selectedColor}20`, border: `1px solid ${selectedColor}40` }}
            >
              {HABIT_ICONS.find(i => i.id === selectedIcon)?.emoji || '📌'}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{name || 'Habit Name'}</p>
              <p className="text-xs text-slate-500">{category} · {frequency}</p>
            </div>
            <div className="ml-auto w-2.5 h-2.5 rounded-full" style={{ backgroundColor: selectedColor }} />
          </div>

          {error && <p className="text-xs text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={() => setAddHabitModalOpen(false)}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating…' : 'Create Habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
