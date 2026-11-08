import { describe, expect, it } from 'vitest';
import { CARDS, rollCard } from '@/content/cards';
import { CHAPTERS, SIGHT } from '@/content/story';
import { learnedBy, LESSONS } from '@/content/phonics';
import { createProfile, withDefaults, type Profile } from '@/features/profiles/types';
import {
  buildBattle,
  buildPlacement,
  buildReview,
  PLACEMENT_ITEMS,
} from '@/features/lessons/buildLesson';
import { DAY_MS, dueItems, reviewItem, weakItems } from '@/core/srs/leitner';
import { distractorsFor } from './adaptive';
import { applySession, dayKey, stageFor, timeUp, weekStartKey } from './applySession';
import { activeEvent } from './events';
import { goalReached, rollGoal } from './familyGoal';
import { applyPlacement } from './placement';

const seeded =
  (seed = 1) =>
  () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };

const NOW = new Date(2026, 2, 4, 10, 0).getTime(); // 4 March 2026, a Wednesday
const fresh = (grade: Profile['grade'] = 2): Profile =>
  createProfile({ name: 'דנה', avatar: 'fox', grade, world: 'arena' }, 0, 'p1');

describe('leitner', () => {
  it('moves up on success, back to box 0 on a miss', () => {
    const a = reviewItem(undefined, true, NOW);
    expect(a.box).toBe(1);
    expect(a.due).toBe(NOW + DAY_MS);
    expect(reviewItem(a, true, NOW).box).toBe(2);
    expect(reviewItem({ box: 4, due: 0 }, false, NOW)).toEqual({ box: 0, due: NOW });
  });

  it('caps at the top box', () => {
    expect(reviewItem({ box: 5, due: 0 }, true, NOW).box).toBe(5);
  });

  it('lists due items oldest first and respects the limit', () => {
    const srs = {
      'ph:a': { box: 1, due: NOW + DAY_MS },
      'ph:b': { box: 0, due: NOW - 2000 },
      'ph:c': { box: 0, due: NOW - 5000 },
    };
    expect(dueItems(srs, NOW)).toEqual(['ph:c', 'ph:b']);
    expect(dueItems(srs, NOW, 1)).toEqual(['ph:c']);
  });

  it('weak items are the ones stuck in the low boxes', () => {
    expect(weakItems({ x: { box: 0, due: 0 }, y: { box: 3, due: 0 } })).toEqual(['x']);
  });
});

describe('applySession', () => {
  it('pays stars, saves best rating, updates srs, streak, usage and xp', () => {
    const p = applySession(
      fresh(),
      {
        progressKey: 'u1-l1',
        stars: 3,
        bonusStars: 1,
        results: [
          { item: 'ph:s', firstTry: true },
          { item: 'ph:a', firstTry: false },
        ],
        seconds: 90,
        xp: 15,
        cards: ['c-sun'],
      },
      NOW,
    );
    expect(p.stars).toBe(4);
    expect(p.totalStarsEarned).toBe(4);
    expect(p.progress['u1-l1']).toBe(3);
    expect(p.srs['ph:s']?.box).toBe(1);
    expect(p.srs['ph:a']?.box).toBe(0);
    expect(p.recent).toEqual([true, false]);
    expect(p.streak).toEqual({ current: 1, best: 1, lastDay: dayKey(NOW) });
    expect(p.usage[dayKey(NOW)]).toBe(90);
    expect(p.companion).toEqual({ stage: 'baby', xp: 15 });
    expect(p.cards['c-sun']).toBe(1);
  });

  it('never lowers a best rating', () => {
    const a = applySession(
      fresh(),
      { progressKey: 'l', stars: 3, results: [], seconds: 0, xp: 0 },
      NOW,
    );
    const b = applySession(a, { progressKey: 'l', stars: 1, results: [], seconds: 0, xp: 0 }, NOW);
    expect(b.progress.l).toBe(3);
  });

  it('streak: same day keeps, next day grows, a gap resets', () => {
    const s = { stars: 1, results: [], seconds: 0, xp: 0 };
    const day1 = applySession(fresh(), s, NOW);
    expect(applySession(day1, s, NOW + 3600_000).streak.current).toBe(1);
    const day2 = applySession(day1, s, NOW + DAY_MS);
    expect(day2.streak).toMatchObject({ current: 2, best: 2 });
    const gap = applySession(day2, s, NOW + 4 * DAY_MS);
    expect(gap.streak).toMatchObject({ current: 1, best: 2 });
  });

  it('keeps only the last 30 answers', () => {
    const results = Array.from({ length: 40 }, () => ({ item: 'ph:s', firstTry: true }));
    const p = applySession(fresh(), { stars: 0, results, seconds: 0, xp: 0 }, NOW);
    expect(p.recent).toHaveLength(30);
  });

  it('counts won battles', () => {
    const p = applySession(fresh(), { stars: 2, results: [], seconds: 0, xp: 15, won: true }, NOW);
    expect(p.battlesWon).toBe(1);
  });

  it('companion stages follow xp thresholds', () => {
    expect(stageFor(0)).toBe('egg');
    expect(stageFor(15)).toBe('baby');
    expect(stageFor(60)).toBe('kid');
    expect(stageFor(150)).toBe('hero');
  });

  it('daily limit: time up once seconds reach the limit', () => {
    const p = { ...fresh(), dailyLimitMin: 1, usage: { [dayKey(NOW)]: 59 } };
    expect(timeUp(p, NOW)).toBe(false);
    expect(timeUp({ ...p, usage: { [dayKey(NOW)]: 60 } }, NOW)).toBe(true);
    expect(timeUp({ ...p, usage: { [dayKey(NOW)]: 600 } }, NOW + DAY_MS)).toBe(false);
  });
});

