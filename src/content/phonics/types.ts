export type PictureId =
  | 'sun'
  | 'apple'
  | 'tiger'
  | 'pig'
  | 'insect'
  | 'nut'
  | 'pin'
  | 'pan'
  | 'tap'
  | 'ant'
  | 'cat'
  | 'egg'
  | 'dog'
  | 'hat'
  | 'rat'
  | 'man'
  | 'hen'
  | 'map';

export interface KeywordDef {
  word: string;
  picture: PictureId;
}

export interface WordDef {
  id: string;
  text: string;
  /** Phoneme ids in order. */
  sounds: string[];
  /** Letters shown on the blending tiles when they differ from the sound ids (c for /k/). */
  letters?: string[];
  /** Words without a picture are for readers only (spelling, reading, listening). */
  picture?: PictureId;
}

export interface LessonDef {
  id: string;
  unit: number;
  /** Sounds introduced in this lesson. */
  introduces: string[];
  /** Blending words practised in this lesson. */
  words: string[];
  review?: boolean;
}
