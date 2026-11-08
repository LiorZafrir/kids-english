import type { KeywordDef, LessonDef, WordDef } from './types';

/**
 * Phonics Unit 1: s a t p i n.
 * Rule: a word may only appear in a lesson once all of its sounds have been taught
 * (enforced by tests), so every blending word is fully decodable.
 */
export const UNIT1_KEYWORDS: Record<string, KeywordDef> = {
  s: { word: 'sun', picture: 'sun' },
  a: { word: 'apple', picture: 'apple' },
  t: { word: 'tiger', picture: 'tiger' },
  p: { word: 'pig', picture: 'pig' },
  i: { word: 'insect', picture: 'insect' },
  n: { word: 'nut', picture: 'nut' },
};

const w = (text: string, sounds: string[], picture?: WordDef['picture']): WordDef => ({
  id: text,
  text,
  sounds,
  ...(picture ? { picture } : {}),
});

export const UNIT1_WORDS: WordDef[] = [
  w('at', ['a', 't']),
  w('as', ['a', 's']),
  w('sat', ['s', 'a', 't']),
  w('pin', ['p', 'i', 'n'], 'pin'),
  w('pan', ['p', 'a', 'n'], 'pan'),
  w('tap', ['t', 'a', 'p'], 'tap'),
  w('ant', ['a', 'n', 't'], 'ant'),
  w('nap', ['n', 'a', 'p']),
  w('sip', ['s', 'i', 'p']),
  w('tip', ['t', 'i', 'p']),
  w('sit', ['s', 'i', 't']),
  w('pit', ['p', 'i', 't']),
  w('pat', ['p', 'a', 't']),
  w('tin', ['t', 'i', 'n']),
];

export const UNIT1_LESSONS: LessonDef[] = [
  { id: 'u1-l1', unit: 1, introduces: ['s', 'a', 't'], words: ['at', 'sat', 'as'] },
  { id: 'u1-l2', unit: 1, introduces: ['p', 'i', 'n'], words: ['pin', 'pan', 'tap', 'nap', 'sip'] },
  {
    id: 'u1-l3',
    unit: 1,
    introduces: [],
    words: ['ant', 'tin', 'sit', 'pit', 'tip', 'pat', 'pin', 'pan'],
    review: true,
  },
];
