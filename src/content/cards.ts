import type { PictureId } from '@/content/phonics/types';

export type Rarity = 'common' | 'rare' | 'epic' | 'event';

export type CardArt =
  | { kind: 'picture'; id: PictureId }
  | { kind: 'monster'; id: MonsterId }
  /** Any illustration from public/art by file name. */
  | { kind: 'asset'; slug: string };

export type MonsterId = 'gloop' | 'spike' | 'zorb';

export interface CardDef {
  id: string;
  nameHe: string;
  rarity: Rarity;
  art: CardArt;
}

export const CARDS: CardDef[] = [
  { id: 'c-sun', nameHe: 'שמש חמה', rarity: 'common', art: { kind: 'picture', id: 'sun' } },
  { id: 'c-apple', nameHe: 'תפוח אדום', rarity: 'common', art: { kind: 'picture', id: 'apple' } },
  { id: 'c-tiger', nameHe: 'נמר', rarity: 'common', art: { kind: 'picture', id: 'tiger' } },
  { id: 'c-pig', nameHe: 'חזרזיר', rarity: 'common', art: { kind: 'picture', id: 'pig' } },
  { id: 'c-insect', nameHe: 'חרק', rarity: 'common', art: { kind: 'picture', id: 'insect' } },
  { id: 'c-cat', nameHe: 'חתול', rarity: 'common', art: { kind: 'picture', id: 'cat' } },
  { id: 'c-dog', nameHe: 'כלב', rarity: 'common', art: { kind: 'picture', id: 'dog' } },
  { id: 'c-hen', nameHe: 'תרנגולת', rarity: 'common', art: { kind: 'picture', id: 'hen' } },
  { id: 'r-gloop', nameHe: 'גלופ הדביק', rarity: 'rare', art: { kind: 'monster', id: 'gloop' } },
  { id: 'r-spike', nameHe: 'ספייק הקוצני', rarity: 'rare', art: { kind: 'monster', id: 'spike' } },
  {
    id: 'r-zorb',
    nameHe: 'זורב בעל שלוש העיניים',
    rarity: 'rare',
    art: { kind: 'monster', id: 'zorb' },
  },
  { id: 'e-hero', nameHe: 'חד קרן אגדי', rarity: 'epic', art: { kind: 'asset', slug: 'unicorn' } },
  {
    id: 'e-star',
    nameHe: 'כוכב הזהב',
    rarity: 'epic',
    art: { kind: 'asset', slug: 'glowing-star' },
  },
  {
    id: 'ev-winter',
    nameHe: 'פתית שלג',
    rarity: 'event',
    art: { kind: 'asset', slug: 'snowflake' },
  },
  {
    id: 'ev-spring',
    nameHe: 'פרח אביב',
    rarity: 'event',
    art: { kind: 'asset', slug: 'cherry-blossom' },
  },
  { id: 'ev-summer', nameHe: 'שמש קיץ', rarity: 'event', art: { kind: 'asset', slug: 'sun' } },
  {
    id: 'ev-autumn',
    nameHe: 'עלה סתווי',
    rarity: 'event',
    art: { kind: 'asset', slug: 'maple-leaf' },
  },
];

export function cardById(id: string): CardDef | undefined {
  return CARDS.find((c) => c.id === id);
}

const WEIGHTS: Record<Exclude<Rarity, 'event'>, number> = { common: 70, rare: 25, epic: 5 };

/**
 * Rolls one card. `eventCardId` is only offered while its event is on (40% of drops).
 * `boost` raises the chance of rare and epic (a won battle is better than a lesson).
 */
export function rollCard(rng: () => number, eventCardId?: string, boost = 0): CardDef {
  if (eventCardId && rng() < 0.4) {
    const ev = cardById(eventCardId);
    if (ev) return ev;
  }
  const epic = WEIGHTS.epic + boost / 2;
  const rare = WEIGHTS.rare + boost;
  const roll = rng() * (WEIGHTS.common + WEIGHTS.rare + WEIGHTS.epic + boost * 1.5);
  const rarity: Rarity = roll < epic ? 'epic' : roll < epic + rare ? 'rare' : 'common';
  const pool = CARDS.filter((c) => c.rarity === rarity);
  return pool[Math.floor(rng() * pool.length)] ?? (CARDS[0] as CardDef);
}
