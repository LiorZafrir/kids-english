/**
 * Seasonal events by calendar window (month/day, inclusive). While one is active every finished
 * session pays bonus stars and a limited card can drop. Add an event by adding a row.
 */
export interface SeasonEvent {
  id: string;
  nameHe: string;
  from: [month: number, day: number];
  to: [month: number, day: number];
  bonusStars: number;
  cardId: string;
  /** Banner accent color. */
  color: string;
}

export const EVENTS: SeasonEvent[] = [
  {
    id: 'winter',
    nameHe: 'פסטיבל החורף',
    from: [12, 1],
    to: [2, 10],
    bonusStars: 1,
    cardId: 'ev-winter',
    color: '#38bdf8',
  },
  {
    id: 'spring',
    nameHe: 'פריחת האביב',
    from: [3, 1],
    to: [4, 30],
    bonusStars: 1,
    cardId: 'ev-spring',
    color: '#f472b6',
  },
  {
    id: 'summer',
    nameHe: 'קיץ של מים',
    from: [6, 15],
    to: [8, 31],
    bonusStars: 1,
    cardId: 'ev-summer',
    color: '#fb923c',
  },
  {
    id: 'autumn',
    nameHe: 'קציר הסתיו',
    from: [9, 1],
    to: [10, 31],
    bonusStars: 1,
    cardId: 'ev-autumn',
    color: '#f59e0b',
  },
];

const ord = (m: number, d: number) => m * 100 + d;

/** The event running on `date`, if any. Windows may wrap over the new year. */
export function activeEvent(date: Date): SeasonEvent | null {
  const now = ord(date.getMonth() + 1, date.getDate());
  return (
    EVENTS.find((e) => {
      const from = ord(...e.from);
      const to = ord(...e.to);
      return from <= to ? now >= from && now <= to : now >= from || now <= to;
    }) ?? null
  );
}
