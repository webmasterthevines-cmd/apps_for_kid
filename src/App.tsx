import { useState } from 'react';
import { TopView } from './components/TopView';
import { TypingGame } from './components/TypingGame';
import { MathGame } from './components/MathGame';
import { ResultView } from './components/ResultView';
import { AnalyticsView } from './components/AnalyticsView';
import { SaveSessionPayload } from './types';
import { Sparkles, BarChart2, Home } from 'lucide-react';

type ScreenState = 'top' | 'typing' | 'math' | 'result' | 'analytics';

export function App() {
  const [screen, setScreen] = useState<ScreenState>('top');
  const [sessionPayload, setSessionPayload] = useState<SaveSessionPayload | null>(null);

  const handleSelectApp = (appId: string) => {
    if (appId === 'typing') {
      setScreen('typing');
    } else if (appId === 'math') {
      setScreen('math');
    }
  };

  const handleGameComplete = (payload: SaveSessionPayload) => {
    setSessionPayload(payload);
    setScreen('result');
  };

  const handleRetry = () => {
    const currentSubject = sessionPayload?.subject;
    setSessionPayload(null);
    if (currentSubject === 'math') {
      setScreen('math');
    } else {
      setScreen('typing');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* ナビゲーションヘッダー */}
      <header className="bg-slate-900 border-b border-slate-800 py-4 px-6 mb-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => setScreen('top')}
          >
            <div className="p-2 bg-sky-500/20 text-sky-400 rounded-xl group-hover:scale-105 transition">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-black text-xl tracking-wide text-white group-hover:text-sky-300 transition">
                学びのひろば
              </h1>
              <p className="text-xs text-slate-400 font-medium">キッズ学習ポータル</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {screen !== 'top' && (
              <button
                onClick={() => setScreen('top')}
                className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-bold px-3.5 py-2 rounded-xl transition"
              >
                <Home className="w-4 h-4" /> トップ
              </button>
            )}
            <button
              onClick={() => setScreen('analytics')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition ${
                screen === 'analytics'
                  ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/25'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              <BarChart2 className="w-4 h-4" /> がくしゅうきろく
            </button>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 pb-12">
        {screen === 'top' && (
          <TopView
            onSelectApp={handleSelectApp}
            onGoAnalytics={() => setScreen('analytics')}
          />
        )}
        {screen === 'typing' && <TypingGame onComplete={handleGameComplete} />}
        {screen === 'math' && <MathGame onComplete={handleGameComplete} />}
        {screen === 'result' && sessionPayload && (
          <ResultView
            payload={sessionPayload}
            onRetry={handleRetry}
            onGoAnalytics={() => setScreen('analytics')}
          />
        )}
        {screen === 'analytics' && <AnalyticsView onBack={() => setScreen('top')} />}
      </main>

      {/* フッター */}
      <footer className="bg-slate-900/50 border-t border-slate-800/80 py-4 text-center text-xs text-slate-500">
        Raspberry Pi 4 Web Server Powered • Node.js Express + SQLite3
      </footer>
    </div>
  );
}

export default App;
