import { useNavigate } from 'react-router-dom';
import { useSession } from '@/app/store';
import { Avatar } from '@/art/Avatar';
import { Heart, Lock, Sword } from '@/art/icons';
import { Star } from '@/art/Star';
import { LESSONS } from '@/content/phonics';
import { he } from '@/core/i18n/he';
import { dueItems } from '@/core/srs/leitner';
import type { Profile } from '@/features/profiles/types';
import { Button } from '@/ui/Button';
import { EventBanner, FamilyGoalCard, StatusPills } from './parts';
import '@/features/lessons/lessons.css';

/** Battles need decodable words, so they open after the third lesson. */
const BATTLE_UNLOCK = 'u1-l3';

export function ArenaHome({ profile }: { profile: Profile }) {
  const navigate = useNavigate();
  const { patchProfile } = useSession();
  const due = dueItems(profile.srs, Date.now()).length;
  const battleOpen = (profile.progress[BATTLE_UNLOCK] ?? 0) > 0;
  const storyOpen = LESSONS.some((l) => (profile.progress[l.id] ?? 0) > 0);

  return (
    <main className="page stack">
      <div className="card stack home-hero">
        <Avatar id={profile.avatar} size={110} />
        <h1>
          {he.home.hello}, {profile.name}!
        </h1>
        <StatusPills profile={profile} />
      </div>

      <EventBanner />

      {!profile.placed && (
        <section className="card stack">
          <h2>{he.placement.title}</h2>
          <p>{he.placement.body}</p>
          <Button onClick={() => navigate('/placement')}>{he.placement.start}</Button>
          <Button
            variant="ghost"
            onClick={() => void patchProfile(profile.id, (p) => ({ ...p, placed: true }))}
          >
            {he.placement.skip}
          </Button>
        </section>
      )}

      <div className="actions">
        <button
          type="button"
          className="action"
          disabled={!battleOpen}
          onClick={() => navigate('/battle')}
        >
          {battleOpen ? <Sword size={36} /> : <Lock size={36} />}
          {he.home.battle}
          {!battleOpen && <small>{he.home.battleLocked}</small>}
        </button>
        <button
          type="button"
          className="action"
          disabled={due === 0}
          onClick={() => navigate('/review')}
        >
          <Heart size={36} />
          {he.home.review}
          {due > 0 ? <span className="badge">{due}</span> : <small>{he.home.reviewNone}</small>}
        </button>
        <button
          type="button"
          className="action"
          disabled={!storyOpen}
          onClick={() => navigate('/story')}
        >
          <Star size={36} />
          {he.home.story}
        </button>
        <button type="button" className="action" onClick={() => navigate('/companion')}>
          <Star size={36} />
          {he.home.companion}
        </button>
        <button type="button" className="action" onClick={() => navigate('/cards')}>
          <Star size={36} />
          {he.home.cards}
        </button>
      </div>

      <FamilyGoalCard />

      <h2>{he.lesson.lessons}</h2>
      <ol className="path">
        {LESSONS.map((lesson, i) => {
          const prev = LESSONS[i - 1];
          const unlocked = !prev || (profile.progress[prev.id] ?? 0) > 0;
          const best = profile.progress[lesson.id] ?? 0;
          const newUnit = !prev || prev.unit !== lesson.unit;
          return (
            <li key={lesson.id}>
              {newUnit && <h3 className="unit-title">{he.lesson.unit(lesson.unit)}</h3>}
              <button
                type="button"
                className={`path__item${best > 0 ? ' path__item--done' : ''}`}
                disabled={!unlocked}
                onClick={() => navigate(`/lesson/${lesson.id}`)}
              >
                <span className="path__num">{unlocked ? i + 1 : <Lock />}</span>
                <span className="path__title">
                  {he.lesson.titles[lesson.id]}
                  {!unlocked && <span className="sr-only"> ({he.lesson.locked})</span>}
                </span>
                <span className="path__stars" aria-label={`${best} ${he.profiles.stars}`}>
                  {[1, 2, 3].map((n) => (
                    <span key={n} className={n <= best ? 'on' : ''}>
                      <Star size={22} />
                    </span>
                  ))}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </main>
  );
}
