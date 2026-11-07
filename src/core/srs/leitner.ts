/**
 * Leitner spaced repetition. Box 0 = due now; a correct first-try answer moves an item up a box
 * (longer wait), a miss sends it back to box 0.
 */
export interface SrsEntry {
  box: number;
  due: number;
}

export const DAY_MS = 86_400_000;
export const MAX_BOX = 5;
/** Days until the next review, by box. */
export const BOX_DAYS = [0, 1, 2, 4, 8, 16] as const;

export function reviewItem(entry: SrsEntry | undefined, correct: boolean, now: number): SrsEntry {
  const box = correct ? Math.min((entry?.box ?? 0) + 1, MAX_BOX) : 0;
  return { box, due: now + (BOX_DAYS[box] ?? 0) * DAY_MS };
}

/** Item ids due now, most overdue first. */
export function dueItems(srs: Record<string, SrsEntry>, now: number, limit = 6): string[] {
  return Object.entries(srs)
    .filter(([, e]) => e.due <= now)
    .sort((a, b) => a[1].due - b[1].due)
    .slice(0, limit)
    .map(([id]) => id);
}

/** Items missed last time and not yet answered right since (box 0), for the parent view. */
export function weakItems(srs: Record<string, SrsEntry>): string[] {
  return Object.entries(srs)
    .filter(([, e]) => e.box === 0)
    .map(([id]) => id);
}
