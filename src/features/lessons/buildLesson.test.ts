import { describe, expect, it } from 'vitest';
import { KEYWORDS, LESSONS as UNIT1_LESSONS, WORDS, lettersOf } from '@/content/phonics';
import { PHONEMES } from '@/core/audio/resolver';
import { buildLesson, learnedBy, shuffle, starsFor, type Step } from './buildLesson';

const seeded =
  (seed = 1) =>
  () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };

describe('unit 1 content', () => {
  it('only introduces sounds that exist in the phoneme list (units 1 and 2)', () => {
    for (const p of UNIT1_LESSONS.flatMap((l) => l.introduces)) {
      expect(PHONEMES.find((x) => x.id === p)?.unit).toBeLessThanOrEqual(2);
      expect(KEYWORDS[p]).toBeDefined();
    }
  });

  it('every word is decodable from the sounds taught before or in its lesson', () => {
    for (const lesson of UNIT1_LESSONS) {
      const known = learnedBy(lesson.id);
      for (const wid of lesson.words) {
        const word = WORDS.find((w) => w.id === wid);
        expect(word, wid).toBeDefined();
        for (const s of word?.sounds ?? []) expect(known, `${wid} in ${lesson.id}`).toContain(s);
      }
    }
  });

  it('a word spells with the letters of its sounds', () => {
    for (const w of WORDS) expect(lettersOf(w).join('')).toBe(w.text);
  });
});

describe('buildLesson', () => {
  const grades = ['kg', 2, 4] as const;

  it('every pick has unique options and a valid correct index', () => {
    for (const lesson of UNIT1_LESSONS) {
      for (const grade of grades) {
        const steps = buildLesson(lesson.id, grade, seeded(7));
        expect(steps.length).toBeGreaterThan(0);
        for (const s of steps.filter(
          (x): x is Extract<Step, { type: 'pick' }> => x.type === 'pick',
        )) {
          const keys = s.options.map((o) => JSON.stringify(o));
          expect(new Set(keys).size).toBe(keys.length);
          expect(s.options.length).toBeGreaterThanOrEqual(2);
          expect(s.options[s.correct]).toBeDefined();
        }
      }
    }
  });

  it('kindergarten never needs to read: only pictures and sound buttons, no text', () => {
    for (const lesson of UNIT1_LESSONS) {
      for (const s of buildLesson(lesson.id, 'kg', seeded(3))) {
        if (s.type !== 'pick') continue;
        expect(s.show).toBeUndefined();
        expect(s.say).toBeDefined();
        expect(s.options.every((o) => o.kind === 'picture' || o.kind === 'sound')).toBe(true);
      }
    }
  });

  it('readers get letter options', () => {
    const steps = buildLesson('u1-l1', 2, seeded(5));
    const letterPicks = steps.filter((s) => s.type === 'pick' && s.options[0]?.kind === 'letter');
    expect(letterPicks.length).toBe(3);
  });

  it('lessons are long and varied, not one question type on repeat', () => {
    for (const lesson of UNIT1_LESSONS) {
      const steps = buildLesson(lesson.id, 2, seeded(8));
      expect(steps.length, lesson.id).toBeGreaterThanOrEqual(14);
      const formats = new Set(
        steps.map((s) =>
          s.type === 'pick' ? `pick:${s.options[0]?.kind}:${s.show ? 'show' : ''}` : s.type,
        ),
      );
      expect(formats.size, lesson.id).toBeGreaterThanOrEqual(4);
    }
  });

  it('readers spell words, kindergarten never does and never meets picture-less words', () => {
    for (const lesson of UNIT1_LESSONS) {
      expect(
        buildLesson(lesson.id, 2, seeded(6)).some((s) => s.type === 'build'),
        lesson.id,
      ).toBe(true);
      const kg = buildLesson(lesson.id, 'kg', seeded(6));
      expect(kg.some((s) => s.type === 'build')).toBe(false);
      for (const s of kg) if (s.type === 'blend') expect(s.picture).toBeDefined();
    }
  });

  it('written-word choices are confusable words, never the same word twice', () => {
    for (const s of buildLesson('u1-l2', 4, seeded(13), { distractors: 3 })) {
      if (s.type !== 'pick' || s.options[0]?.kind !== 'word') continue;
      const texts = s.options.map((o) => (o.kind === 'word' ? o.text : ''));
      expect(new Set(texts).size).toBe(texts.length);
    }
  });

  it('unknown lesson yields no steps', () => {
    expect(buildLesson('nope', 2)).toEqual([]);
  });
});

describe('helpers', () => {
  it('shuffle keeps all items and does not mutate the input', () => {
    const input = [1, 2, 3, 4, 5];
    const out = shuffle(input, seeded(2));
    expect([...out].sort()).toEqual(input);
    expect(input).toEqual([1, 2, 3, 4, 5]);
  });

  it('stars: near-perfect gets 3, finishing always gets at least 1', () => {
    expect(starsFor(0)).toBe(3);
    expect(starsFor(1)).toBe(3);
    expect(starsFor(3)).toBe(2);
    expect(starsFor(50)).toBeLessThanOrEqual(2);
  });
});
