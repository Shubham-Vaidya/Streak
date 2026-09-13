import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { format } from 'date-fns';
import {
  computeHabitStats,
  computeOverallCurrentStreak,
  computeOverallLongestStreak,
} from '../lib/streaks';
import type {
  Habit,
  HabitCompletion,
  Integration,
  ExternalActivity,
  HabitStats,
  OverallStats,
  Provider,
  Page,
} from '../types';

export interface AppState {
  // Data
  habits: Habit[];
  completions: HabitCompletion[];
  integrations: Integration[];
  externalActivity: ExternalActivity[];

  // UI State
  currentPage: Page;
  selectedHabitId: string | null;
  sidebarOpen: boolean;
  addHabitModalOpen: boolean;
  editHabitId: string | null;
  deleteHabitId: string | null;
  isLoading: boolean;

  // Computed (derived getters)
  getActiveHabits: () => Habit[];
  getCompletionsForHabit: (habitId: string) => HabitCompletion[];
  getCompletionsForDate: (date: string) => HabitCompletion[];
  getHabitStats: (habitId: string) => HabitStats;
  getOverallStats: () => OverallStats;
  getTodayProgress: () => { completed: number; total: number };
  isCompletedToday: (habitId: string) => boolean;
  getExternalActivityForProvider: (provider: Provider) => ExternalActivity[];

  // Actions - App
  initializeApp: () => Promise<void>;

  // Actions - Navigation
  navigateTo: (page: Page, habitId?: string) => void;
  setSidebarOpen: (open: boolean) => void;
  setAddHabitModalOpen: (open: boolean) => void;
  setEditHabitId: (id: string | null) => void;
  setDeleteHabitId: (id: string | null) => void;

  // Actions - Habits
  createHabit: (data: Omit<Habit, 'id' | 'created_at' | 'archived'>) => Promise<void>;
  updateHabit: (id: string, data: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  archiveHabit: (id: string) => Promise<void>;

  // Actions - Completions
  toggleCompletion: (habitId: string, date: string) => Promise<void>;
  setCompletion: (habitId: string, date: string, completed: boolean) => Promise<void>;

  // Actions - Integrations
  connectIntegration: (provider: Provider, username: string, token?: string) => Promise<void>;
  disconnectIntegration: (provider: Provider) => Promise<void>;
  syncIntegration: (provider: Provider, year?: number) => Promise<void>;
  toggleIntegrationInOverall: (provider: Provider) => Promise<void>;
}

function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

const TODAY = () => format(new Date(), 'yyyy-MM-dd');

async function fetchApi(url: string, options?: RequestInit) {
  const res = await fetch(url, options);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `HTTP error ${res.status}`);
  }
  return res.json();
}

