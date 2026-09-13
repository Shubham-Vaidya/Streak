import React from 'react';
import { useAppStore } from '../../store';
import {
  LayoutDashboard, CalendarDays, Flame, BarChart3, Settings,
  ChevronLeft, ChevronRight, Zap
} from 'lucide-react';
import type { Page } from '../../types';

interface NavItem {
  id: Page;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { id: 'today', label: 'Today', icon: <CalendarDays size={18} /> },
  { id: 'habits', label: 'Habits', icon: <Flame size={18} /> },
  { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={18} /> },
  { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
];

export function Sidebar() {
  const { currentPage, navigateTo, sidebarOpen, setSidebarOpen, getActiveHabits, getTodayProgress } = useAppStore();
  const habits = getActiveHabits();
  const todayProgress = getTodayProgress();

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 h-full z-40
          flex flex-col
          transition-all duration-300 ease-in-out
          border-r border-white/5
          ${sidebarOpen ? 'w-60' : 'w-16'}
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{ background: 'linear-gradient(180deg, #12121a 0%, #0f0f14 100%)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-white/5 shrink-0">
          {sidebarOpen && (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Zap size={16} className="text-white" fill="white" />
              </div>
              <span className="text-gradient font-bold text-base tracking-tight">DailyGrid</span>
            </div>
          )}
          {!sidebarOpen && (
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 mx-auto">
              <Zap size={16} className="text-white" fill="white" />
            </div>
          )}
          {sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all"
            >
              <ChevronLeft size={16} />
            </button>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto no-scrollbar">
          {navItems.map(item => {
            const isActive = currentPage === item.id || (currentPage === 'habit-detail' && item.id === 'habits');
            return (
              <button
                key={item.id}
                onClick={() => {
                  navigateTo(item.id);
                  if (window.innerWidth < 1024) setSidebarOpen(false);
                }}
                title={!sidebarOpen ? item.label : undefined}
                className={`
                  nav-item w-full text-left
                  ${isActive ? 'nav-item-active' : ''}
                  ${!sidebarOpen ? 'justify-center px-2' : ''}
                `}
              >
                <span className={`${isActive ? 'text-indigo-400' : ''} shrink-0`}>{item.icon}</span>
                {sidebarOpen && <span>{item.label}</span>}
                {sidebarOpen && item.id === 'today' && todayProgress.total > 0 && (
                  <span className="ml-auto text-xs font-semibold text-indigo-400">
                    {todayProgress.completed}/{todayProgress.total}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom: habit list quick-access */}
        {sidebarOpen && habits.length > 0 && (
          <div className="px-3 pb-3 border-t border-white/5 pt-3">
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2 px-1">My Habits</p>
            <div className="space-y-0.5 max-h-40 overflow-y-auto no-scrollbar">
              {habits.slice(0, 6).map(habit => (
                <button
                  key={habit.id}
                  onClick={() => navigateTo('habit-detail', habit.id)}
                  className="flex items-center gap-2.5 w-full px-2 py-1.5 rounded-lg hover:bg-white/5 transition-all text-left"
                >
                  <span className="text-sm">{habit.icon === 'code' ? '💻' : habit.icon === 'rocket' ? '🚀' : habit.icon === 'brain' ? '🧠' : habit.icon === 'target' ? '🎯' : habit.icon === 'dumbbell' ? '💪' : '📌'}</span>
                  <span className="text-xs text-slate-400 truncate">{habit.name}</span>
                  <span className="ml-auto w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: habit.color }} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Expand button when collapsed */}
        {!sidebarOpen && (
          <div className="pb-4 flex justify-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
