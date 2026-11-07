import manifest from '@/content/audio-manifest.json';
import phonemes from '@/content/phonemes.json';

/**
 * Audio resolution: a recorded file wins; otherwise fall back to text-to-speech.
 *
 * Recording slots (drop files in, run `npm run audio:list`, done – no code change):
 *   public/audio/phonemes/<phonemeId>.mp3      one per sound in src/content/phonemes.json
 *   public/audio/letters/<a-z>.mp3             letter NAMES ("ay", "bee"...)
 *   public/audio/words/<wordId>.mp3            whole words / sentences (later phases)
 */
export type AudioSource = { kind: 'file'; url: string } | { kind: 'tts'; text: string };

export interface PhonemeDef {
  id: string;
  grapheme: string;
  example: string;
  unit: number;
  note: string;
}

export const PHONEMES = phonemes as PhonemeDef[];
export const LETTERS = 'abcdefghijklmnopqrstuvwxyz'.split('');

export interface AudioManifest {
  phonemes: string[];
  letters: string[];
  words: string[];
}

const base = () => import.meta.env.BASE_URL;

function pick(
  folder: keyof AudioManifest,
  id: string,
  fallbackText: string,
  m: AudioManifest,
): AudioSource {
  return m[folder].includes(id)
    ? { kind: 'file', url: `${base()}audio/${folder}/${id}.mp3` }
    : { kind: 'tts', text: fallbackText };
}

/** A phoneme's sound. TTS cannot say isolated phonemes well, so the fallback is the example word. */
export function resolvePhoneme(id: string, m: AudioManifest = manifest): AudioSource {
  const def = PHONEMES.find((p) => p.id === id);
  return pick('phonemes', id, def?.example ?? id, m);
}

export function resolveLetterName(letter: string, m: AudioManifest = manifest): AudioSource {
  return pick('letters', letter.toLowerCase(), letter, m);
}

export function resolveWord(id: string, text: string, m: AudioManifest = manifest): AudioSource {
  return pick('words', id, text, m);
}
