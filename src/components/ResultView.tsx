import React, { useEffect, useState } from 'react';
import { SaveSessionPayload } from '../types';
import { Trophy, Zap, Target, Clock, ArrowRight, RotateCcw, Database } from 'lucide-react';

interface ResultViewProps {
  payload: SaveSessionPayload;
  onRetry: () => void;
  onGoAnalytics: () => void;
}

export const ResultView: React.FC<ResultViewProps> = ({ payload, onRetry, onGoAnalytics }) => {
  const [saved, setSaved] = useState(false);
  const [savingError, setSavingError] = useState<string | null>(null);

  useEffect(() => {
    // SQLite DBへ保存
    const saveToDb = async () => {
      try {
        const res = await fetch('/api/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          setSaved(true);
        } else {
          setSavingError('データベースへの保存に失敗しました');
        }
      } catch (err) {
        console.error('Error saving session:', err);
        setSavingError('サーバー通信エラー（ローカル保存実行）');
      }
    };

    saveToDb();
  }, [payload]);

  return (
    <div className="max-w-xl mx-auto bg-slate-800 rounded-2xl p-8 shadow-2xl border border-slate-700 text-center">
      <div className="inline-flex p-4 bg-amber-500/20 text-amber-400 rounded-full mb-4 animate-bounce">
        <Trophy className="w-12 h-12" />
      </div>

      <h2 className="text-3xl font-extrabold text-white mb-2">クリアおめでとう！</h2>
      <p className="text-slate-400 mb-6">タイピング練習が完了しました。</p>

      {/* スコア・ステータスカード */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700">
          <div className="flex items-center justify-center gap-1.5 text-amber-400 text-sm font-semibold mb-1">
            <Trophy className="w-4 h-4" /> 総合スコア
          </div>
          <div className="text-3xl font-black text-white">{payload.score}</div>
        </div>

        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700">
          <div className="flex items-center justify-center gap-1.5 text-emerald-400 text-sm font-semibold mb-1">
            <Zap className="w-4 h-4" /> WPM (速度)
          </div>
          <div className="text-3xl font-black text-white">{payload.wpm}</div>
        </div>

        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700">
          <div className="flex items-center justify-center gap-1.5 text-sky-400 text-sm font-semibold mb-1">
            <Target className="w-4 h-4" /> 正確性
          </div>
          <div className="text-3xl font-black text-white">{payload.accuracy}%</div>
        </div>

        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700">
          <div className="flex items-center justify-center gap-1.5 text-indigo-400 text-sm font-semibold mb-1">
            <Clock className="w-4 h-4" /> 時間
          </div>
          <div className="text-3xl font-black text-white">{payload.durationSeconds}秒</div>
        </div>
      </div>

      {/* SQLite 保存ステータス表示 */}
      <div className="flex items-center justify-center gap-2 text-xs font-medium mb-8">
        <Database className="w-4 h-4 text-sky-400" />
        {saved ? (
          <span className="text-emerald-400 font-semibold">SQLite データベースに安全に保存されました！</span>
        ) : savingError ? (
          <span className="text-rose-400">{savingError}</span>
        ) : (
          <span className="text-slate-400 animate-pulse">データベースにデータを保存中...</span>
        )}
      </div>

      {/* ボタンエリア */}
      <div className="flex gap-4">
        <button
          onClick={onRetry}
          className="flex-1 inline-flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-6 rounded-xl transition duration-200"
        >
          <RotateCcw className="w-5 h-5" /> もういちど
        </button>
        <button
          onClick={onGoAnalytics}
          className="flex-1 inline-flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-400 text-white font-bold py-3 px-6 rounded-xl transition duration-200 shadow-lg shadow-sky-500/25"
        >
          分析をみる <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
