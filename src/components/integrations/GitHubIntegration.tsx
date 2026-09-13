import React, { useState } from 'react';
import { RefreshCw, Unlink, CheckCircle2, AlertCircle, Loader2, Info, ExternalLink } from 'lucide-react';
import { useAppStore } from '../../store';
import { format } from 'date-fns';
function GitHubIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

export function GitHubIntegration() {
  const { integrations, connectIntegration, disconnectIntegration, syncIntegration, toggleIntegrationInOverall } = useAppStore();
  const integration = integrations.find(i => i.provider === 'github');

  const [username, setUsername] = useState('');
  const [token, setToken] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState('');
  const [syncing, setSyncing] = useState(false);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    setConnecting(true);
    setError('');
    try {
      await connectIntegration('github', username.trim(), token.trim() || undefined);
      setUsername('');
      setToken('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect GitHub account');
    } finally {
      setConnecting(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    setError('');
    try {
      await syncIntegration('github');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  const handleDisconnect = async () => {
    await disconnectIntegration('github');
  };

  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
          <GitHubIcon />
        </div>
        <div>
          <h3 className="font-semibold text-slate-100 text-sm">GitHub</h3>
          <p className="text-xs text-slate-500">Sync your contribution activity</p>
        </div>
        {integration && (
          <div className="ml-auto flex items-center gap-1.5">
            {integration.sync_status === 'syncing' && (
              <span className="flex items-center gap-1 text-xs text-blue-400">
                <Loader2 size={11} className="animate-spin" /> Syncing…
              </span>
            )}
            {integration.sync_status === 'success' && (
              <span className="flex items-center gap-1 text-xs text-green-400">
                <CheckCircle2 size={11} /> Synced
              </span>
            )}
            {integration.sync_status === 'error' && (
              <span className="flex items-center gap-1 text-xs text-red-400">
                <AlertCircle size={11} /> Error
              </span>
            )}
          </div>
        )}
      </div>

      {!integration ? (
        <form onSubmit={handleConnect} className="space-y-3">
          <div>
            <label className="label-text">GitHub Username *</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="e.g. octocat"
              className="input-field"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="label-text !mb-0">Personal Access Token (recommended)</label>
              <a
                href="https://github.com/settings/tokens/new?description=DailyGrid&scopes=read:user"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5"
              >
                Generate <ExternalLink size={9} />
              </a>
            </div>
            <input
              type="password"
              value={token}
              onChange={e => setToken(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxx (optional but recommended)"
              className="input-field"
            />
            <p className="text-[10px] text-slate-600 mt-1 flex items-start gap-1">
              <Info size={10} className="mt-0.5 shrink-0" />
              A token enables the contributions GraphQL API (more reliable). Without it, uses public SVG parsing.
            </p>
          </div>

          {error && <p className="text-xs text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>}

          <button
            type="submit"
            disabled={connecting || !username.trim()}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {connecting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 size={14} className="animate-spin" /> Connecting…
              </span>
            ) : 'Connect GitHub'}
          </button>
        </form>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-green-500/10 border border-green-500/20">
            <div>
              <p className="text-xs font-semibold text-green-300">Connected as @{integration.username}</p>
              {integration.last_synced_at && (
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Last synced {format(new Date(integration.last_synced_at), 'MMM d, h:mm a')}
                </p>
              )}
            </div>
            <CheckCircle2 size={16} className="text-green-400" />
          </div>

          {integration.sync_status === 'error' && integration.sync_error && (
            <p className="text-xs text-red-400 bg-red-500/10 px-3 py-2 rounded-lg flex items-start gap-1.5">
              <AlertCircle size={12} className="mt-0.5 shrink-0" />
              {integration.sync_error}
            </p>
          )}

          {/* Include in overall toggle */}
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-xs font-medium text-slate-300">Include in Overall Heatmap</p>
              <p className="text-[10px] text-slate-600">Blends GitHub activity into the master heatmap & streak</p>
            </div>
            <button
              onClick={() => toggleIntegrationInOverall('github')}
              className={`relative w-10 h-5 rounded-full transition-all duration-200 ${
                integration.include_in_overall_heatmap ? 'bg-indigo-500' : 'bg-white/10'
              }`}
            >
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${
                integration.include_in_overall_heatmap ? 'left-5' : 'left-0.5'
              }`} />
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSync}
              disabled={syncing || integration.sync_status === 'syncing'}
              className="btn-secondary flex-1 flex items-center justify-center gap-1.5 text-xs"
            >
              <RefreshCw size={12} className={syncing ? 'animate-spin' : ''} />
              Sync now
            </button>
            <button
              onClick={handleDisconnect}
              className="btn-danger flex items-center justify-center gap-1.5 text-xs px-3"
            >
              <Unlink size={12} />
              Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
