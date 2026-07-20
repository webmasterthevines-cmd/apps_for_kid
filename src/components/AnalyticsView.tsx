import React, { useEffect, useState } from 'react';
import { AnalyticsSummary } from '../types';
import { BarChart2, Clock, Zap, Target, ArrowLeft, History } from 'lucide-react';

interface AnalyticsViewProps {
  onBack: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ onBack }) => {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch('/api/analytics');
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  return (
    <div className="max-w-3xl mx-auto bg-slate-800 rounded-2xl p-6 shadow-2xl border border-slate-700">
      <div className="flex items-center justify-between mb-6 border-b border-slate-700 pb-4">
        <div className="flex items-center gap-3">
          <BarChart2 className="w-7 h-7 text-sky-400" />
          <h2 className="text-2xl font-bold text-white">学習分析ダッシュボード</h2>
        </div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-semibold px-4 py-2 rounded-lg transition"
        >
          <ArrowLeft className="w-4 h-4" /> もどる
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 animate-pulse">データを読み込み中...</div>
      ) : !data ? (
        <div className="text-center py-12 text-slate-400">データの読み込みに失敗しました</div>
      ) : (
        <>
          {/* サマリーカード */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-700/80">
              <div className="text-slate-400 text-xs font-medium mb-1">そうプレイ回数</div>
              <div className="text-2xl font-extrabold text-white">{data.totalSessions} 回</div>
            </div>
            <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-700/80">
              <div className="text-slate-400 text-xs font-medium mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-indigo-400" /> 学習じかん
              </div>
              <div className="text-2xl font-extrabold text-white">
                {Math.round(data.totalDurationSeconds / 60)} 分
              </div>
            </div>
            <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-700/80">
              <div className="text-slate-400 text-xs font-medium mb-1 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-emerald-400" /> へいきん WPM
              </div>
              <div className="text-2xl font-extrabold text-emerald-400">{data.avgWpm}</div>
            </div>
            <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-700/80">
              <div className="text-slate-400 text-xs font-medium mb-1 flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-amber-400" /> へいきん せいかくせい
              </div>
              <div className="text-2xl font-extrabold text-amber-400">{data.avgAccuracy}%</div>
            </div>
          </div>

          {/* 履歴テーブル */}
          <div className="bg-slate-900/60 rounded-xl border border-slate-700/80 p-5">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <History className="w-5 h-5 text-sky-400" /> さいきんの学習りれき
            </h3>
            {data.recentSessions.length === 0 ? (
              <p className="text-center py-6 text-slate-500 text-sm">りれきがありません</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-800/80 text-xs text-slate-400 uppercase border-b border-slate-700">
                    <tr>
                      <th className="py-3 px-4">日時</th>
                      <th className="py-3 px-4">モード</th>
                      <th className="py-3 px-4">スコア</th>
                      <th className="py-3 px-4">WPM</th>
                      <th className="py-3 px-4">正確性</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {data.recentSessions.map((session) => (
                      <tr key={session.id} className="hover:bg-slate-800/50 transition">
                        <td className="py-3 px-4 text-slate-400 font-mono text-xs">
                          {new Date(session.createdAt).toLocaleString('ja-JP', {
                            month: 'numeric',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-200">{session.mode}</td>
                        <td className="py-3 px-4 font-bold text-amber-400">{session.score}</td>
                        <td className="py-3 px-4 text-emerald-400 font-mono">{session.wpm}</td>
                        <td className="py-3 px-4 text-sky-400 font-mono">{session.accuracy}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
