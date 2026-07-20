/**
 * ブラウザ標準の Web Speech API を用いて英語テキストを音声読み上げ
 * @param text 読み上げる英語文字列
 * @param rate 発話速度 (デフォルト: 0.9 でゆっくり聞き取りやすく)
 */
export function speakEnglishText(text: string, rate: number = 0.9): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('Web Speech API is not supported in this browser.');
    return;
  }

  // 既存の音声再生をキャンセル
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US'; // アメリカ英語
  utterance.rate = rate;     // 速度調整 (0.8 ~ 1.0)
  utterance.pitch = 1.0;

  // 利用可能な音声の中から英語ネィティブ音声を選択
  const voices = window.speechSynthesis.getVoices();
  const englishVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha')));
  if (englishVoice) {
    utterance.voice = englishVoice;
  }

  window.speechSynthesis.speak(utterance);
}