describe('profile defaults', () => {
  it('fills new fields on an old saved profile', () => {
    const old = {
      ...fresh(),
      srs: undefined,
      cards: undefined,
      usage: undefined,
    } as unknown as Profile;
    const p = withDefaults(old);
    expect(p.srs).toEqual({});
    expect(p.cards).toEqual({});
    expect(p.equipped).toEqual({ hat: null, extra: null });
  });

  it('readers must place, kindergarten does not', () => {
    expect(fresh(2).placed).toBe(false);
    expect(fresh('kg').placed).toBe(true);
  });
});

describe('adaptive difficulty', () => {
  it('stays at 2 until there is enough data', () => {
    expect(distractorsFor([true, true, true])).toBe(2);
  });
  it('goes harder when accurate and easier when struggling', () => {
    expect(distractorsFor(Array(20).fill(true))).toBe(3);
    expect(distractorsFor(Array(20).fill(false))).toBe(1);
    expect(distractorsFor([...Array(14).fill(true), ...Array(6).fill(false)])).toBe(2);
  });
});

describe('events', () => {
  it('finds the event by date, including a window across new year', () => {
    expect(activeEvent(new Date(2026, 3, 10))?.id).toBe('spring');
    expect(activeEvent(new Date(2026, 11, 20))?.id).toBe('winter');
    expect(activeEvent(new Date(2027, 0, 5))?.id).toBe('winter');
    expect(activeEvent(new Date(2026, 10, 5))).toBeNull();
  });
});

describe('family goal', () => {
  const goal = { weekStart: '', baseline: 0, target: 10, claimed: true };
  it('week starts on Monday', () => {
    expect(weekStartKey(NOW)).toBe('2026-03-02');
    expect(weekStartKey(new Date(2026, 2, 8, 23).getTime())).toBe('2026-03-02');
    expect(weekStartKey(new Date(2026, 2, 9).getTime())).toBe('2026-03-09');
  });
  it('rolls into a new week once and resets the claim', () => {
    const a = { ...fresh(), totalStarsEarned: 7 };
    const b = { ...fresh(), id: 'p2', totalStarsEarned: 5 };
    const rolled = rollGoal(goal, [a, b], NOW);
    expect(rolled).toMatchObject({ weekStart: '2026-03-02', baseline: 12, claimed: false });
    expect(rollGoal(rolled, [a, b], NOW + DAY_MS)).toBe(rolled);
  });
  it('is reached when the family together passes the target', () => {
    const g = { ...goal, baseline: 12, claimed: false };
    const a = { ...fresh(), totalStarsEarned: 15 };
    const b = { ...fresh(), id: 'p2', totalStarsEarned: 6 };
    expect(goalReached(g, [a, b])).toBe(false);
    expect(goalReached(g, [a, { ...b, totalStarsEarned: 7 }])).toBe(true);
  });
});

