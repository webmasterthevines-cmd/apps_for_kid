import React from 'react';
import { Keyboard, Calculator, BookOpen, BarChart2, Sparkles, Play } from 'lucide-react';

interface TopViewProps {
  onSelectApp: (appId: string) => void;
  onGoAnalytics: () => void;
}

export const TopView: React.FC<TopViewProps> = ({ onSelectApp, onGoAnalytics }) => {
  const apps = [
    {
      id: 'typing',
      title: 'えいごタイピング',
      description: 'えいたんご・えいぶんをリズムよくタイピングしよう！',
      icon: Keyboard,
      color: 'from-sky-500 to-blue-600',
      available: true,
      tag: 'おすすめ',
    },
    {
      id: 'math',
      title: 'さんすうドリル',
      description: 'くりあがり・くりさがり・九九・あなうめけいさん！',
      icon: Calculator,
      color: 'from-emerald-500 to-teal-600',
      available: false,
      tag: 'じゅんび中',
    },
    {
      id: 'english',
      title: 'えいごクイズ',
      description: 'えい単語のリスニングとスペルあてクイズ！',
      icon: BookOpen,
      color: 'from-amber-500 to-orange-600',
      available: false,
      tag: 'じゅんび中',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* ヒーローバナー */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 border border-slate-700 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-1.5 bg-sky-500/20 text-sky-300 text-xs font-bold px-3 py-1 rounded-full mb-3">
              <Sparkles className="w-3.5 h-3.5" /> キッズがくしゅうポータル
            </span>
            <h2 className="text-3xl font-black text-white mb-2 tracking-tight">
              たのしく学んで、レベルアップ！
            </h2>
            <p className="text-slate-400 text-sm">
              やってみたいがくしゅうアプリをえらんで、ゲームをスタートしよう。
            </p>
          </div>
          <button
            onClick={onGoAnalytics}
            className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-sky-400 font-bold px-5 py-3 rounded-2xl border border-sky-500/30 transition shadow-lg shrink-0"
          >
            <BarChart2 className="w-5 h-5" /> がくしゅうきろく
          </button>
        </div>
      </div>

      {/* アプリ一覧エリア */}
      <div>
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          学習アプリをえらぶ
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {apps.map((app) => {
            const Icon = app.icon;
            return (
              <div
                key={app.id}
                onClick={() => app.available && onSelectApp(app.id)}
                className={`group relative rounded-2xl p-6 border transition duration-300 flex flex-col justify-between ${
                  app.available
                    ? 'bg-slate-900/90 border-slate-700 hover:border-sky-400/80 cursor-pointer hover:-translate-y-1 hover:shadow-xl hover:shadow-sky-500/10'
                    : 'bg-slate-900/40 border-slate-800 opacity-60 cursor-not-allowed'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${app.color} text-white shadow-md`}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        app.available
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {app.tag}
                    </span>
                  </div>

                  <h4 className="text-xl font-bold text-white mb-2 group-hover:text-sky-300 transition">
                    {app.title}
                  </h4>
                  <p className="text-slate-400 text-xs leading-relaxed mb-6">
                    {app.description}
                  </p>
                </div>

                <button
                  disabled={!app.available}
                  className={`w-full font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm transition ${
                    app.available
                      ? 'bg-sky-500 hover:bg-sky-400 text-white shadow-md shadow-sky-500/20'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {app.available ? (
                    <>
                      スタート <Play className="w-4 h-4 fill-current" />
                    </>
                  ) : (
                    'じゅんび中'
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
