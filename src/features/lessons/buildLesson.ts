import {
  KEYWORDS,
  LESSONS,
  WORDS,
  decodableWords,
  learnedBy,
  lessonById,
  lettersOf,
  wordById,
  type PictureId,
  type WordDef,
} from '@/content/phonics';
import type { Grade } from '@/features/profiles/types';

export { learnedBy, lessonById };

export type Rng = () => number;

export type Option = { kind: 'letter'; text: string } | { kind: 'picture'; id: PictureId };

export type SayRef = { phoneme: string } | { word: string };

export type Step =
  | { type: 'teach'; phoneme: string }
  | { type: 'blend'; word: string; sounds: string[]; letters: string[]; picture: PictureId }
  | {
      type: 'pick';
      say?: SayRef;
      show?: string;
      options: Option[];
      correct: number;
      /** SRS key: "ph:<sound>" or "w:<word>". */
      item: string;
      /** The English word behind the question, spelled out in a Word Penalty. */
      word: string;
    };

export function nextLessonId(id: string): string | null {
  const i = LESSONS.findIndex((l) => l.id === id);
  return LESSONS[i + 1]?.id ?? null;
}

export function shuffle<T>(items: readonly T[], rng: Rng = Math.random): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = a[i] as T;
    a[i] = a[j] as T;
    a[j] = tmp;
  }
  return a;
}

export interface PickCtx {
  /** Sounds the child knows; options and distractors come only from these. */
  learned: string[];
  /** Words the child can decode. */
  words: WordDef[];
  reader: boolean;
  rng: Rng;
  /** Wrong options per question (1 to 3). */
  distractors: number;
}

function mix(correct: Option, others: Option[], rng: Rng): { options: Option[]; correct: number } {
  const options = shuffle([correct, ...others], rng);
  return { options, correct: options.indexOf(correct) };
}

function letterPick(phoneme: string, c: PickCtx): Step | null {
  const kw = KEYWORDS[phoneme];
  if (!kw) return null;
  const others = shuffle(
    c.learned.filter((p) => p !== phoneme),
    c.rng,
  )
    .slice(0, c.distractors)
    .map((p): Option => ({ kind: 'letter', text: p }));
  if (others.length === 0) return null;
  return {
    type: 'pick',
    say: { phoneme },
    ...mix({ kind: 'letter', text: phoneme }, others, c.rng),
    item: `ph:${phoneme}`,
    word: kw.word,
  };
}

function picturePick(phoneme: string, c: PickCtx): Step | null {
  const kw = KEYWORDS[phoneme];
  if (!kw) return null;
  const others = shuffle(
    c.learned.filter((p) => p !== phoneme),
    c.rng,
  )
    .slice(0, c.distractors)
    .flatMap((p) => {
      const k = KEYWORDS[p];
      return k ? [{ kind: 'picture', id: k.picture } as Option] : [];
    });
  if (others.length === 0) return null;
  return {
    type: 'pick',
    say: { phoneme },
    ...mix({ kind: 'picture', id: kw.picture }, others, c.rng),
    item: `ph:${phoneme}`,
    word: kw.word,
  };
}

function wordPick(word: WordDef, c: PickCtx, showText: boolean): Step | null {
  const pool = c.words.filter((w) => w.id !== word.id);
  const others = shuffle(pool, c.rng)
    .slice(0, c.distractors)
    .map((w): Option => ({ kind: 'picture', id: w.picture }));
  if (others.length === 0) return null;
  return {
    type: 'pick',
    ...(showText ? { show: word.text } : { say: { word: word.id } }),
    ...mix({ kind: 'picture', id: word.picture }, others, c.rng),
    item: `w:${word.id}`,
    word: word.text,
  };
}

/** One question for an SRS item id. Null when the item can't make a fair question. */
export function pickForItem(item: string, c: PickCtx): Step | null {
  if (item.startsWith('ph:')) {
    const ph = item.slice(3);
    return c.reader && c.rng() < 0.5 ? letterPick(ph, c) : picturePick(ph, c);
  }
  const word = wordById(item.slice(2));
  return word ? wordPick(word, c, c.reader) : null;
}

export interface BuildOptions {
  distractors?: number;
}

/**
 * Builds the step list for a lesson.
 * Kindergarten never needs to read: only audio prompts and pictures (no letters in options).
 * Readers (grades 2 and 4) also see letters.
 */