describe('placement', () => {
  it('a strong reader skips both units, a weak one skips none', () => {
    const strong = applyPlacement(fresh(), 5, 4);
    expect(LESSONS.every((l) => (strong.progress[l.id] ?? 0) >= 2)).toBe(true);
    expect(strong.placed).toBe(true);
    const weak = applyPlacement(fresh(), 2, 4);
    expect(weak.progress).toEqual({});
    expect(weak.placed).toBe(true);
  });
  it('unit 2 only counts once unit 1 is passed', () => {
    const p = applyPlacement(fresh(), 4, 1);
    expect(p.progress['u1-l1']).toBe(2);
    expect(p.progress['u2-l1']).toBeUndefined();
  });
  it('the quiz has one question per item and covers both units', () => {
    const steps = buildPlacement(seeded(4));
    expect(steps).toHaveLength(PLACEMENT_ITEMS.length);
    expect(PLACEMENT_ITEMS.filter((i) => i.unit === 1)).toHaveLength(5);
    expect(PLACEMENT_ITEMS.filter((i) => i.unit === 2)).toHaveLength(4);
  });
});

describe('session builders', () => {
  const learned = learnedBy('u2-l3');

  it('battle questions come only from learned content and kindergarten never reads', () => {
    for (const grade of ['kg', 2] as const) {
      const steps = buildBattle(learned, grade, 12, seeded(9));
      expect(steps.length).toBeGreaterThan(0);
      for (const s of steps) {
        if (s.type !== 'pick') throw new Error('battle must only ask questions');
        if (grade === 'kg')
          expect(s.options.every((o) => o.kind === 'picture' || o.kind === 'sound')).toBe(true);
      }
    }
  });

  it('review turns due item ids into questions and skips unknown ones', () => {
    const steps = buildReview(['ph:s', 'w:pin', 'ph:zzz', 'w:nope'], learned, 2, seeded(3));
    expect(steps.map((s) => (s.type === 'pick' ? s.item : ''))).toEqual(['ph:s', 'w:pin']);
  });

  it('every question knows the word it is about, for the Word Penalty', () => {
    for (const s of buildBattle(learned, 2, 12, seeded(2))) {
      if (s.type === 'pick') expect(s.word.length).toBeGreaterThan(1);
    }
  });
});

describe('cards', () => {
  it('rolls only existing cards and keeps events out unless asked', () => {
    const rng = seeded(11);
    const ids = new Set<string>();
    for (let i = 0; i < 400; i++) ids.add(rollCard(rng).id);
    for (const id of ids) expect(CARDS.some((c) => c.id === id)).toBe(true);
    expect([...ids].some((id) => id.startsWith('ev-'))).toBe(false);
  });
  it('offers the event card during an event', () => {
    const rng = seeded(5);
    let seen = false;
    for (let i = 0; i < 200; i++) if (rollCard(rng, 'ev-spring').id === 'ev-spring') seen = true;
    expect(seen).toBe(true);
  });
  it('boost makes rarer cards more likely', () => {
    const count = (boost: number) => {
      const rng = seeded(21);
      let rare = 0;
      for (let i = 0; i < 2000; i++)
        if (rollCard(rng, undefined, boost).rarity !== 'common') rare++;
      return rare;
    };
    expect(count(30)).toBeGreaterThan(count(0));
  });
});

describe('story', () => {
  it('every English line only uses taught letters or sight words', () => {
    for (const ch of CHAPTERS) {
      const graphemes = new Set(
        learnedBy(ch.unlockLesson).flatMap((s) => (s === 'k' ? ['c', 'k'] : [s])),
      );
      for (const page of ch.pages) {
        for (const word of page.en.toLowerCase().match(/[a-z]+/g) ?? []) {
          if (SIGHT.includes(word)) continue;
          for (const letter of word) {
            expect(graphemes.has(letter), `"${word}" in ${ch.id} uses untaught "${letter}"`).toBe(
              true,
            );
          }
        }
      }
    }
  });
});
