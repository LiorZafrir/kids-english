import { useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useSession, type FinishSummary } from '@/app/store';
import { ArrowForward } from '@/art/icons';
import { distractorsFor } from '@/core/progress/adaptive';
import { timeUp } from '@/core/progress/applySession';
import { he } from '@/core/i18n/he';
import { Button } from '@/ui/Button';
import { buildLesson, lessonById, nextLessonId, starsFor } from './buildLesson';
import { DoneScreen, Runner, type RunResult } from './Runner';
import { TimeUp } from './TimeUp';

export function LessonPlayer() {
  const { lessonId = '' } = useParams();
  const navigate = useNavigate();
  const { profiles, activeProfileId, finishSession } = useSession();
  const profile = profiles.find((p) => p.id === activeProfileId);
  const def = lessonById(lessonId);
  const grade = profile?.grade;
  const recent = profile?.recent;

  // Difficulty is fixed when the lesson starts, so it can't shift mid-lesson.
  const steps = useMemo(
    () =>
      grade
        ? buildLesson(lessonId, grade, Math.random, { distractors: distractorsFor(recent ?? []) })
        : [],
    [lessonId, grade], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const [done, setDone] = useState<{ stars: number; summary: FinishSummary | null } | null>(null);
  const [blocked] = useState(() => (profile ? timeUp(profile, Date.now()) : false));

  if (!profile || !def || steps.length === 0) return <Navigate to="/home" replace />;
  if (blocked && !done) return <TimeUp />;

  if (done) {
    const next = nextLessonId(lessonId);
    return (
      <DoneScreen title={he.lesson.done} stars={done.stars} summary={done.summary}>
        {next && (
          <Button big onClick={() => navigate(`/lesson/${next}`, { replace: true })}>
            {he.lesson.nextLesson} <ArrowForward />
          </Button>
        )}
        <Button variant="secondary" onClick={() => navigate('/home')}>
          {he.lesson.backHome}
        </Button>
      </DoneScreen>
    );
  }

  const finish = async (r: RunResult) => {
    const stars = starsFor(r.mistakes);
    const summary = await finishSession({
      progressKey: lessonId,
      stars,
      results: r.results,
      seconds: r.seconds,
      xp: stars * 5,
      cardChance: 0.3,
    });
    setDone({ stars, summary });
  };

  return <Runner steps={steps} onDone={(r) => void finish(r)} />;
}
