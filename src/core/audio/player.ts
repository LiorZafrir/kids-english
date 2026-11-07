import type { AudioSource } from './resolver';

/**
 * Playback for resolved audio sources: recorded file or Web Speech TTS.
 * Every call stops whatever is playing first, so taps never pile up.
 */
let muted = false;
let audioEl: HTMLAudioElement | null = null;
let token = 0;

export function setMuted(value: boolean): void {
  muted = value;
  if (value) stopAudio();
}

export function stopAudio(): void {
  token++;
  if (audioEl) {
    audioEl.pause();
    audioEl = null;
  }
  if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel();
}

function speak(text: string): Promise<void> {
  return new Promise((resolve) => {
    if (typeof speechSynthesis === 'undefined' || typeof SpeechSynthesisUtterance === 'undefined') {
      resolve();
      return;
    }
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = 0.8;
    const voice = speechSynthesis.getVoices().find((v) => v.lang.replace('_', '-') === 'en-US');
    if (voice) u.voice = voice;
    u.onend = () => resolve();
    u.onerror = () => resolve();
    speechSynthesis.speak(u);
  });
}

function playFile(url: string): Promise<void> {
  return new Promise((resolve) => {
    const el = new Audio(url);
    audioEl = el;
    el.onended = () => resolve();
    el.onerror = () => resolve();
    el.play().catch(() => resolve());
  });
}

async function run(src: AudioSource): Promise<void> {
  await (src.kind === 'file' ? playFile(src.url) : speak(src.text));
}

export async function play(src: AudioSource): Promise<void> {
  if (muted) return;
  stopAudio();
  await run(src);
}

/** Plays sources one after another; any newer play/stop call cancels the rest. */
export async function playSequence(sources: AudioSource[], gapMs = 250): Promise<void> {
  if (muted) return;
  stopAudio();
  const mine = token;
  for (const src of sources) {
    if (token !== mine) return;
    await run(src);
    if (token !== mine) return;
    await new Promise((r) => setTimeout(r, gapMs));
  }
}
