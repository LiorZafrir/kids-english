import {
  KEYWORDS,
  LESSONS,
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

export type Option =
  | { kind: 'letter'; text: string }
  | { kind: 'picture'; id: PictureId }
  | { kind: 'word'; text: string }
  /** A speaker button: the child hears the sound and chooses it. */
  | { kind: 'sound'; phoneme: string };

export type SayRef = { phoneme: string } | { word: string };

export type PickStep = {
  type: 'pick';
  say?: SayRef;
  /** A word to read (text prompt). */
  show?: string;
  /** A picture the question is about. */
  showPicture?: PictureId;
  options: Option[];
  correct: number;
  /** SRS key: "ph:<sound>" or "w:<word>". */
  item: string;
  /** The English word behind the question, spelled out in a Word Penalty. */
  word: string;
};

export type Step =
  | { type: 'teach'; phoneme: string }
  | { type: 'blend'; word: string; sounds: string[]; letters: string[]; picture?: PictureId }
  | { type: 'build'; word: string; picture?: PictureId }
  | PickStep;

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

/** How alike two spellings are: shared first letter, last letter, middle. Confusable = good distractor. */
function similarity(a: string, b: string): number {
  let score = 0;
  if (a[0] === b[0]) score += 2;
  if (a.at(-1) === b.at(-1)) score += 2;
  for (let i = 1; i < a.length - 1; i++) if (b.includes(a[i] as string)) score += 1;
  return score;
}

function similarWords(word: WordDef, pool: WordDef[], n: number, rng: Rng): WordDef[] {
  return shuffle(
    pool.filter((w) => w.id !== word.id),
    rng,
  )
    .sort((x, y) => similarity(word.text, y.text) - similarity(word.text, x.text))
    .slice(0, n);
}

const withPicture = (words: WordDef[]) => words.filter((w) => w.picture);

// ---- question builders -------------------------------------------------------------------------

/** Hear a sound, pick the letter. */
function letterPick(phoneme: string, c: PickCtx): PickStep | null {
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

/** Hear a sound, pick the picture that starts with it. */
function picturePick(phoneme: string, c: PickCtx): PickStep | null {
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

/** See a picture, hear its word, pick the sound it starts with (speaker buttons, no reading). */
function soundOfPicture(phoneme: string, c: PickCtx): PickStep | null {
  const kw = KEYWORDS[phoneme];
  if (!kw) return null;
  const others = shuffle(
    c.learned.filter((p) => p !== phoneme),
    c.rng,
  )
    .slice(0, c.distractors)
    .map((p): Option => ({ kind: 'sound', phoneme: p }));
  if (others.length === 0) return null;
  return {
    type: 'pick',
    say: { word: kw.word },
    showPicture: kw.picture,
    ...mix({ kind: 'sound', phoneme }, others, c.rng),
    item: `ph:${phoneme}`,
    word: kw.word,
  };
}

function base(word: WordDef) {
  return { item: `w:${word.id}`, word: word.text };
}

/** Read a word, pick its picture. */
function readToPicture(word: WordDef, c: PickCtx): PickStep | null {
  if (!word.picture) return null;
  const others = shuffle(
    withPicture(c.words).filter((w) => w.id !== word.id),
    c.rng,
  )
    .slice(0, c.distractors)
    .map((w): Option => ({ kind: 'picture', id: w.picture as PictureId }));
  if (others.length === 0) return null;
  return {
    type: 'pick',
    show: word.text,
    ...mix({ kind: 'picture', id: word.picture }, others, c.rng),
    ...base(word),
  };
}

/** Hear a word, pick its picture. */
function listenToPicture(word: WordDef, c: PickCtx): PickStep | null {
  if (!word.picture) return null;
  const step = readToPicture(word, c);
  if (!step) return null;
  return { ...step, show: undefined, say: { word: word.id } };
}

/** Hear a word, pick the written word (confusable choices like pin / pan / pit). */
function listenToText(word: WordDef, c: PickCtx): PickStep | null {
  const others = similarWords(word, c.words, c.distractors, c.rng).map((w): Option => ({
    kind: 'word',
    text: w.text,
  }));
  if (others.length === 0) return null;
  return {
    type: 'pick',
    say: { word: word.id },
    ...mix({ kind: 'word', text: word.text }, others, c.rng),
    ...base(word),
  };
}

/** See a picture, pick its written word. */
function pictureToText(word: WordDef, c: PickCtx): PickStep | null {
  if (!word.picture) return null;
  const others = similarWords(word, c.words, c.distractors, c.rng).map((w): Option => ({
    kind: 'word',
    text: w.text,
  }));
  if (others.length === 0) return null;
  return {
    type: 'pick',
    showPicture: word.picture,
    ...mix({ kind: 'word', text: word.text }, others, c.rng),
    ...base(word),
  };
}

/** All question types that can be asked about a word for this learner. */
function wordQuestions(word: WordDef, c: PickCtx): PickStep[] {
  const list = c.reader
    ? [
        readToPicture(word, c),
        listenToPicture(word, c),
        listenToText(word, c),
        pictureToText(word, c),
      ]
    : [listenToPicture(word, c)];
  return list.filter((s): s is PickStep => s !== null);
}

/** One question for an SRS item id. Null when the item can't make a fair question. */
export function pickForItem(item: string, c: PickCtx): PickStep | null {
  if (item.startsWith('ph:')) {
    const ph = item.slice(3);
    const options = c.reader
      ? [letterPick(ph, c), picturePick(ph, c), soundOfPicture(ph, c)]
      : [picturePick(ph, c), soundOfPicture(ph, c)];
    const ok = options.filter((s): s is PickStep => s !== null);
    return ok[Math.floor(c.rng() * ok.length)] ?? null;
  }
  const word = wordById(item.slice(2));
  if (!word) return null;
  const qs = wordQuestions(word, c);
  return qs[Math.floor(c.rng() * qs.length)] ?? null;
}

export interface BuildOptions {
  distractors?: number;
}

/**
 * Builds the step list for a lesson: teach, then recognise (several formats per sound), a spiral
 * back to older sounds, then words (blend, then read / listen / spell).
 * Kindergarten never needs to read: only audio prompts and pictures.
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
  const ctx: PickCtx = {
    learned,
    words: decodableWords(learned),
    reader,
    rng,
    distractors: opts.distractors ?? 2,
  };
  const steps: Step[] = [];
  const ask = (s: PickStep | null): PickStep[] => (s ? [s] : []);

  steps.push(...def.introduces.map((phoneme): Step => ({ type: 'teach', phoneme })));

  // Recognition: every new sound in several formats, shuffled so the same sound is not asked twice in a row.
  const recognition: PickStep[] = [];
  def.introduces.forEach((p, i) => {
    if (reader) recognition.push(...ask(letterPick(p, ctx)));
    recognition.push(...ask(i % 2 === 0 ? picturePick(p, ctx) : soundOfPicture(p, ctx)));
    recognition.push(...ask(i % 2 === 0 ? soundOfPicture(p, ctx) : picturePick(p, ctx)));
  });
  steps.push(...shuffle(recognition, rng));

  // Spiral: a few older sounds come back.
  const older = shuffle(
    learned.filter((p) => !def.introduces.includes(p)),
    rng,
  ).slice(0, def.review ? 6 : 3);
  steps.push(
    ...older.flatMap((p) => {
      const item = pickForItem(`ph:${p}`, ctx);
      return item ? [item] : [];
    }),
  );

  // Words: blend, then two different tasks about the word.
  for (const wid of def.words) {
    const word = wordById(wid);
    if (!word) continue;
    if (!reader && !word.picture) continue;
    steps.push({
      type: 'blend',
      word: word.id,
      sounds: word.sounds,
      letters: lettersOf(word),
      picture: word.picture,
    });
    const tasks: Step[] = shuffle(wordQuestions(word, ctx), rng).slice(0, 1);
    if (reader) tasks.push({ type: 'build', word: word.text, picture: word.picture });
    steps.push(...tasks);
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
  const wordItems = grade === 'kg' ? [] : ctx.words.map((w) => `w:${w.id}`);
  // Words count double: reading whole words is the point of the arena.
  const items = [...learned.map((p) => `ph:${p}`), ...wordItems, ...wordItems];
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
  // Placement tests reading, so sounds are answered with letters and words are shown as text.
  return PLACEMENT_ITEMS.flatMap(({ item }) => {
    if (item.startsWith('ph:')) return letterPick(item.slice(3), ctx) ?? [];
    const w = wordById(item.slice(2));
    return w ? (readToPicture(w, ctx) ?? []) : [];
  });
}

/** 3 stars for a near-perfect run, always at least 1 so finishing is rewarded. */
export function starsFor(mistakes: number): 1 | 2 | 3 {
  if (mistakes <= 1) return 3;
  if (mistakes <= 3) return 2;
  return 1;
}
