import { reviewItem } from '@/core/srs/leitner';
import type { CompanionStage, Profile } from '@/features/profiles/types';

export interface SessionResult {
  /** Key written to profile.progress (lesson id or "story:<id>"). */
  progressKey?: string;
  /** Stars for the performance, also stored as the best rating. */
  stars: number;
  /** Extra stars from events or goals; never stored as a rating. */
  bonusStars?: number;
  results: { item: string; firstTry: boolean }[];
  seconds: number;
  xp: number;
  cards?: string[];
  won?: boolean;
}

export const STAGE_XP: Record<CompanionStage, number> = { egg: 0, baby: 15, kid: 60, hero: 150 };

export function stageFor(xp: number): CompanionStage {
  if (xp >= STAGE_XP.hero) return 'hero';
  if (xp >= STAGE_XP.kid) return 'kid';
  if (xp >= STAGE_XP.baby) return 'baby';
  return 'egg';
}

const pad = (n: number) => String(n).padStart(2, '0');

/** Local calendar day, YYYY-MM-DD. */
export function dayKey(ms: number): string {
  const d = new Date(ms);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Monday of the week containing `ms`, as a day key. */
export function weekStartKey(ms: number): string {
  const d = new Date(ms);
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return dayKey(d.getTime());
}

function nextStreak(streak: Profile['streak'], today: string, now: number): Profile['streak'] {
  if (streak.lastDay === today) return streak;
  const yesterday = dayKey(now - 86_400_000);
  const current = streak.lastDay === yesterday ? streak.current + 1 : 1;
  return { current, best: Math.max(streak.best, current), lastDay: today };
}

export const MAX_RECENT = 30;

/** Pure: applies one finished session (lesson, review, battle, story) to a profile. */
export function applySession(p: Profile, s: SessionResult, now: number): Profile {
  const today = dayKey(now);
  const gained = s.stars + (s.bonusStars ?? 0);

  const srs = { ...p.srs };
  for (const r of s.results) srs[r.item] = reviewItem(srs[r.item], r.firstTry, now);

  const progress = s.progressKey
    ? { ...p.progress, [s.progressKey]: Math.max(p.progress[s.progressKey] ?? 0, s.stars) }
    : p.progress;

  const cards = { ...p.cards };
  for (const id of s.cards ?? []) cards[id] = (cards[id] ?? 0) + 1;

  const xp = p.companion.xp + s.xp;
  return {
    ...p,
    stars: p.stars + gained,
    totalStarsEarned: p.totalStarsEarned + gained,
    progress,
    srs,
    recent: [...p.recent, ...s.results.map((r) => r.firstTry)].slice(-MAX_RECENT),
    cards,
    streak: nextStreak(p.streak, today, now),
    usage: { ...p.usage, [today]: (p.usage[today] ?? 0) + Math.max(0, Math.round(s.seconds)) },
    companion: { stage: stageFor(xp), xp },
    battlesWon: p.battlesWon + (s.won ? 1 : 0),
  };
}

export function secondsToday(p: Profile, now: number): number {
  return p.usage[dayKey(now)] ?? 0;
}

export function timeUp(p: Profile, now: number): boolean {
  return secondsToday(p, now) >= p.dailyLimitMin * 60;
}
