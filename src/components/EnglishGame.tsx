import React, { useState, useEffect } from 'react';
import { TYPING_WORDS } from '../data/typingWords';
import { TypingWord, QuestionDetail, SaveSessionPayload } from '../types';
import { speakEnglishText } from '../utils/speechUtils';
import { BookOpen, CheckCircle2, XCircle, ArrowRight, RotateCcw, Delete, Volume2 } from 'lucide-react';

interface EnglishGameProps {
  onComplete: (payload: SaveSessionPayload) => void;
}

export const EnglishGame: React.FC<EnglishGameProps> = ({ onComplete }) => {
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [questions, setQuestions] = useState<TypingWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [details, setDetails] = useState<QuestionDetail[]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | 'skipped' | null>(null);

  // spelling_anagram / sentence_shuffle 用のステート
  const [shuffledItems, setShuffledItems] = useState<string[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

  // odd_one_out 用のステート
  const [oddOneOutOptions, setOddOneOutOptions] = useState<TypingWord[]>([]);

  // 配列シャッフルヘルパー
  const shuffleArray = <T,>(array: T[]): T[] => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  // モード選択処理
  const handleSelectMode = (mode: string) => {
    setSelectedMode(mode);
    let filteredWords = [...TYPING_WORDS];

    if (mode === 'spelling_anagram') {
      // 英文以外の単語
      filteredWords = TYPING_WORDS.filter((w) => w.category !== 'sentence');
    } else if (mode === 'sentence_shuffle') {
      // 英文のみ
      filteredWords = TYPING_WORDS.filter((w) => w.category === 'sentence');
    } else if (mode === 'odd_one_out') {
      // 英文以外の単語
      filteredWords = TYPING_WORDS.filter((w) => w.category !== 'sentence');
    }

    const qList = filteredWords.sort(() => 0.5 - Math.random()).slice(0, 10);
    setQuestions(qList);
    setStartTime(Date.now());
    setQuestionStartTime(Date.now());
    setCurrentIndex(0);
    setDetails([]);
    setErrorCount(0);
  };

  const currentQuestion = questions[currentIndex];

  // 問題更新時のデータ初期化
  useEffect(() => {
    if (!selectedMode || questions.length === 0) return;
    const currentQ = questions[currentIndex];
    setSelectedIndices([]);

    if (selectedMode === 'spelling_anagram') {
      // アルファベットをシャッフル
      const letters = currentQ.word.split('');
      let shuffled = shuffleArray(letters);
      while (shuffled.join('') === currentQ.word && letters.length > 1) {
        shuffled = shuffleArray(letters);
      }
      setShuffledItems(shuffled);
    } else if (selectedMode === 'sentence_shuffle') {
      // 単語（スペース区切り）をシャッフル
      const words = currentQ.word.split(' ');
      let shuffled = shuffleArray(words);
      while (shuffled.join(' ') === currentQ.word && words.length > 1) {
        shuffled = shuffleArray(words);
      }
      setShuffledItems(shuffled);
    } else if (selectedMode === 'odd_one_out') {
      // 仲間はずれ（3つが同カテゴリ、1つが異カテゴリ）の選択肢を作成
      const targetCategory = currentQ.category;
      
      // 他のカテゴリの一覧
      const otherCategories = Array.from(
        new Set(
          TYPING_WORDS.filter((w) => w.category !== 'sentence' && w.category !== targetCategory).map((w) => w.category)
        )
      );

      let dummyWords: TypingWord[] = [];
      if (otherCategories.length > 0) {
        // 共通にするカテゴリを1つ決定
        const commonCategory = otherCategories[Math.floor(Math.random() * otherCategories.length)];
        const candidates = TYPING_WORDS.filter((w) => w.category === commonCategory);
        dummyWords = shuffleArray(candidates).slice(0, 3);
      }

      // 万が一足りない場合は適当に補填
      if (dummyWords.length < 3) {
        const fallbackCandidates = TYPING_WORDS.filter(
          (w) => w.category !== 'sentence' && w.category !== targetCategory
        );
        dummyWords = shuffleArray(fallbackCandidates).slice(0, 3);
      }

      // 正解（仲間はずれ）とダミーを結合してシャッフル
      const finalOptions = shuffleArray([currentQ, ...dummyWords]);
      setOddOneOutOptions(finalOptions);
    }
  }, [selectedMode, currentIndex, questions]);

  // 全体タイマー
  useEffect(() => {
    if (!selectedMode) return;
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
    }, 500);
    return () => clearInterval(interval);
  }, [selectedMode, startTime]);

  // 回答送信処理
  const handleAnswerSubmit = (userAnswer: string) => {
    if (feedback) return;

    const expectedAnswer = currentQuestion.word;
    const isCorrect = userAnswer.trim().toLowerCase() === expectedAnswer.toLowerCase();
    const responseTimeMs = Date.now() - questionStartTime;

    if (isCorrect) {
      setFeedback('correct');
      // 正解時は発音させる（おまけ演出）
      speakEnglishText(expectedAnswer);

      const newDetail: QuestionDetail = {
        questionText: expectedAnswer,
        userAnswer: userAnswer.trim(),
        correctAnswer: expectedAnswer,
        isCorrect: true,
        responseTimeMs,
      };

      const updatedDetails = [...details, newDetail];
      setDetails(updatedDetails);

      setTimeout(() => {
        setFeedback(null);
        if (currentIndex + 1 < questions.length) {
          setCurrentIndex((prev) => prev + 1);
          setQuestionStartTime(Date.now());
        } else {
          // 全10問完了
          const finalDuration = Math.max(1, Math.floor((Date.now() - startTime) / 1000));
          const totalQuestions = questions.length;
          const correctCount = updatedDetails.filter((d) => d.isCorrect).length;
          const accuracy = Math.round((correctCount / (correctCount + errorCount)) * 100) || 100;
          const score = Math.max(
            100,
            Math.round(correctCount * 100 - errorCount * 20 + Math.max(0, 300 - finalDuration))
          );

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
      }, 1000);
    } else {
      setFeedback('wrong');
      setErrorCount((prev) => prev + 1);
      setTimeout(() => {
        setFeedback(null);
        setSelectedIndices([]); // 並べ替えの場合はリセット
      }, 1000);
    }
  };

  // スキップ処理
  const handleSkipQuestion = () => {
    if (feedback) return;

    setFeedback('skipped');
    speakEnglishText(currentQuestion.word);

    const responseTimeMs = Date.now() - questionStartTime;
    const newDetail: QuestionDetail = {
      questionText: currentQuestion.word,
      userAnswer: '[パス]',
      correctAnswer: currentQuestion.word,
      isCorrect: false,
      responseTimeMs,
    };

    const updatedDetails = [...details, newDetail];
    setDetails(updatedDetails);
    setErrorCount((prev) => prev + 1);

    setTimeout(() => {
      setFeedback(null);
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex((prev) => prev + 1);
        setQuestionStartTime(Date.now());
      } else {
        // 全10問完了
        const finalDuration = Math.max(1, Math.floor((Date.now() - startTime) / 1000));
        const totalQuestions = questions.length;
        const correctCount = updatedDetails.filter((d) => d.isCorrect).length;
        const accuracy = Math.round((correctCount / totalQuestions) * 100) || 0;
        const score = Math.max(
          0,
          Math.round(correctCount * 100 - errorCount * 20 + Math.max(0, 300 - finalDuration))
        );

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
    }, 2000);
  };

  // ブロック選択処理 (並べ替え用)
  const handleItemClick = (index: number) => {
    if (feedback) return;
    if (selectedIndices.includes(index)) {
      // すでに選択されていれば解除
      setSelectedIndices((prev) => prev.filter((i) => i !== index));
    } else {
      // 選択に追加
      const nextIndices = [...selectedIndices, index];
      setSelectedIndices(nextIndices);

      // すべて選択完了したかチェック
      if (nextIndices.length === shuffledItems.length) {
        const delimiter = selectedMode === 'sentence_shuffle' ? ' ' : '';
        const assembled = nextIndices.map((i) => shuffledItems[i]).join(delimiter);
        // 少し遅延を入れて自動判定に進む
        setTimeout(() => {
          handleAnswerSubmit(assembled);
        }, 150);
      }
    }
  };

  const handleBackspace = () => {
    if (feedback) return;
    setSelectedIndices((prev) => prev.slice(0, -1));
  };

  const handleReset = () => {
    if (feedback) return;
    setSelectedIndices([]);
  };

  // 1. モード選択画面
  if (!selectedMode) {
    const modes = [
      {
        id: 'spelling_anagram',
        title: 'もじならべかえ',
        desc: 'バラバラになったアルファベットをならべかえて、ただしい英単語をつくろう！ (10もん)',
        color: 'from-amber-500 to-orange-600',
      },
      {
        id: 'sentence_shuffle',
        title: 'えいぶんカードならべ',
        desc: 'バラバラになった英単語カードをならべかえて、ただしい英文をつくろう！ (10もん)',
        color: 'from-sky-500 to-blue-600',
      },
      {
        id: 'odd_one_out',
        title: 'なかまはずれさがし',
        desc: '4つのえいたんごのなかから、グループ（なかま）がちがうものを1つえらぼう！ (10もん)',
        color: 'from-purple-500 to-indigo-600',
      },
    ];

    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center bg-slate-900 rounded-2xl p-6 border border-slate-700">
          <div className="inline-flex p-3 bg-amber-500/20 text-amber-400 rounded-xl mb-2">
            <BookOpen className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">えいごクイズのモードをえらぼう</h2>
          <p className="text-slate-400 text-sm">チャレンジしたいクイズをタップしてください（各10問）</p>
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
                <p className="text-xs text-slate-400 leading-relaxed">{m.desc}</p>
              </div>
              <div
                className={`mt-6 p-3 rounded-xl bg-gradient-to-br ${m.color} text-white shadow-md flex items-center justify-center gap-1 font-bold text-sm group-hover:scale-105 transition`}
              >
                スタート <ArrowRight className="w-4 h-4" />
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
            えいごクイズ {currentIndex + 1} / {questions.length}
          </span>
        </div>
        <div className="flex items-center gap-3 text-sm font-semibold">
          <div className="bg-slate-700 px-3 py-1 rounded-full text-sky-400">
            じかん: {elapsedSeconds}秒
          </div>
          <button
            type="button"
            onClick={handleSkipQuestion}
            className="bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white px-3 py-1 rounded-full text-xs font-bold transition border border-slate-600"
          >
            パス ➔
          </button>
        </div>
      </div>

      <div className="w-full bg-slate-700 h-2.5 rounded-full mb-8 overflow-hidden">
        <div
          className="bg-amber-500 h-2.5 transition-all duration-300 rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* 出題・回答フィードバックエリア */}
      <div
        className={`bg-slate-900 rounded-2xl p-8 text-center border-2 transition-all duration-300 mb-6 relative overflow-hidden ${
          feedback === 'correct'
            ? 'border-emerald-500 bg-emerald-950/30'
            : feedback === 'wrong'
            ? 'border-rose-500 bg-rose-950/30 animate-shake'
            : 'border-slate-700'
        }`}
      >
        <span className="inline-block bg-amber-900/60 text-amber-300 text-xs px-3 py-1 rounded-full mb-2 font-bold">
          {selectedMode === 'spelling_anagram' && 'もじならべかえ'}
          {selectedMode === 'sentence_shuffle' && 'えいぶんカードならべ'}
          {selectedMode === 'odd_one_out' && 'なかまはずれさがし'}
        </span>

        {/* 出題情報（モード別） */}
        {selectedMode === 'spelling_anagram' && (
          <div className="my-4 space-y-2">
            <div className="text-3xl font-black text-amber-300 font-mono tracking-wider">
              {currentQuestion.meaning}
            </div>
            <div className="text-xs text-slate-400">（グループ: {currentQuestion.category.toUpperCase()}）</div>
          </div>
        )}

        {selectedMode === 'sentence_shuffle' && (
          <div className="my-4 space-y-2">
            <div className="text-2xl font-black text-amber-300">
              {currentQuestion.meaning}
            </div>
          </div>
        )}

        {selectedMode === 'odd_one_out' && (
          <div className="my-4 space-y-2">
            <div className="text-2xl font-black text-white">
              なかまはずれの言葉はどれ？
            </div>
            <div className="text-xs text-slate-400">1つだけちがうグループ（なかま）の言葉があるよ。</div>
          </div>
        )}

        {/* スピーチ再生用補助ボタン（おまけ機能） */}
        {selectedMode !== 'odd_one_out' && (
          <button
            type="button"
            onClick={() => speakEnglishText(currentQuestion.word)}
            className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs px-3 py-1.5 rounded-full transition mt-1 active:scale-95"
          >
            <Volume2 className="w-3.5 h-3.5" /> おんせいをきく
          </button>
        )}

        {/* 正解/不正解/パス時のフィードバック表示 */}
        {feedback === 'correct' && (
          <div className="absolute inset-0 bg-emerald-950/95 flex flex-col items-center justify-center gap-2 text-emerald-400 font-extrabold text-3xl animate-bounce">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-9 h-9" /> せいかい！
            </div>
            <div className="text-lg font-mono text-white tracking-wide mt-1">{currentQuestion.word}</div>
          </div>
        )}
        {feedback === 'wrong' && (
          <div className="absolute inset-0 bg-rose-950/95 flex items-center justify-center gap-2 text-rose-400 font-extrabold text-3xl">
            <XCircle className="w-10 h-10" /> おしい！もういちど
          </div>
        )}
        {feedback === 'skipped' && (
          <div className="absolute inset-0 bg-sky-950/95 flex flex-col items-center justify-center gap-2 text-sky-300 font-extrabold">
            <div className="text-sm text-sky-400">パスしました</div>
            <div className="text-2xl text-amber-300 font-mono tracking-wider">こたえ：{currentQuestion.word}</div>
            <div className="text-xs text-slate-300 mt-1 font-sans">{currentQuestion.meaning}</div>
          </div>
        )}
      </div>

      {/* 解答操作エリア（モード別） */}
      {selectedMode === 'odd_one_out' ? (
        /* 仲間はずれ探し (4択カード) */
        <div className="grid grid-cols-2 gap-4">
          {oddOneOutOptions.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswerSubmit(option.word)}
              className="bg-slate-900 hover:bg-amber-600/20 active:bg-amber-600/40 border border-slate-700 hover:border-amber-400 text-white rounded-xl p-5 transition text-center shadow-lg group flex flex-col items-center justify-center gap-1.5"
            >
              <div className="text-2xl font-bold font-mono tracking-wide group-hover:text-amber-300 transition">
                {option.word}
              </div>
              <div className="text-xs text-slate-400 font-sans">
                {option.meaning}
              </div>
            </button>
          ))}
        </div>
      ) : (
        /* ならべかえUI (アルファベット / 単語カード) */
        <div className="space-y-6">
          {/* 現在組み立てている回答 */}
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 min-h-[72px] flex items-center justify-center flex-wrap gap-2 shadow-inner">
            {selectedIndices.length === 0 ? (
              <span className="text-slate-500 text-sm font-medium">下のカードをならべてね</span>
            ) : (
              selectedIndices.map((itemIdx) => (
                <span
                  key={itemIdx}
                  onClick={() => handleItemClick(itemIdx)}
                  className="bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-extrabold px-3 py-1.5 rounded-lg text-lg font-mono tracking-wide cursor-pointer transition shadow hover:scale-105 active:scale-95"
                >
                  {shuffledItems[itemIdx]}
                </span>
              ))
            )}
          </div>

          {/* シャッフルされたアイテムのカードプール */}
          <div className="flex flex-wrap justify-center gap-3">
            {shuffledItems.map((item, idx) => {
              const isSelected = selectedIndices.includes(idx);
              return (
                <button
                  key={idx}
                  disabled={isSelected || !!feedback}
                  onClick={() => handleItemClick(idx)}
                  className={`px-4 py-3 rounded-xl text-lg font-mono font-bold tracking-wide transition shadow border ${
                    isSelected
                      ? 'bg-slate-700/30 border-slate-800/50 text-slate-600 cursor-not-allowed scale-95 opacity-40'
                      : 'bg-slate-900 hover:bg-slate-750 border-slate-700 hover:border-amber-400/80 text-white active:scale-95'
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>

          {/* コントロールボタン */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleReset}
              disabled={selectedIndices.length === 0 || !!feedback}
              className="flex-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 disabled:hover:bg-slate-700 text-slate-200 font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 border border-slate-650"
            >
              <RotateCcw className="w-4 h-4" /> はじめから
            </button>
            <button
              type="button"
              onClick={handleBackspace}
              disabled={selectedIndices.length === 0 || !!feedback}
              className="flex-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 disabled:hover:bg-slate-700 text-slate-200 font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 border border-slate-650"
            >
              <Delete className="w-4 h-4" /> 1つもどす
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
