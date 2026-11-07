import { DEFAULTS, type WorldId } from '@/config/app';
import type { SrsEntry } from '@/core/srs/leitner';

export type Grade = 'kg' | 2 | 4;

export const AVATAR_IDS = ['fox', 'owl', 'bear', 'bunny', 'cat', 'frog', 'panda', 'lion'] as const;
export type AvatarId = (typeof AVATAR_IDS)[number];

export type CompanionStage = 'egg' | 'baby' | 'kid' | 'hero';

export interface Profile {
  id: string;
  name: string;
  avatar: AvatarId;
  grade: Grade;
  world: WorldId;
  stars: number;
  totalStarsEarned: number;
  streak: { current: number; best: number; lastDay: string | null };
  dailyLimitMin: number;
  companion: { stage: CompanionStage; xp: number };
  /** Best star rating (1-3) per completed lesson id. */
  progress: Record<string, number>;
  /** Leitner state per practised item ("ph:s", "w:pin"). */
  srs: Record<string, SrsEntry>;
  /** Last answers (true = right on the first try), newest last. Drives adaptive difficulty. */
  recent: boolean[];
  /** Collected cards: card id to copies owned. */
  cards: Record<string, number>;
  /** Shop item ids owned. */
  inventory: string[];
  /** What the companion wears: slot to item id. */
  equipped: Record<string, string | null>;
  /** Seconds played per local day (YYYY-MM-DD). */
  usage: Record<string, number>;
  /** True once the placement quiz was taken or skipped. */
  placed: boolean;
  battlesWon: number;
  createdAt: number;
}

export interface FamilySettings {
  pinHash: string | null;
  pinSalt: string | null;
  muted: boolean;
  highContrast: boolean;
  /** Shared weekly goal for the whole family (co-op). */
  familyGoal: FamilyGoal;
}

export interface FamilyGoal {
  /** Monday of the current goal week, YYYY-MM-DD. */
  weekStart: string;
  /** Sum of every child's totalStarsEarned when the week began. */
  baseline: number;
  target: number;
  claimed: boolean;
}

export const DEFAULT_FAMILY_SETTINGS: FamilySettings = {
  pinHash: null,
  pinSalt: null,
  muted: false,
  highContrast: false,
  familyGoal: { weekStart: '', baseline: 0, target: 40, claimed: false },
};

export const MAX_NAME_LENGTH = 20;

/** Kindergarten defaults to the garden; older kids to the arena. The child may still pick. */
export function defaultWorldFor(grade: Grade): WorldId {
  return grade === 'kg' ? 'garden' : 'arena';
}

export interface NewProfileInput {
  name: string;
  avatar: AvatarId;
  grade: Grade;
  world: WorldId;
}

export type NameError = 'required' | 'tooLong' | null;

export function validateName(name: string): NameError {
  const trimmed = name.trim();
  if (!trimmed) return 'required';
  if (trimmed.length > MAX_NAME_LENGTH) return 'tooLong';
  return null;
}

export function createProfile(input: NewProfileInput, now = Date.now(), id = newId()): Profile {
  return {
    id,
    name: input.name.trim(),
    avatar: input.avatar,
    grade: input.grade,
    world: input.world,
    stars: 0,
    totalStarsEarned: 0,
    streak: { current: 0, best: 0, lastDay: null },
    dailyLimitMin: DEFAULTS.dailyLimitMin,
    companion: { stage: 'egg', xp: 0 },
    progress: {},
    srs: {},
    recent: [],
    cards: {},
    inventory: [],
    equipped: { hat: null, extra: null },
    usage: {},
    placed: input.grade === 'kg',
    battlesWon: 0,
    createdAt: now,
  };
}

/** Fills fields added after a profile was saved, so old data keeps working. */
export function withDefaults(p: Profile): Profile {
  const base = createProfile({
    name: p.name || 'x',
    avatar: p.avatar,
    grade: p.grade,
    world: p.world,
  });
  return {
    ...base,
    ...p,
    srs: p.srs ?? {},
    recent: p.recent ?? [],
    cards: p.cards ?? {},
    inventory: p.inventory ?? [],
    equipped: { hat: null, extra: null, ...p.equipped },
    usage: p.usage ?? {},
    progress: p.progress ?? {},
    placed: p.placed ?? p.grade === 'kg',
    battlesWon: p.battlesWon ?? 0,
  };
}

export function newId(): string {
  return crypto.randomUUID();
}
