export type Category = 'Learning' | 'Fitness' | 'Project' | 'Personal' | 'Other';
export type Frequency = 'Daily' | 'Weekly' | 'Custom';
export type Provider = 'github' | 'leetcode';
export type SyncStatus = 'idle' | 'syncing' | 'error' | 'success';
export type Page = 'dashboard' | 'today' | 'habits' | 'analytics' | 'settings' | 'habit-detail';

export interface Habit {
  id: string;
  name: string;
  description: string;
  category: Category;
  icon: string;
  color: string;
  frequency: Frequency;
  created_at: string;
  archived: boolean;
}

export interface HabitCompletion {
  id: string;
  habit_id: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Integration {
  id: string;
  provider: Provider;
  username: string;
  access_token?: string;
  connected_at: string;
  last_synced_at?: string;
  sync_status: SyncStatus;
  sync_error?: string;
  include_in_overall_heatmap: boolean;
}

export interface ExternalActivity {
  id: string;
  provider: Provider;
  date: string; // YYYY-MM-DD
  count: number;
  fetched_at: string;
}

export interface HabitStats {
  habit_id: string;
  current_streak: number;
  longest_streak: number;
  total_completed: number;
  total_days: number;
  completion_rate: number;
  days_missed: number;
  best_month: string | null;
  best_week: string | null;
}

export interface DayCell {
  date: string; // YYYY-MM-DD
  intensity: 0 | 1 | 2 | 3 | 4;
  count: number;
  isFuture: boolean;
  isToday: boolean;
}

export interface WeekData {
  days: DayCell[];
}

export interface HeatmapData {
  year: number;
  weeks: WeekData[];
  months: MonthLabel[];
}

export interface MonthLabel {
  label: string;
  weekIndex: number;
}

export interface OverallStats {
  total_habits: number;
  total_completed: number;
  current_streak: number;
  longest_streak: number;
  avg_daily_completion: number;
  best_habit_id: string | null;
  worst_habit_id: string | null;
}

export interface IconOption {
  id: string;
  label: string;
  emoji: string;
}

export const HABIT_ICONS: IconOption[] = [
  { id: 'book', label: 'Book', emoji: '📚' },
  { id: 'code', label: 'Code', emoji: '💻' },
  { id: 'dumbbell', label: 'Workout', emoji: '💪' },
  { id: 'brain', label: 'Brain', emoji: '🧠' },
  { id: 'target', label: 'Target', emoji: '🎯' },
  { id: 'rocket', label: 'Rocket', emoji: '🚀' },
  { id: 'pen', label: 'Writing', emoji: '✍️' },
  { id: 'music', label: 'Music', emoji: '🎵' },
  { id: 'heart', label: 'Health', emoji: '❤️' },
  { id: 'star', label: 'Star', emoji: '⭐' },
  { id: 'fire', label: 'Fire', emoji: '🔥' },
  { id: 'lightning', label: 'Speed', emoji: '⚡' },
  { id: 'plant', label: 'Growth', emoji: '🌱' },
  { id: 'meditation', label: 'Meditation', emoji: '🧘' },
  { id: 'run', label: 'Running', emoji: '🏃' },
  { id: 'chess', label: 'Chess', emoji: '♟️' },
  { id: 'art', label: 'Art', emoji: '🎨' },
  { id: 'data', label: 'Data', emoji: '📊' },
  { id: 'globe', label: 'Language', emoji: '🌍' },
  { id: 'sleep', label: 'Sleep', emoji: '😴' },
];

export const HABIT_COLORS = [
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#f43f5e', // rose
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#3b82f6', // blue
];

export const CATEGORY_COLORS: Record<Category, string> = {
  Learning: '#6366f1',
  Fitness: '#22c55e',
  Project: '#8b5cf6',
  Personal: '#ec4899',
  Other: '#94a3b8',
};
