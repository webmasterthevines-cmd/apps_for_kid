export type MathQuestionType = 
  | 'carry_add'      // 繰り上がり足し算 (2〜4桁)
  | 'borrow_sub'     // 繰り下がり引き算 (2〜4桁)
  | 'multiply_12x12' // 1x1〜12x12掛け算
  | 'match_target'   // 指定解マッチング (例: 答えが12)
  | 'equation_x';    // 逆算 (例: x * 3 = 6)

export interface MathQuestion {
  id: string;
  type: MathQuestionType;
  questionText: string;
  correctAnswer: string;
  options?: string[]; // マッチング問題用の選択肢
  hint?: string;
}

// 乱数生成ヘルパー (min 〜 max 含む)
function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 繰り上がりが発生する2〜4桁足し算
function generateCarryAdd(): MathQuestion {
  const digits = getRandomInt(2, 4);
  const min = Math.pow(10, digits - 1);
  const max = Math.pow(10, digits) - 1;

  let a = getRandomInt(min, max);
  let b = getRandomInt(min, max);

  // 繰り上がりを保証する調整（一の位の和が10以上）
  if ((a % 10) + (b % 10) < 10) {
    b = b + (10 - (b % 10)) + getRandomInt(1, 9);
  }

  const ans = a + b;
  return {
    id: `add_${Date.now()}_${getRandomInt(100, 999)}`,
    type: 'carry_add',
    questionText: `${a} + ${b} = ?`,
    correctAnswer: ans.toString(),
  };
}

// 繰り下がりが発生する2〜4桁引き算
function generateBorrowSub(): MathQuestion {
  const digits = getRandomInt(2, 4);
  const min = Math.pow(10, digits - 1);
  const max = Math.pow(10, digits) - 1;

  let a = getRandomInt(min, max);
  let b = getRandomInt(min, a);

  // 繰り下がりを保証（一の位が a < b）
  if (a % 10 >= b % 10) {
    a = a + (10 - (a % 10)) + getRandomInt(1, 4);
    b = b + (10 - (b % 10)) + getRandomInt(5, 9);
    if (a <= b) a = b + getRandomInt(10, 100);
  }

  const ans = a - b;
  return {
    id: `sub_${Date.now()}_${getRandomInt(100, 999)}`,
    type: 'borrow_sub',
    questionText: `${a} - ${b} = ?`,
    correctAnswer: ans.toString(),
  };
}

// 1x1 〜 12x12 の掛け算
function generateMultiply12x12(): MathQuestion {
  const a = getRandomInt(1, 12);
  const b = getRandomInt(1, 12);
  const ans = a * b;

  return {
    id: `mul_${Date.now()}_${getRandomInt(100, 999)}`,
    type: 'multiply_12x12',
    questionText: `${a} × ${b} = ?`,
    correctAnswer: ans.toString(),
  };
}

// 指定解（例: 答えが12, 16, 24, 36等）になる掛け算マッチング
function generateMatchTarget(): MathQuestion {
  const targets = [12, 16, 18, 20, 24, 30, 36, 48];
  const target = targets[getRandomInt(0, targets.length - 1)];

  // target になる掛け算ペア（正解）
  const correctPairs: Array<[number, number]> = [];
  for (let i = 1; i <= 12; i++) {
    if (target % i === 0 && (target / i) <= 12) {
      correctPairs.push([i, target / i]);
    }
  }

  const selectedCorrect = correctPairs[getRandomInt(0, correctPairs.length - 1)];
  const correctOptionText = `${selectedCorrect[0]} × ${selectedCorrect[1]}`;

  // ダミーの誤答選択肢作成
  const wrongOptions: string[] = [];
  while (wrongOptions.length < 3) {
    const w1 = getRandomInt(2, 12);
    const w2 = getRandomInt(2, 12);
    if (w1 * w2 !== target) {
      const opt = `${w1} × ${w2}`;
      if (!wrongOptions.includes(opt) && opt !== correctOptionText) {
        wrongOptions.push(opt);
      }
    }
  }

  // 選択肢のシャッフル
  const options = [correctOptionText, ...wrongOptions].sort(() => 0.5 - Math.random());

  return {
    id: `match_${Date.now()}_${getRandomInt(100, 999)}`,
    type: 'match_target',
    questionText: `答えが 「 ${target} 」 になる掛け算はどれ？`,
    correctAnswer: correctOptionText,
    options,
  };
}

// 逆算問題 (例: x * 3 = 6 のとき x は？)
function generateEquationX(): MathQuestion {
  const x = getRandomInt(1, 12);
  const multiplier = getRandomInt(2, 12);
  const result = x * multiplier;

  const isXFirst = Math.random() > 0.5;
  const questionText = isXFirst
    ? `x × ${multiplier} = ${result}  （ x はいくつ？）`
    : `${multiplier} × x = ${result}  （ x はいくつ？）`;

  return {
    id: `eq_${Date.now()}_${getRandomInt(100, 999)}`,
    type: 'equation_x',
    questionText,
    correctAnswer: x.toString(),
  };
}

/**
 * 選択されたモードに応じた算数問題セット（10問）を生成
 */
export function generateMathQuiz(mode: string = 'all'): MathQuestion[] {
  const questions: MathQuestion[] = [];

  for (let i = 0; i < 10; i++) {
    switch (mode) {
      case 'carry_add':
        questions.push(generateCarryAdd());
        break;
      case 'borrow_sub':
        questions.push(generateBorrowSub());
        break;
      case 'multiply_12x12':
        questions.push(generateMultiply12x12());
        break;
      case 'match_target':
        questions.push(generateMatchTarget());
        break;
      case 'equation_x':
        questions.push(generateEquationX());
        break;
      case 'all':
      default: {
        const types = [generateCarryAdd, generateBorrowSub, generateMultiply12x12, generateMatchTarget, generateEquationX];
        const fn = types[i % types.length];
        questions.push(fn());
        break;
      }
    }
  }

  // ランダム順にして返す
  return questions.sort(() => 0.5 - Math.random());
}
