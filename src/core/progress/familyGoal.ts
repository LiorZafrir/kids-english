import type { FamilyGoal, Profile } from '@/features/profiles/types';
import { weekStartKey } from './applySession';

export const GOAL_BONUS_STARS = 10;

const total = (profiles: Profile[]) => profiles.reduce((n, p) => n + p.totalStarsEarned, 0);

/** Starts a fresh goal week when the calendar week changed; otherwise returns the goal as is. */
export function rollGoal(goal: FamilyGoal, profiles: Profile[], now: number): FamilyGoal {
  const week = weekStartKey(now);
  if (goal.weekStart === week) return goal;
  return { ...goal, weekStart: week, baseline: total(profiles), claimed: false };
}

export function goalProgress(goal: FamilyGoal, profiles: Profile[]): number {
  return Math.max(0, total(profiles) - goal.baseline);
}

export function goalReached(goal: FamilyGoal, profiles: Profile[]): boolean {
  return goalProgress(goal, profiles) >= goal.target;
}
