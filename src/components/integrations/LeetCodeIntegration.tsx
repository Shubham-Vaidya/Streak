import React, { useState } from 'react';
import { RefreshCw, Unlink, CheckCircle2, AlertCircle, Loader2, Info } from 'lucide-react';
import { useAppStore } from '../../store';
import { format } from 'date-fns';

// LeetCode SVG logo
function LeetCodeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 95 111" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M68.0063 83.0664C70.5 80.5764 74.5 80.5764 77 83.0664L88.5 94.5664C91 97.0564 91 101.056 88.5 103.556C86 106.056 82 106.056 79.5 103.556L68.0063 92.0664C65.5 89.5764 65.5 85.5664 68.0063 83.0664Z" fill="#F89F1B"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M49.5 13C27.9 13 10.5 30.4 10.5 52C10.5 73.6 27.9 91 49.5 91C71.1 91 88.5 73.6 88.5 52C88.5 30.4 71.1 13 49.5 13ZM0.5 52C0.5 24.9 22.4 3 49.5 3C76.6 3 98.5 24.9 98.5 52C98.5 79.1 76.6 101 49.5 101C22.4 101 0.5 79.1 0.5 52Z" fill="#B3B3B3"/>
      <path d="M33.5 58H65.5C68.3 58 70.5 55.8 70.5 53C70.5 50.2 68.3 48 65.5 48H33.5C30.7 48 28.5 50.2 28.5 53C28.5 55.8 30.7 58 33.5 58Z" fill="#F89F1B"/>
    </svg>
  );
}

export function LeetCodeIntegration() {
  const { integrations, connectIntegration, disconnectIntegration, syncIntegration, toggleIntegrationInOverall } = useAppStore();
  const integration = integrations.find(i => i.provider === 'leetcode');

  const [username, setUsername] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState('');
  const [syncing, setSyncing] = useState(false);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    setConnecting(true);
    setError('');
    try {
      await connectIntegration('leetcode', username.trim());
      setUsername('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect LeetCode account');
    } finally {
      setConnecting(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    setError('');
    try {
      await syncIntegration('leetcode');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-orange-500/15 flex items-center justify-center">
          <LeetCodeIcon />
        </div>
        <div>
          <h3 className="font-semibold text-slate-100 text-sm">LeetCode</h3>
          <p className="text-xs text-slate-500">Sync your daily submission activity</p>
        </div>
        {integration && (
          <div className="ml-auto">
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
            <label className="label-text">LeetCode Username *</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="e.g. john_doe"
              className="input-field"
            />
            <p className="text-[10px] text-slate-600 mt-1 flex items-start gap-1">
              <Info size={10} className="mt-0.5 shrink-0" />
              Only works with public profiles. No authentication required.
            </p>
          </div>

          {error && <p className="text-xs text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>}

          <button
            type="submit"
            disabled={connecting || !username.trim()}
            className="w-full py-2 rounded-xl font-semibold text-sm text-white transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
          >
            {connecting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 size={14} className="animate-spin" /> Connecting…
              </span>
            ) : 'Connect LeetCode'}
          </button>
        </form>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
            <div>
              <p className="text-xs font-semibold text-orange-300">Connected as {integration.username}</p>
              {integration.last_synced_at && (
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Last synced {format(new Date(integration.last_synced_at), 'MMM d, h:mm a')}
                </p>
              )}
            </div>
            <CheckCircle2 size={16} className="text-orange-400" />
          </div>

          {integration.sync_status === 'error' && integration.sync_error && (
            <p className="text-xs text-red-400 bg-red-500/10 px-3 py-2 rounded-lg flex items-start gap-1.5">
              <AlertCircle size={12} className="mt-0.5 shrink-0" />
              {integration.sync_error}
            </p>
          )}

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-xs font-medium text-slate-300">Include in Overall Heatmap</p>
              <p className="text-[10px] text-slate-600">Blends LeetCode activity into the master heatmap</p>
            </div>
            <button
              onClick={() => toggleIntegrationInOverall('leetcode')}
              className={`relative w-10 h-5 rounded-full transition-all duration-200 ${
                integration.include_in_overall_heatmap ? 'bg-orange-500' : 'bg-white/10'
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
              onClick={() => disconnectIntegration('leetcode')}
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
