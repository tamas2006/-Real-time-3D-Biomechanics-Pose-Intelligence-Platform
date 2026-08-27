/**
 * High-Performance Non-Overlapping Marathi Voice Synthesizer
 * Ensures previous audio is immediately canceled when a new cue is spoken.
 */

let activeAudio: HTMLAudioElement | null = null;
let lastSpokenText = '';
let lastSpokenTime = 0;

export function playMarathiVoice(text: string, force = false) {
  if (typeof window === 'undefined' || !text) return;
  const now = performance.now();

  // Strict debouncing to prevent voice overlapping
  if (!force && text === lastSpokenText && now - lastSpokenTime < 1800) {
    return;
  }
  lastSpokenText = text;
  lastSpokenTime = now;

  // Immediately cancel any playing browser speech
  try {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  } catch (e) {}

  // Immediately stop any active HTML5 audio stream
  if (activeAudio) {
    try {
      activeAudio.pause();
      activeAudio.currentTime = 0;
      activeAudio.src = '';
    } catch (e) {}
    activeAudio = null;
  }

  // 1. Stream Natural Marathi Audio from Backend Microservice
  try {
    const audioUrl = `http://127.0.0.1:8000/api/mentor/tts?text=${encodeURIComponent(text)}`;
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

    const voices = window.speechSynthesis.getVoices();
    const indianVoice = voices.find(
      (v) =>
        v.lang.startsWith('mr') ||
        v.lang.startsWith('hi') ||
        v.lang.includes('India') ||
        v.lang.startsWith('en-IN')
    );

    if (indianVoice) {
      utterance.voice = indianVoice;
    }
    utterance.lang = 'mr-IN';

    window.speechSynthesis.speak(utterance);
  } catch (err) {}
}