export const useAppStore = create<AppState>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      // Initial State
      habits: [],
      completions: [],
      integrations: [],
      externalActivity: [],
      currentPage: 'dashboard',
      selectedHabitId: null,
      sidebarOpen: true,
      addHabitModalOpen: false,
      editHabitId: null,
      deleteHabitId: null,
      isLoading: true,

      // ─── Derived getters ──────────────────────────────────────────────
      getActiveHabits: () =>
        get().habits.filter(h => !h.archived),

      getCompletionsForHabit: (habitId: string) =>
        get().completions.filter(c => c.habit_id === habitId),

      getCompletionsForDate: (date: string) =>
        get().completions.filter(c => c.date === date),

      getHabitStats: (habitId: string): HabitStats => {
        const habit = get().habits.find(h => h.id === habitId);
        if (!habit) return {
          habit_id: habitId, current_streak: 0, longest_streak: 0,
          total_completed: 0, total_days: 0, completion_rate: 0, days_missed: 0,
          best_month: null, best_week: null,
        };
        const completions = get().getCompletionsForHabit(habitId);
        return computeHabitStats(completions, habit);
      },

      getOverallStats: (): OverallStats => {
        const state = get();
        const activeHabits = state.getActiveHabits();
        const habitIds = activeHabits.map(h => h.id);
        const allCompletions = state.completions.filter(c => habitIds.includes(c.habit_id));

        const completionRates = activeHabits.map(h => {
          const stats = state.getHabitStats(h.id);
          return { id: h.id, rate: stats.completion_rate };
        });

        const bestHabit = completionRates.sort((a, b) => b.rate - a.rate)[0] || null;
        const worstHabit = completionRates.sort((a, b) => a.rate - b.rate)[0] || null;

        return {
          total_habits: activeHabits.length,
          total_completed: allCompletions.filter(c => c.completed).length,
          current_streak: computeOverallCurrentStreak(allCompletions, habitIds),
          longest_streak: computeOverallLongestStreak(allCompletions, habitIds),
          avg_daily_completion: activeHabits.length > 0
            ? Math.round(completionRates.reduce((sum, r) => sum + r.rate, 0) / completionRates.length)
            : 0,
          best_habit_id: bestHabit?.id || null,
          worst_habit_id: worstHabit?.id || null,
        };
      },

      getTodayProgress: () => {
        const state = get();
        const activeHabits = state.getActiveHabits();
        const today = TODAY();
        const todayCompletions = state.completions.filter(
          c => c.date === today && c.completed && activeHabits.some(h => h.id === c.habit_id)
        );
        return { completed: todayCompletions.length, total: activeHabits.length };
      },

      isCompletedToday: (habitId: string) => {
        const today = TODAY();
        return get().completions.some(
          c => c.habit_id === habitId && c.date === today && c.completed
        );
      },

      getExternalActivityForProvider: (provider: Provider) =>
        get().externalActivity.filter(a => a.provider === provider),

      // ─── App Actions ──────────────────────────────────────────────────
      initializeApp: async () => {
        set({ isLoading: true });
        try {
          const [habits, completions, integrations, externalActivity] = await Promise.all([
            fetchApi('/api/habits'),
            fetchApi('/api/completions'),
            fetchApi('/api/integrations'),
            fetchApi('/api/activity'),
          ]);
          set({ habits, completions, integrations, externalActivity, isLoading: false });
        } catch (err) {
          console.error('Failed to initialize app:', err);
          set({ isLoading: false });
        }
      },

      // ─── Navigation ───────────────────────────────────────────────────
      navigateTo: (page: Page, habitId?: string) =>
        set({ currentPage: page, selectedHabitId: habitId || null }),

      setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
      setAddHabitModalOpen: (open: boolean) => set({ addHabitModalOpen: open }),
      setEditHabitId: (id: string | null) => set({ editHabitId: id }),
      setDeleteHabitId: (id: string | null) => set({ deleteHabitId: id }),

      // ─── Habit Actions ────────────────────────────────────────────────
      createHabit: async (data) => {
        const habit: Habit = {
          ...data,
          id: generateId(),
          created_at: new Date().toISOString(),
          archived: false,
        };
        await fetchApi('/api/habits', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(habit)
        });
        set(state => ({ habits: [...state.habits, habit] }));
      },

      updateHabit: async (id: string, data: Partial<Habit>) => {
        await fetchApi('/api/habits', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, ...data })
        });
        set(state => ({
          habits: state.habits.map(h => h.id === id ? { ...h, ...data } : h),
        }));
      },

      deleteHabit: async (id: string) => {
        await fetchApi(`/api/habits?id=${id}`, { method: 'DELETE' });
        set(state => ({
          habits: state.habits.filter(h => h.id !== id),
          completions: state.completions.filter(c => c.habit_id !== id),
          deleteHabitId: null,
        }));
      },

      archiveHabit: async (id: string) => {
        await fetchApi('/api/habits', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, archived: true })
        });
        set(state => ({
          habits: state.habits.map(h => h.id === id ? { ...h, archived: true } : h),
        }));
      },

      // ─── Completion Actions ───────────────────────────────────────────
      toggleCompletion: async (habitId: string, date: string) => {
        const existing = get().completions.find(
          c => c.habit_id === habitId && c.date === date
        );
        const newCompleted = !(existing?.completed ?? false);
        await get().setCompletion(habitId, date, newCompleted);
      },

      setCompletion: async (habitId: string, date: string, completed: boolean) => {
        const now = new Date().toISOString();
        const id = `${habitId}_${date}`;
        
        // Optimistic UI Update
        set(state => {
          const existing = state.completions.findIndex(
            c => c.habit_id === habitId && c.date === date
          );
          if (existing >= 0) {
            const updated = [...state.completions];
            updated[existing] = { ...updated[existing], completed, updated_at: now };
            return { completions: updated };
          } else {
            const newCompletion: HabitCompletion = {
              id, habit_id: habitId, date, completed,
              created_at: now, updated_at: now,
            };
            return { completions: [...state.completions, newCompletion] };
          }
        });

        // Network Request
        try {
          await fetchApi('/api/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ habit_id: habitId, date, completed })
          });
        } catch (err) {
          console.error("Failed to sync completion to backend:", err);
          // Rollback could be implemented here
        }
      },

      // ─── Integration Actions ──────────────────────────────────────────
      connectIntegration: async (provider: Provider, username: string, token?: string) => {
        const integration: Integration = {
          id: provider,
          provider,
          username,
          access_token: token,
          connected_at: new Date().toISOString(),
          sync_status: 'idle',
          include_in_overall_heatmap: false,
        };
        await fetchApi('/api/integrations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(integration)
        });
        set(state => ({
          integrations: [
            ...state.integrations.filter(i => i.provider !== provider),
            integration,
          ],
        }));
        // Auto-sync after connecting
        await get().syncIntegration(provider);
      },

      disconnectIntegration: async (provider: Provider) => {
        await fetchApi(`/api/integrations?id=${provider}`, { method: 'DELETE' });
        set(state => ({
          integrations: state.integrations.filter(i => i.provider !== provider),
          externalActivity: state.externalActivity.filter(a => a.provider !== provider),
        }));
      },

      syncIntegration: async (provider: Provider, year?: number) => {
        const integration = get().integrations.find(i => i.provider === provider);
        if (!integration) return;

        const syncYear = year || new Date().getFullYear();

        // Set syncing status
        set(state => ({
          integrations: state.integrations.map(i =>
            i.provider === provider ? { ...i, sync_status: 'syncing', sync_error: undefined } : i
          ),
        }));

        try {
          const result = await fetchApi('/api/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              provider, 
              username: integration.username, 
              token: integration.access_token, 
              year: syncYear 
            })
          });

          const activities = result.activities || [];
          const now = new Date().toISOString();
          const updatedIntegration = { ...integration, sync_status: 'success' as const, last_synced_at: now };

          set(state => ({
            integrations: state.integrations.map(i =>
              i.provider === provider ? updatedIntegration : i
            ),
            externalActivity: [
              ...state.externalActivity.filter(a => a.provider !== provider || !a.date.startsWith(syncYear.toString())),
              ...activities,
            ],
          }));
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : 'Sync failed';
          set(state => ({
            integrations: state.integrations.map(i =>
              i.provider === provider
                ? { ...i, sync_status: 'error', sync_error: errorMsg }
                : i
            ),
          }));
          throw err;
        }
      },

      toggleIntegrationInOverall: async (provider: Provider) => {
        const integration = get().integrations.find(i => i.provider === provider);
        if (!integration) return;
        const updated = { ...integration, include_in_overall_heatmap: !integration.include_in_overall_heatmap };
        await fetchApi('/api/integrations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated)
        });
        set(state => ({
          integrations: state.integrations.map(i => i.provider === provider ? updated : i),
        }));
      },
    })),
    { name: 'DailyGrid' }
  )
);
