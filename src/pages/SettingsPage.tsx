import { Settings } from 'lucide-react';
import { useAppStore } from '../store';
import { GitHubIntegration } from '../components/integrations/GitHubIntegration';
import { LeetCodeIntegration } from '../components/integrations/LeetCodeIntegration';

export function SettingsPage() {
  const { habits } = useAppStore();

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <Settings size={20} className="text-slate-400" />
        <h1 className="text-xl font-bold text-white">Settings</h1>
      </div>

      {/* Connected Accounts */}
      <section>
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Connected Accounts</h2>
        <div className="space-y-4">
          <GitHubIntegration />
          <LeetCodeIntegration />
        </div>
      </section>

      {/* About */}
      <section>
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">About</h2>
        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <span className="text-white text-lg">⚡</span>
            </div>
            <div>
              <p className="font-bold text-white">DailyGrid</p>
              <p className="text-xs text-slate-500">Personal consistency operating system</p>
            </div>
          </div>
          <div className="space-y-1 text-xs text-slate-500">
            <p>📊 {habits.filter(h => !h.archived).length} active habits tracked</p>
            <p>☁️ Data securely synced with Supabase</p>
            <p>🔒 Single-user instance — your data stays private</p>
          </div>
        </div>
      </section>
    </div>
  );
}
