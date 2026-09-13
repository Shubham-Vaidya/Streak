import { useEffect } from 'react';
import { Layout } from './components/layout/Layout';
import { useAppStore } from './store';

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-indigo-500/40">
          <span className="text-white text-2xl">⚡</span>
        </div>
        <p className="text-gradient text-xl font-bold mb-2">DailyGrid</p>
        <p className="text-slate-600 text-xs">Loading your consistency data…</p>
        <div className="flex items-center justify-center gap-1 mt-4">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-indigo-500"
              style={{ animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const { initializeApp, isLoading } = useAppStore();

  useEffect(() => {
    initializeApp();
  }, []);

  if (isLoading) return <LoadingScreen />;

  return <Layout />;
}
