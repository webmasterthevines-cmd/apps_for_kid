import React, { useState, useEffect, useRef } from 'react';
import { TYPING_WORDS } from '../data/typingWords';
import { QuestionDetail, SaveSessionPayload, TypingWord } from '../types';
import { calculateWPM, calculateAccuracy, calculateScore } from '../utils/typingCalculator';
import { speakEnglishText } from '../utils/speechUtils';
import { Keyboard, Volume2 } from 'lucide-react';

interface TypingGameProps {
  onComplete: (payload: SaveSessionPayload) => void;
}

export const TypingGame: React.FC<TypingGameProps> = ({ onComplete }) => {
  // 1回あたり10問を抽出
  const [questions] = useState<TypingWord[]>(() => 
    [...TYPING_WORDS].sort(() => 0.5 - Math.random()).slice(0, 10)
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputVal, setInputVal] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [details, setDetails] = useState<QuestionDetail[]>([]);
  const [wordStartTime, setWordStartTime] = useState<number>(Date.now());
  const inputRef = useRef<HTMLInputElement>(null);

  const currentQuestion = questions[currentIndex];

  // タイマー
  useEffect(() => {
    if (!startTime) return;
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
    }, 500);
    return () => clearInterval(interval);
  }, [startTime]);

  // フォーカス維持
  useEffect(() => {
    inputRef.current?.focus();
  }, [currentIndex]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!startTime) {
      setStartTime(Date.now());
      setWordStartTime(Date.now());
    }

    setTotalKeystrokes((prev) => prev + 1);

    const targetWord = currentQuestion.word;
    if (!targetWord.startsWith(val)) {
      // タイピングミス
      setErrorCount((prev) => prev + 1);
    } else {
      setInputVal(val);
    }

    // 単語完成チェック
    if (val === targetWord) {
      const responseTimeMs = Date.now() - wordStartTime;
      const newDetail: QuestionDetail = {
        questionText: targetWord,
        userAnswer: val,
        correctAnswer: targetWord,
        isCorrect: true,
        responseTimeMs,
      };

      const updatedDetails = [...details, newDetail];
      setDetails(updatedDetails);

      if (currentIndex + 1 < questions.length) {
        // 次の問題へ
        setCurrentIndex((prev) => prev + 1);
        setInputVal('');
        setWordStartTime(Date.now());
      } else {
        // ゲーム完了 (10問終了)
        finishGame(updatedDetails);
      }
    }
  };

  const [isSkipped, setIsSkipped] = useState(false);

  const handleSkipQuestion = () => {
    if (isSkipped) return;
    setIsSkipped(true);
    speakEnglishText(currentQuestion.word);

    const responseTimeMs = Date.now() - wordStartTime;
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

    setTimeout(() => {
      setIsSkipped(false);
      setInputVal('');
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex((prev) => prev + 1);
        setWordStartTime(Date.now());
      } else {
        finishGame(updatedDetails);
      }
    }, 1800);
  };

  const finishGame = (finalDetails: QuestionDetail[]) => {
    const finalDuration = Math.max(1, Math.floor((Date.now() - (startTime || Date.now())) / 1000));
    const finalAccuracy = calculateAccuracy(totalKeystrokes + 1, errorCount);
    const correctDetails = finalDetails.filter(d => d.isCorrect);
    const totalChars = correctDetails.reduce((sum, d) => sum + d.questionText.length, 0);
    const finalWpm = calculateWPM(totalChars, finalDuration);
    const finalScore = calculateScore(correctDetails.length, finalAccuracy, finalWpm);

    const payload: SaveSessionPayload = {
      userId: 1,
      subject: 'typing',
      mode: 'english_words',
      score: finalScore,
      totalQuestions: questions.length,
      correctCount: correctDetails.length,
      accuracy: finalAccuracy,
      wpm: finalWpm,
      durationSeconds: finalDuration,
      details: finalDetails,
    };

    onComplete(payload);
  };

  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);
  const currentWpm = calculateWPM(
    details.reduce((sum, d) => sum + d.questionText.length, 0) + inputVal.length,
    elapsedSeconds
  );
  const currentAccuracy = calculateAccuracy(totalKeystrokes, errorCount);

  return (
    <div className="max-w-2xl mx-auto bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-700">
      {/* プログレスバー & ヘッダー */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Keyboard className="w-6 h-6 text-sky-400" />
          <span className="font-bold text-lg text-slate-200">
            問題 {currentIndex + 1} / {questions.length}
          </span>
        </div>
        <div className="flex items-center gap-3 text-sm font-semibold">
          <div className="bg-slate-700 px-3 py-1 rounded-full text-emerald-400">
            WPM: {currentWpm}
          </div>
          <div className="bg-slate-700 px-3 py-1 rounded-full text-amber-400">
            正確性: {currentAccuracy}%
          </div>
          <div className="bg-slate-700 px-3 py-1 rounded-full text-sky-400">
            時間: {elapsedSeconds}秒
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
          className="bg-sky-500 h-2.5 transition-all duration-300 rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* 出題カード (whitespace-pre によりスペースが崩れるのを防止) */}
      <div className="bg-slate-900 rounded-xl p-8 text-center border border-slate-700 mb-6 relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="inline-block bg-sky-900/60 text-sky-300 text-xs px-3 py-1 rounded-full font-medium">
            {currentQuestion.category.toUpperCase()}
          </span>
          <button
            type="button"
            onClick={() => speakEnglishText(currentQuestion.word)}
            className="inline-flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs px-3 py-1 rounded-full transition"
          >
            <Volume2 className="w-3.5 h-3.5" /> おんせい
          </button>
        </div>
        <div className="text-4xl font-extrabold tracking-widest my-3 font-mono whitespace-pre flex justify-center flex-wrap">
          {currentQuestion.word.split('').map((char: string, i: number) => {
            let color = 'text-slate-500';
            if (i < inputVal.length) {
              color = inputVal[i] === char ? 'text-emerald-400 font-black' : 'text-rose-500';
            } else if (i === inputVal.length) {
              color = 'text-sky-300 underline underline-offset-4 font-bold animate-pulse';
            }

            const displayChar = char === ' ' ? '\u00A0' : char;

            return (
              <span key={i} className={`${color} inline-block`}>
                {displayChar}
              </span>
            );
          })}
        </div>

        {/* スキップ時正解表示オーバーレイ */}
        {isSkipped && (
          <div className="absolute inset-0 bg-sky-950/95 flex flex-col items-center justify-center gap-1 text-sky-300 font-bold z-10">
            <div className="text-xs text-sky-400">Skipped</div>
            <div className="text-3xl text-amber-300 font-mono tracking-wider">{currentQuestion.word}</div>
            <div className="text-xs text-slate-400 font-sans">🔊 Listen & Remember!</div>
          </div>
        )}
      </div>

      {/* 入力フォーム */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputVal}
          onChange={handleInputChange}
          placeholder="ここに入力してね（キーボードをタッチ）"
          className="w-full bg-slate-900 border-2 border-sky-500/50 rounded-xl px-5 py-4 text-center text-2xl font-mono text-white focus:outline-none focus:border-sky-400 shadow-inner"
          autoFocus
        />
      </div>
    </div>
  );
};
