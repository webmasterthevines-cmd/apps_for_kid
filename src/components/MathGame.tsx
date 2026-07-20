import React, { useState, useEffect, useRef } from 'react';
import { generateMathQuiz, MathQuestion } from '../utils/mathGenerator';
import { QuestionDetail, SaveSessionPayload } from '../types';
import { Calculator, CheckCircle2, XCircle, ArrowRight, Delete } from 'lucide-react';

interface MathGameProps {
  onComplete: (payload: SaveSessionPayload) => void;
}

export const MathGame: React.FC<MathGameProps> = ({ onComplete }) => {
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [questions, setQuestions] = useState<MathQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputVal, setInputVal] = useState('');
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [details, setDetails] = useState<QuestionDetail[]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  // モード決定処理
  const handleSelectMode = (mode: string) => {
    setSelectedMode(mode);
    const qList = generateMathQuiz(mode);
    setQuestions(qList);
    setStartTime(Date.now());
    setQuestionStartTime(Date.now());
  };

  // タイマー
  useEffect(() => {
    if (!selectedMode) return;
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
    }, 500);
    return () => clearInterval(interval);
  }, [selectedMode, startTime]);

  useEffect(() => {
    if (selectedMode) {
      inputRef.current?.focus();
    }
  }, [selectedMode, currentIndex]);

  const currentQuestion = questions[currentIndex];

  const handleAnswerSubmit = (userAnswer: string) => {
    if (!userAnswer.trim()) return;

    const isCorrect = userAnswer.trim() === currentQuestion.correctAnswer;
    const responseTimeMs = Date.now() - questionStartTime;

    if (isCorrect) {
      setFeedback('correct');
      const newDetail: QuestionDetail = {
        questionText: currentQuestion.questionText,
        userAnswer: userAnswer.trim(),
        correctAnswer: currentQuestion.correctAnswer,
        isCorrect: true,
        responseTimeMs,
      };

      const updatedDetails = [...details, newDetail];
      setDetails(updatedDetails);

      setTimeout(() => {
        setFeedback(null);
        setInputVal('');
        if (currentIndex + 1 < questions.length) {
          setCurrentIndex((prev) => prev + 1);
          setQuestionStartTime(Date.now());
        } else {
          // 全10問完了
          const finalDuration = Math.max(1, Math.floor((Date.now() - startTime) / 1000));
          const totalQuestions = questions.length;
          const correctCount = updatedDetails.length;
          const accuracy = Math.round((correctCount / (correctCount + errorCount)) * 100) || 100;
          const score = Math.max(100, Math.round((correctCount * 100) - (errorCount * 20) + Math.max(0, 300 - finalDuration)));

          const payload: SaveSessionPayload = {
            userId: 1,
            subject: 'math',
            mode: selectedMode || 'math_drill',
            score,
            totalQuestions,
            correctCount,
            accuracy,
            wpm: 0,
            durationSeconds: finalDuration,
            details: updatedDetails,
          };

          onComplete(payload);
        }
      }, 600);
    } else {
      setFeedback('wrong');
      setErrorCount((prev) => prev + 1);
      setTimeout(() => {
        setFeedback(null);
        setInputVal('');
      }, 800);
    }
  };

  const handleSkipQuestion = () => {
    if (feedback) return;

    const responseTimeMs = Date.now() - questionStartTime;
    const newDetail: QuestionDetail = {
      questionText: currentQuestion.questionText,
      userAnswer: '[パス]',
      correctAnswer: currentQuestion.correctAnswer,
      isCorrect: false,
      responseTimeMs,
    };

    const updatedDetails = [...details, newDetail];
    setDetails(updatedDetails);
    setErrorCount((prev) => prev + 1);

    setInputVal('');
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setQuestionStartTime(Date.now());
    } else {
      // 全10問完了
      const finalDuration = Math.max(1, Math.floor((Date.now() - startTime) / 1000));
      const totalQuestions = questions.length;
      const correctCount = updatedDetails.filter(d => d.isCorrect).length;
      const accuracy = Math.round((correctCount / totalQuestions) * 100) || 0;
      const score = Math.max(0, Math.round((correctCount * 100) - (errorCount * 20) + Math.max(0, 300 - finalDuration)));

      const payload: SaveSessionPayload = {
        userId: 1,
        subject: 'math',
        mode: selectedMode || 'math_drill',
        score,
        totalQuestions,
        correctCount,
        accuracy,
        wpm: 0,
        durationSeconds: finalDuration,
        details: updatedDetails,
      };

      onComplete(payload);
    }
  };

  const handleNumpadClick = (num: string) => {
    if (feedback) return;
    setInputVal((prev) => prev + num);
  };

  const handleBackspace = () => {
    setInputVal((prev) => prev.slice(0, -1));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAnswerSubmit(inputVal);
    }
  };

  // 1. モード選択画面
  if (!selectedMode) {
    const modes = [
      { id: 'carry_add', title: 'くりあがり たしざん', desc: '2〜4けたのたしざん (10もん)', color: 'from-emerald-500 to-teal-600' },
      { id: 'borrow_sub', title: 'くりさがり ひきざん', desc: '2〜4けたのひきざん (10もん)', color: 'from-blue-500 to-indigo-600' },
      { id: 'multiply_12x12', title: 'かけざん (12×12)', desc: '1×1 から 12×12 まで (10もん)', color: 'from-amber-500 to-orange-600' },
      { id: 'match_target', title: 'えらぶ かけざん', desc: 'こたえが○になるしきをえらぶ (10もん)', color: 'from-purple-500 to-pink-600' },
      { id: 'equation_x', title: 'あなうめ・ぎゃくさん', desc: 'x × 3 = 6 の x をもとめる (10もん)', color: 'from-rose-500 to-red-600' },
      { id: 'all', title: 'ぜんぶミックス', desc: 'すべてのタイプからランダム (10もん)', color: 'from-sky-500 to-cyan-600' },
    ];

    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center bg-slate-900 rounded-2xl p-6 border border-slate-700">
          <div className="inline-flex p-3 bg-emerald-500/20 text-emerald-400 rounded-xl mb-2">
            <Calculator className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">さんすうのモードをえらぼう</h2>
          <p className="text-slate-400 text-sm">チャレンジしたい出題形式をタップしてください（各10問）</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {modes.map((m) => (
            <div
              key={m.id}
              onClick={() => handleSelectMode(m.id)}
              className="group bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-emerald-400 rounded-2xl p-5 cursor-pointer transition duration-200 shadow-lg flex items-center justify-between"
            >
              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition">
                  {m.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1">{m.desc}</p>
              </div>
              <div className={`p-3 rounded-xl bg-gradient-to-br ${m.color} text-white shadow-md group-hover:scale-105 transition`}>
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 2. 算数ドリル問題画面
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  return (
    <div className="max-w-2xl mx-auto bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-700">
      {/* プログレスバー & ヘッダー */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calculator className="w-6 h-6 text-emerald-400" />
          <span className="font-bold text-lg text-slate-200">
            さんすう問題 {currentIndex + 1} / {questions.length}
          </span>
        </div>
        <div className="flex items-center gap-3 text-sm font-semibold">
          <div className="bg-slate-700 px-3 py-1 rounded-full text-sky-400">
            時間: {elapsedSeconds}秒
          </div>
          <button
            type="button"
            onClick={handleSkipQuestion}
            className="bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white px-3 py-1 rounded-full text-xs font-bold transition border border-slate-600"
          >
            スキップ ➔
          </button>
        </div>
      </div>

      <div className="w-full bg-slate-700 h-2.5 rounded-full mb-8 overflow-hidden">
        <div
          className="bg-emerald-500 h-2.5 transition-all duration-300 rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* 出題カード */}
      <div
        className={`bg-slate-900 rounded-2xl p-8 text-center border-2 transition-all duration-300 mb-6 relative overflow-hidden ${
          feedback === 'correct'
            ? 'border-emerald-500 bg-emerald-950/30'
            : feedback === 'wrong'
            ? 'border-rose-500 bg-rose-950/30 animate-shake'
            : 'border-slate-700'
        }`}
      >
        <span className="inline-block bg-emerald-900/60 text-emerald-300 text-xs px-3 py-1 rounded-full mb-2 font-bold">
          {currentQuestion.type === 'carry_add' && 'くりあがり たしざん'}
          {currentQuestion.type === 'borrow_sub' && 'くりさがり ひきざん'}
          {currentQuestion.type === 'multiply_12x12' && 'かけざん (12×12)'}
          {currentQuestion.type === 'match_target' && 'えらぶ かけざん'}
          {currentQuestion.type === 'equation_x' && 'あなうめ・ぎゃくさん'}
        </span>

        <div className="text-3xl sm:text-4xl font-black text-white my-4 tracking-wide font-mono">
          {currentQuestion.questionText}
        </div>

        {/* 正解/不正解フィードバック表示 */}
        {feedback === 'correct' && (
          <div className="absolute inset-0 bg-emerald-950/90 flex items-center justify-center gap-2 text-emerald-400 font-extrabold text-3xl animate-bounce">
            <CheckCircle2 className="w-10 h-10" /> せいかい！
          </div>
        )}
        {feedback === 'wrong' && (
          <div className="absolute inset-0 bg-rose-950/90 flex items-center justify-center gap-2 text-rose-400 font-extrabold text-3xl">
            <XCircle className="w-10 h-10" /> おしい！もういちど
          </div>
        )}
      </div>

      {/* 解答入力エリア */}
      {currentQuestion.options ? (
        /* マッチング問題 (4択ボタン) */
        <div className="grid grid-cols-2 gap-4 mb-4">
          {currentQuestion.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswerSubmit(option)}
              className="bg-slate-900 hover:bg-emerald-600 text-white font-black text-2xl py-4 rounded-xl border border-slate-700 hover:border-emerald-400 transition shadow-lg"
            >
              {option}
            </button>
          ))}
        </div>
      ) : (
        /* 数値入力問題 (入力フォーム + テンキー) */
        <div className="space-y-4">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="こたえを入力"
              className="w-full bg-slate-900 border-2 border-emerald-500/50 rounded-xl px-5 py-4 text-center text-3xl font-mono text-white focus:outline-none focus:border-emerald-400 shadow-inner"
              autoFocus
            />
          </div>

          {/* 画面上テンキー (タッチ操作・画面入力用) */}
          <div className="grid grid-cols-3 gap-3">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleNumpadClick(num)}
                className={`bg-slate-700 hover:bg-slate-600 text-white font-bold text-2xl py-3.5 rounded-xl transition ${
                  num === '0' ? 'col-span-1' : ''
                }`}
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              onClick={handleBackspace}
              className="bg-slate-800 hover:bg-slate-700 text-rose-400 font-bold py-3.5 rounded-xl flex items-center justify-center"
            >
              <Delete className="w-6 h-6" />
            </button>
            <button
              type="button"
              onClick={() => handleAnswerSubmit(inputVal)}
              className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-1 shadow-lg shadow-emerald-500/20"
            >
              けってい <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
