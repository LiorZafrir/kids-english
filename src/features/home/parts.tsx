import { useSession } from '@/app/store';
import { Star } from '@/art/Star';
import { he } from '@/core/i18n/he';
import { activeEvent } from '@/core/progress/events';
import { goalProgress, goalReached, GOAL_BONUS_STARS } from '@/core/progress/familyGoal';
import { secondsToday } from '@/core/progress/applySession';
import type { Profile } from '@/features/profiles/types';
import { Button } from '@/ui/Button';
import './home.css';

export function EventBanner() {
  const event = activeEvent(new Date());
  if (!event) return null;
  return (
    <div className="event-banner" style={{ borderColor: event.color }}>
      <strong>{event.nameHe}</strong>
      <span>{he.events.bonus(event.bonusStars)}</span>
    </div>
  );
}

/** Shared family goal: every child's stars fill one bar; reaching it pays everyone. */
export function FamilyGoalCard() {
  const { profiles, settings, claimFamilyGoal } = useSession();
  const goal = settings.familyGoal;
  if (profiles.length < 2) return null;
  const done = goalProgress(goal, profiles);
  const pct = Math.min(100, Math.round((done / goal.target) * 100));
  const reached = goalReached(goal, profiles);
  return (
    <section className="card stack goal" aria-label={he.goal.title}>
      <h2>{he.goal.title}</h2>
      <div
        className="progress"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={goal.target}
        aria-valuenow={Math.min(done, goal.target)}
        style={{ width: '100%' }}
      >
        <div className="progress__bar" style={{ width: `${pct}%` }} />
      </div>
      <p className="muted">{he.goal.progress(Math.min(done, goal.target), goal.target)}</p>
      {reached && !goal.claimed && (
        <Button onClick={() => void claimFamilyGoal()}>{he.goal.claim(GOAL_BONUS_STARS)}</Button>
      )}
      {goal.claimed && <p className="bonus">{he.goal.claimed}</p>}
    </section>
  );
}

export function StatusPills({ profile }: { profile: Profile }) {
  const minutesLeft = Math.max(
    0,
    Math.ceil((profile.dailyLimitMin * 60 - secondsToday(profile, Date.now())) / 60),
  );
  return (
    <div className="row" style={{ justifyContent: 'center' }}>
      <span className="pill" aria-label={`${profile.stars} ${he.profiles.stars}`}>
        <Star size={22} /> {profile.stars}
      </span>
      {profile.streak.current > 0 && (
        <span className="pill">{he.home.streak(profile.streak.current)}</span>
      )}
      <span className="pill">{he.home.minutesLeft(minutesLeft)}</span>
    </div>
  );
}
