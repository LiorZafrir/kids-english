import { LESSONS } from '@/content/phonics';
import type { Profile } from '@/features/profiles/types';

export const UNIT1_PASS = 4; // of 5 questions
export const UNIT2_PASS = 3; // of 4 questions

/**
 * Turns placement scores into progress: a passed unit counts as done (2 stars each),
 * so a strong reader starts further along. Unit 2 only counts once unit 1 is passed.
 */
export function applyPlacement(p: Profile, unit1Correct: number, unit2Correct: number): Profile {
  const pass1 = unit1Correct >= UNIT1_PASS;
  const pass2 = pass1 && unit2Correct >= UNIT2_PASS;
  const progress = { ...p.progress };
  for (const l of LESSONS) {
    const passed = (l.unit === 1 && pass1) || (l.unit === 2 && pass2);
    if (passed) progress[l.id] = Math.max(progress[l.id] ?? 0, 2);
  }
  return { ...p, progress, placed: true };
}
