import React, { useState, useEffect, useRef } from 'react';
import { TYPING_WORDS } from '../data/typingWords';
import { TypingWord, QuestionDetail, SaveSessionPayload } from '../types';
import { speakEnglishText } from '../utils/speechUtils';
import { Volume2, BookOpen, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

interface EnglishGameProps {
  onComplete: (payload: SaveSessionPayload) => void;
}

export const EnglishGame: React.FC<EnglishGameProps> = ({ onComplete }) => {
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [questions, setQuestions] = useState<TypingWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputVal, setInputVal] = useState('');
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [details, setDetails] = useState<QuestionDetail[]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [currentOptions, setCurrentOptions] = useState<string[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);

  // モード選択処理
  const handleSelectMode = (mode: string) => {
    setSelectedMode(mode);
    const qList = [...TYPING_WORDS].sort(() => 0.5 - Math.random()).slice(0, 10);
    setQuestions(qList);
    setStartTime(Date.now());
    setQuestionStartTime(Date.now());
  };

  // 問題更新時に選択肢生成 ＆ 自動音声再生
  useEffect(() => {
    if (!selectedMode || questions.length === 0) return;
    const currentQ = questions[currentIndex];

    // 初回音声発話
    speakEnglishText(currentQ.word);

    // 4択クイズの選択肢生成 (日本語訳を使わず全て英語表記)
    if (selectedMode === 'listening_choice' || selectedMode === 'word_choice') {
      const correctText = currentQ.word;
      
      const wrongOptions: string[] = [];
      while (wrongOptions.length < 3) {
        const dummy = TYPING_WORDS[Math.floor(Math.random() * TYPING_WORDS.length)];
        const dummyText = dummy.word;
        if (dummyText !== correctText && !wrongOptions.includes(dummyText)) {
          wrongOptions.push(dummyText);
        }
      }
      const opts = [correctText, ...wrongOptions].sort(() => 0.5 - Math.random());
      setCurrentOptions(opts);
    }
  }, [selectedMode, currentIndex, questions]);

  // タイマー
  useEffect(() => {
    if (!selectedMode) return;
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
    }, 500);
    return () => clearInterval(interval);
  }, [selectedMode, startTime]);

  useEffect(() => {
    if (selectedMode === 'listening_spelling') {
      inputRef.current?.focus();
    }
  }, [selectedMode, currentIndex]);

  const currentQuestion = questions[currentIndex];

  const handleAnswerSubmit = (userAnswer: string) => {
    if (!userAnswer.trim()) return;

    const expectedAnswer = currentQuestion.word;
    const isCorrect = userAnswer.trim().toLowerCase() === expectedAnswer.toLowerCase();
    const responseTimeMs = Date.now() - questionStartTime;

    if (isCorrect) {
      setFeedback('correct');
      const newDetail: QuestionDetail = {
        questionText: currentQuestion.word,
        userAnswer: userAnswer.trim(),
        correctAnswer: expectedAnswer,
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
            subject: 'english',
            mode: selectedMode || 'english_quiz',
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
      questionText: currentQuestion.word,
      userAnswer: '[SKIPPED]',
      correctAnswer: currentQuestion.word,
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
        subject: 'english',
        mode: selectedMode || 'english_quiz',
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

  // 1. モード選択画面
  if (!selectedMode) {
    const modes = [
      { id: 'listening_choice', title: 'Listening 4-Choice', desc: 'Listen to the sound and choose the correct English word (10 Qs)', color: 'from-amber-500 to-orange-600' },
      { id: 'listening_spelling', title: 'Listening & Spelling', desc: 'Listen to the sound and type the English word (10 Qs)', color: 'from-sky-500 to-blue-600' },
      { id: 'word_choice', title: 'Word Recognition', desc: 'Look at the word category and choose the matching word (10 Qs)', color: 'from-purple-500 to-indigo-600' },
    ];

    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center bg-slate-900 rounded-2xl p-6 border border-slate-700">
          <div className="inline-flex p-3 bg-amber-500/20 text-amber-400 rounded-xl mb-2">
            <BookOpen className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">Select English Quiz Mode</h2>
          <p className="text-slate-400 text-sm">Choose a listening & English practice mode (10 questions)</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {modes.map((m) => (
            <div
              key={m.id}
              onClick={() => handleSelectMode(m.id)}
              className="group bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-amber-400 rounded-2xl p-5 cursor-pointer transition duration-200 shadow-lg flex flex-col justify-between"
            >
              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition mb-2">
                  {m.title}
                </h3>
                <p className="text-xs text-slate-400">{m.desc}</p>
              </div>
              <div className={`mt-6 p-3 rounded-xl bg-gradient-to-br ${m.color} text-white shadow-md flex items-center justify-center gap-1 font-bold text-sm group-hover:scale-105 transition`}>
                Start <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 2. クイズ問題画面
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  return (
    <div className="max-w-2xl mx-auto bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-700">
      {/* プログレスバー & ヘッダー */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-amber-400" />
          <span className="font-bold text-lg text-slate-200">
            English Quiz {currentIndex + 1} / {questions.length}
          </span>
        </div>
        <div className="flex items-center gap-3 text-sm font-semibold">
          <div className="bg-slate-700 px-3 py-1 rounded-full text-sky-400">
            Time: {elapsedSeconds}s
          </div>
          <button
            type="button"
            onClick={handleSkipQuestion}
            className="bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white px-3 py-1 rounded-full text-xs font-bold transition border border-slate-600"
          >
            Skip ➔
          </button>
        </div>
      </div>

      <div className="w-full bg-slate-700 h-2.5 rounded-full mb-8 overflow-hidden">
        <div
          className="bg-amber-500 h-2.5 transition-all duration-300 rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* 出題カード (音声再生機能つき) */}
      <div
        className={`bg-slate-900 rounded-2xl p-8 text-center border-2 transition-all duration-300 mb-6 relative overflow-hidden ${
          feedback === 'correct'
            ? 'border-emerald-500 bg-emerald-950/30'
            : feedback === 'wrong'
            ? 'border-rose-500 bg-rose-950/30'
            : 'border-slate-700'
        }`}
      >
        <div className="flex items-center justify-center gap-3 mb-2">
          <button
            type="button"
            onClick={() => speakEnglishText(currentQuestion.word)}
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl transition shadow-md shadow-amber-500/20 active:scale-95"
          >
            <Volume2 className="w-5 h-5" /> Listen Again
          </button>
        </div>

        {selectedMode === 'word_choice' ? (
          <div className="text-3xl sm:text-4xl font-extrabold text-white my-4 font-mono">
            {currentQuestion.category.toUpperCase()}
          </div>
        ) : (
          <div className="text-slate-400 text-sm my-4 font-medium">
            🔊 Listen to the audio and choose the correct English word!
          </div>
        )}

        {/* フィードバック表示 */}
        {feedback === 'correct' && (
          <div className="absolute inset-0 bg-emerald-950/95 flex items-center justify-center gap-2 text-emerald-400 font-extrabold text-3xl animate-bounce">
            <CheckCircle2 className="w-10 h-10" /> Correct! ({currentQuestion.word})
          </div>
        )}
        {feedback === 'wrong' && (
          <div className="absolute inset-0 bg-rose-950/95 flex items-center justify-center gap-2 text-rose-400 font-extrabold text-3xl">
            <XCircle className="w-10 h-10" /> Try Again!
          </div>
        )}
      </div>

      {/* 解答入力エリア */}
      {selectedMode === 'listening_spelling' ? (
        /* スペル入力フォーム */
        <div className="space-y-4">
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAnswerSubmit(inputVal)}
            placeholder="Type the English word here..."
            className="w-full bg-slate-900 border-2 border-amber-500/50 rounded-xl px-5 py-4 text-center text-2xl font-mono text-white focus:outline-none focus:border-amber-400 shadow-inner"
            autoFocus
          />
          <button
            onClick={() => handleAnswerSubmit(inputVal)}
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 text-lg"
          >
            Submit <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      ) : (
        /* 4択ボタン (全て英語表記) */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {currentOptions.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswerSubmit(option)}
              className="bg-slate-900 hover:bg-amber-600 text-white font-bold text-xl py-4 px-4 rounded-xl border border-slate-700 hover:border-amber-400 transition shadow-lg text-center font-mono"
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
