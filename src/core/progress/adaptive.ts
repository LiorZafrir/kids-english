/** How many wrong options to show (1 to 3), tuned to the child's recent accuracy. */
export function distractorsFor(recent: boolean[]): 1 | 2 | 3 {
  const window = recent.slice(-20);
  if (window.length < 8) return 2;
  const accuracy = window.filter(Boolean).length / window.length;
  if (accuracy >= 0.9) return 3;
  if (accuracy < 0.6) return 1;
  return 2;
}

export function accuracyOf(recent: boolean[]): number | null {
  if (recent.length === 0) return null;
  return recent.filter(Boolean).length / recent.length;
}