export function buildLesson(
  id: string,
  grade: Grade,
  rng: Rng = Math.random,
  opts: BuildOptions = {},
): Step[] {
  const def = lessonById(id);
  if (!def) return [];
  const reader = grade !== 'kg';
  const learned = learnedBy(id);
  const idx = LESSONS.findIndex((l) => l.id === id);
  const seen = new Set(LESSONS.slice(0, idx + 1).flatMap((l) => l.words));
  const known = WORDS.filter((w) => seen.has(w.id));
  const ctx: PickCtx = {
    learned,
    words: known.length >= 3 ? known : WORDS,
    reader,
    rng,
    distractors: opts.distractors ?? 2,
  };
  const steps: Step[] = [];
  const add = (s: Step | null) => s && steps.push(s);

  for (const p of def.introduces) steps.push({ type: 'teach', phoneme: p });
  if (reader) for (const p of def.introduces) add(letterPick(p, ctx));
  for (const p of def.introduces) add(picturePick(p, ctx));

  if (def.review) for (const p of shuffle(learned, rng).slice(0, 4)) add(picturePick(p, ctx));

  for (const wid of def.words) {
    const word = wordById(wid);
    if (!word) continue;
    steps.push({
      type: 'blend',
      word: word.id,
      sounds: word.sounds,
      letters: lettersOf(word),
      picture: word.picture,
    });
    add(wordPick(word, ctx, reader));
    // Readers also hear the word and match it, so decoding and listening are both practised.
    if (reader) add(wordPick(word, ctx, false));
  }
  return steps;
}

function contextFor(learned: string[], grade: Grade, rng: Rng, distractors: number): PickCtx {
  return {
    learned,
    words: decodableWords(learned),
    reader: grade !== 'kg',
    rng,
    distractors,
  };
}

/** A review session from SRS item ids (skips items that can't form a fair question). */
export function buildReview(
  items: string[],
  learned: string[],
  grade: Grade,
  rng: Rng = Math.random,
  distractors = 2,
): Step[] {
  const ctx = contextFor(learned, grade, rng, distractors);
  return items.flatMap((i) => pickForItem(i, ctx) ?? []);
}

/** Battle questions: a shuffled mix of every sound and word the child has learned. */
export function buildBattle(
  learned: string[],
  grade: Grade,
  count: number,
  rng: Rng = Math.random,
  distractors = 2,
): Step[] {
  const ctx = contextFor(learned, grade, rng, distractors);
  const items = [
    ...learned.map((p) => `ph:${p}`),
    ...(grade === 'kg' ? [] : ctx.words.map((w) => `w:${w.id}`)),
    // Words count double: reading whole words is the point of the arena.
    ...(grade === 'kg' ? [] : ctx.words.map((w) => `w:${w.id}`)),
  ];
  const out: Step[] = [];
  for (const item of shuffle(items, rng)) {
    if (out.length >= count) break;
    const s = pickForItem(item, ctx);
    if (s) out.push(s);
  }
  return out;
}

/** Fixed placement quiz for readers: 5 unit-1 questions, then 4 unit-2 questions. */
export const PLACEMENT_ITEMS = [
  { item: 'ph:s', unit: 1 },
  { item: 'ph:t', unit: 1 },
  { item: 'ph:n', unit: 1 },
  { item: 'w:pin', unit: 1 },
  { item: 'w:tap', unit: 1 },
  { item: 'ph:k', unit: 2 },
  { item: 'ph:m', unit: 2 },
  { item: 'w:hen', unit: 2 },
  { item: 'w:map', unit: 2 },
] as const;

export function buildPlacement(rng: Rng = Math.random): Step[] {
  const learned = LESSONS.filter((l) => l.unit <= 2).flatMap((l) => l.introduces);
  const ctx = contextFor(learned, 2, rng, 2);
  // Placement always shows letters and words so it tests reading, not listening.
  ctx.rng = rng;
  return PLACEMENT_ITEMS.flatMap(({ item }) => {
    if (item.startsWith('ph:')) return letterPick(item.slice(3), ctx) ?? [];
    const w = wordById(item.slice(2));
    return w ? (wordPick(w, ctx, true) ?? []) : [];
  });
}

/** 3 stars for a near-perfect run, always at least 1 so finishing is rewarded. */
export function starsFor(mistakes: number): 1 | 2 | 3 {
  if (mistakes <= 1) return 3;
  if (mistakes <= 3) return 2;
  return 1;
}
