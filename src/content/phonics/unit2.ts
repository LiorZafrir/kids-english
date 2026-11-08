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

const w = (
  text: string,
  sounds: string[],
  picture?: WordDef['picture'],
  letters?: string[],
): WordDef => ({
  id: text,
  text,
  sounds,
  ...(letters ? { letters } : {}),
  ...(picture ? { picture } : {}),
});

export const UNIT2_WORDS: WordDef[] = [
  w('cat', ['k', 'a', 't'], 'cat', ['c', 'a', 't']),
  w('hat', ['h', 'a', 't'], 'hat'),
  w('hen', ['h', 'e', 'n'], 'hen'),
  w('kit', ['k', 'i', 't']),
  w('rat', ['r', 'a', 't'], 'rat'),
  w('man', ['m', 'a', 'n'], 'man'),
  w('map', ['m', 'a', 'p'], 'map'),
  w('red', ['r', 'e', 'd']),
  w('men', ['m', 'e', 'n']),
  w('ham', ['h', 'a', 'm']),
  w('him', ['h', 'i', 'm']),
  w('dim', ['d', 'i', 'm']),
  w('kid', ['k', 'i', 'd']),
  w('den', ['d', 'e', 'n']),
  w('mat', ['m', 'a', 't']),
];

export const UNIT2_LESSONS: LessonDef[] = [
  { id: 'u2-l1', unit: 2, introduces: ['k', 'e', 'h'], words: ['cat', 'hat', 'hen', 'kit'] },
  { id: 'u2-l2', unit: 2, introduces: ['r', 'm', 'd'], words: ['rat', 'man', 'map', 'red', 'dim'] },
  {
    id: 'u2-l3',
    unit: 2,
    introduces: [],
    words: ['mat', 'ham', 'him', 'kid', 'den', 'men', 'cat', 'hen'],
    review: true,
  },
];
