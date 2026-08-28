/**
 * High-Performance Pure English Biomechanical Voice Coach
 * Streams low-latency natural speech audio with instant cancellation to prevent overlap.
 */

let activeAudio: HTMLAudioElement | null = null;
let lastSpokenText = '';
let lastSpokenTime = 0;

export function playVoiceCue(text: string, force = false) {
  if (typeof window === 'undefined' || !text) return;
  const now = performance.now();

  // Strict debouncing to prevent voice stuttering
  if (!force && text === lastSpokenText && now - lastSpokenTime < 1800) {
    return;
  }
  lastSpokenText = text;
  lastSpokenTime = now;

  // 1. Instantly cancel any active browser speech
  try {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  } catch (e) {}

  // 2. Instantly stop and unload any active HTML5 audio stream
  if (activeAudio) {
    try {
      activeAudio.pause();
      activeAudio.currentTime = 0;
      activeAudio.src = '';
    } catch (e) {}
    activeAudio = null;
  }

  // 3. High-Quality Server-Side Audio Stream (gTTS English)
  try {
    const audioUrl = `http://127.0.0.1:8000/api/mentor/tts?text=${encodeURIComponent(text)}&lang=en`;
    const audio = new Audio(audioUrl);
    activeAudio = audio;

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        fallbackBrowserSpeech(text);
      });
    }
  } catch (e) {
    fallbackBrowserSpeech(text);
  }
}

function fallbackBrowserSpeech(text: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  try {
    window.speechSynthesis.cancel();
    window.speechSynthesis.resume();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    utterance.lang = 'en-US';

    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(
      (v) => v.lang.startsWith('en-US') || v.lang.startsWith('en-GB') || v.lang.startsWith('en')
    );

    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    window.speechSynthesis.speak(utterance);
  } catch (err) {}
}

// Backward compatibility alias
export const playMarathiVoice = playVoiceCue;
