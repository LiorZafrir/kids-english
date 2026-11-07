import type { KeywordDef, LessonDef, WordDef } from './types';
import { UNIT1_KEYWORDS, UNIT1_LESSONS, UNIT1_WORDS } from './unit1';
import { UNIT2_KEYWORDS, UNIT2_LESSONS, UNIT2_WORDS } from './unit2';

export type { KeywordDef, LessonDef, PictureId, WordDef } from './types';

/** All phonics content in teaching order. Add a unit file and list it here. */
export const KEYWORDS: Record<string, KeywordDef> = { ...UNIT1_KEYWORDS, ...UNIT2_KEYWORDS };
export const WORDS: WordDef[] = [...UNIT1_WORDS, ...UNIT2_WORDS];
export const LESSONS: LessonDef[] = [...UNIT1_LESSONS, ...UNIT2_LESSONS];

export function lessonById(id: string): LessonDef | undefined {
  return LESSONS.find((l) => l.id === id);
}

export function wordById(id: string): WordDef | undefined {
  return WORDS.find((w) => w.id === id);
}

/** Display letters for a word's blending tiles. */
export function lettersOf(w: WordDef): string[] {
  return w.letters ?? w.sounds;
}

/** Sounds introduced by lessons up to and including `lessonId`. */
export function learnedBy(lessonId: string): string[] {
  const idx = LESSONS.findIndex((l) => l.id === lessonId);
  return LESSONS.slice(0, idx + 1).flatMap((l) => l.introduces);
}

/** Sounds from every lesson the child has completed. */
export function learnedFromProgress(progress: Record<string, number>): string[] {
  return LESSONS.filter((l) => (progress[l.id] ?? 0) > 0).flatMap((l) => l.introduces);
}

/** Words whose sounds are all known. */
export function decodableWords(sounds: string[]): WordDef[] {
  const known = new Set(sounds);
  return WORDS.filter((w) => w.sounds.every((s) => known.has(s)));
}
