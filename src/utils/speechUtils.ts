/**
 * 英語テキストの音声再生（Web Speech API ＋ HTML5 Audio フォールバック）
 * Amazon Fire タブレット (Silk ブラウザ) や非対応環境でも確実に音声を再生
 */
export function speakEnglishText(text: string, rate: number = 0.9): void {
  if (typeof window === 'undefined') return;

  const cleanText = text.trim();
  if (!cleanText) return;

  // 1. ブラウザが Web Speech API をサポートしているか確認
  if ('speechSynthesis' in window && window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel(); // 既存再生のクリア

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'en-US';
      utterance.rate = rate;
      utterance.pitch = 1.0;

      // ボイス一覧から英語ボイスを探す (非同期遅延考慮)
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        const englishVoice = voices.find(v => v.lang.startsWith('en'));
        if (englishVoice) {
          utterance.voice = englishVoice;
        }
      }

      // エラー発生時はフォールバックへ移行
      utterance.onerror = () => {
        playAudioFallback(cleanText);
      };

      window.speechSynthesis.speak(utterance);
      return;
    } catch (e) {
      console.warn('SpeechSynthesis error, switching to audio fallback:', e);
    }
  }

  // 2. Web Speech API 非対応・失敗時のフォールバック (HTML5 Audio)
  playAudioFallback(cleanText);
}

/**
 * Web Speech API が動作しない環境用 (Silkブラウザ等) のオンラインTTSフォールバック
 */
function playAudioFallback(text: string): void {
  try {
    const encodedText = encodeURIComponent(text);
    // 公開TTSオーディオストリームURL
    const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=en&client=tw-ob`;
    const audio = new Audio(audioUrl);
    audio.play().catch(err => {
      console.warn('Audio fallback playback blocked (User interaction required):', err);
    });
  } catch (err) {
    console.error('Failed to play fallback audio:', err);
  }
}
