import { useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useSession, type FinishSummary } from '@/app/store';
import { learnedFromProgress } from '@/content/phonics';
import { he } from '@/core/i18n/he';
import { distractorsFor } from '@/core/progress/adaptive';
import { timeUp } from '@/core/progress/applySession';
import { dueItems } from '@/core/srs/leitner';
import { Button } from '@/ui/Button';
import { buildReview, starsFor } from '@/features/lessons/buildLesson';
import { DoneScreen, Runner, type RunResult } from '@/features/lessons/Runner';
import { TimeUp } from '@/features/lessons/TimeUp';

/** Daily review: only the items the Leitner boxes say are due now. */
export function ReviewPlayer() {
  const navigate = useNavigate();
  const { profiles, activeProfileId, finishSession } = useSession();
  const profile = profiles.find((p) => p.id === activeProfileId);
  const [done, setDone] = useState<{ stars: number; summary: FinishSummary | null } | null>(null);
  const [blocked] = useState(() => (profile ? timeUp(profile, Date.now()) : false));

  const steps = useMemo(() => {
    if (!profile) return [];
    const items = dueItems(profile.srs, Date.now());
    return buildReview(
      items,
      learnedFromProgress(profile.progress),
      profile.grade,
      Math.random,
      distractorsFor(profile.recent),
    );
  }, [profile?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!profile || (steps.length === 0 && !done)) return <Navigate to="/home" replace />;
  if (blocked && !done) return <TimeUp />;

  if (done) {
    return (
      <DoneScreen title={he.review.done} stars={done.stars} summary={done.summary}>
        <Button onClick={() => navigate('/home')}>{he.lesson.backHome}</Button>
      </DoneScreen>
    );
  }

  const finish = async (r: RunResult) => {
    const stars = starsFor(r.mistakes);
    const summary = await finishSession({
      stars,
      results: r.results,
      seconds: r.seconds,
      xp: 5,
      cardChance: 0.15,
    });
    setDone({ stars, summary });
  };

  return <Runner steps={steps} onDone={(r) => void finish(r)} />;
}
