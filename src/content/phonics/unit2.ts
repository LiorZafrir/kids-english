import type { KeywordDef, LessonDef, WordDef } from './types';

/** Phonics Unit 2: k e h r m d (builds on unit 1). */
export const UNIT2_KEYWORDS: Record<string, KeywordDef> = {
  k: { word: 'cat', picture: 'cat' },
  e: { word: 'egg', picture: 'egg' },
  h: { word: 'hat', picture: 'hat' },
  r: { word: 'rat', picture: 'rat' },
  m: { word: 'man', picture: 'man' },
  d: { word: 'dog', picture: 'dog' },
};

export const UNIT2_WORDS: WordDef[] = [
  { id: 'cat', text: 'cat', sounds: ['k', 'a', 't'], letters: ['c', 'a', 't'], picture: 'cat' },
  { id: 'hat', text: 'hat', sounds: ['h', 'a', 't'], picture: 'hat' },
  { id: 'rat', text: 'rat', sounds: ['r', 'a', 't'], picture: 'rat' },
  { id: 'hen', text: 'hen', sounds: ['h', 'e', 'n'], picture: 'hen' },
  { id: 'man', text: 'man', sounds: ['m', 'a', 'n'], picture: 'man' },
  { id: 'map', text: 'map', sounds: ['m', 'a', 'p'], picture: 'map' },
];

export const UNIT2_LESSONS: LessonDef[] = [
  { id: 'u2-l1', unit: 2, introduces: ['k', 'e'], words: ['cat'] },
  { id: 'u2-l2', unit: 2, introduces: ['h', 'r'], words: ['hat', 'rat', 'hen'] },
  { id: 'u2-l3', unit: 2, introduces: ['m', 'd'], words: ['man', 'map'] },
  {
    id: 'u2-l4',
    unit: 2,
    introduces: [],
    words: ['cat', 'hat', 'rat', 'hen', 'man', 'map'],
    review: true,
  },
];
