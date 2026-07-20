/**
 * WPM (Words Per Minute) を計算
 * @param correctChars 入力した正しい文字数
 * @param timeSeconds 経過時間（秒）
 */
export function calculateWPM(correctChars: number, timeSeconds: number): number {
  if (timeSeconds <= 0) return 0;
  const minutes = timeSeconds / 60;
  const words = correctChars / 5; // タイピングの標準規格として5文字=1Word
  const wpm = words / minutes;
  return Math.round(wpm * 10) / 10;
}

/**
 * 入力正確性 (%) を計算
 * @param totalKeystrokes 総キー打鍵数
 * @param errorCount ミス入力数
 */
export function calculateAccuracy(totalKeystrokes: number, errorCount: number): number {
  if (totalKeystrokes <= 0) return 100;
  const correctKeystrokes = Math.max(0, totalKeystrokes - errorCount);
  const accuracy = (correctKeystrokes / totalKeystrokes) * 100;
  return Math.round(accuracy * 10) / 10;
}

/**
 * 総合スコア計算
 */
export function calculateScore(correctWords: number, accuracy: number, wpm: number): number {
  const baseScore = correctWords * 100;
  const accuracyMultiplier = accuracy / 100;
  const speedBonus = Math.floor(wpm * 5);
  return Math.round((baseScore * accuracyMultiplier) + speedBonus);
}
