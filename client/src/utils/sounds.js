/*
 * Purpose: Short beeps for correct, wrong, and game over. No sound files are used.
 * Theme: Event-driven programming
 * Portions generated with AI assistance (Cursor) - reviewed and understood by the author.
 *
 * Mute is a display preference in localStorage. It is not part of the login.
 */

const STORAGE_KEY = 'banana-muted';

export function isMuted() {
  return localStorage.getItem(STORAGE_KEY) === '1';
}

export function setMuted(muted) {
  localStorage.setItem(STORAGE_KEY, muted ? '1' : '0');
}

function beep(frequency, seconds) {
  if (isMuted()) {
    return;
  }

  const AudioContext = window.AudioContext || window.webkitAudioContext;

  if (!AudioContext) {
    return;
  }

  const context = new AudioContext();
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.value = frequency;
  gain.gain.value = 0.06;
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + seconds);
  oscillator.onended = () => context.close();
}

export function playCorrect() {
  beep(523, 0.09);
  setTimeout(() => beep(784, 0.12), 80);
}

export function playWrong() {
  beep(196, 0.18);
}

export function playGameOver() {
  beep(330, 0.12);
  setTimeout(() => beep(196, 0.22), 130);
}
