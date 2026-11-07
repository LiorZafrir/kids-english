import type { KeywordDef, LessonDef, WordDef } from './types';

/**
 * Phonics Unit 1: s a t p i n.
 * Rule: a word may only appear in a lesson once all of its sounds have been taught
 * (enforced by tests), so every blending word is fully decodable.
 */
export const UNIT1_KEYWORDS: Record<string, KeywordDef> = {
  s: { word: 'sun', picture: 'sun' },
  a: { word: 'apple', picture: 'apple' },
  t: { word: 'top', picture: 'top' },
  p: { word: 'pig', picture: 'pig' },
  i: { word: 'igloo', picture: 'igloo' },
  n: { word: 'net', picture: 'net' },
};

export const UNIT1_WORDS: WordDef[] = [
  { id: 'pin', text: 'pin', sounds: ['p', 'i', 'n'], picture: 'pin' },
  { id: 'pan', text: 'pan', sounds: ['p', 'a', 'n'], picture: 'pan' },
  { id: 'tap', text: 'tap', sounds: ['t', 'a', 'p'], picture: 'tap' },
  { id: 'ant', text: 'ant', sounds: ['a', 'n', 't'], picture: 'ant' },
];

export const UNIT1_LESSONS: LessonDef[] = [
  { id: 'u1-l1', unit: 1, introduces: ['s', 'a'], words: [] },
  { id: 'u1-l2', unit: 1, introduces: ['t', 'p'], words: ['tap'] },
  { id: 'u1-l3', unit: 1, introduces: ['i', 'n'], words: ['pin', 'pan'] },
  { id: 'u1-l4', unit: 1, introduces: [], words: ['pin', 'pan', 'tap', 'ant'], review: true },
];
