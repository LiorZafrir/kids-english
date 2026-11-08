import { useNavigate } from 'react-router-dom';
import { useSession } from '@/app/store';
import { Avatar } from '@/art/Avatar';
import { Companion } from '@/art/Companion';
import { CardsIcon, ReviewIcon, StoryIcon } from '@/art/HomeIcons';
import { Lock } from '@/art/icons';
import { Monster } from '@/art/Monster';
import { Star } from '@/art/Star';
import { LESSONS } from '@/content/phonics';
import { he } from '@/core/i18n/he';
import { dueItems } from '@/core/srs/leitner';
import type { Profile } from '@/features/profiles/types';
import { Button } from '@/ui/Button';
import { EventBanner, FamilyGoalCard, StatusPills } from './parts';
import '@/features/lessons/lessons.css';

/** Battles need decodable words, so they open after the second lesson. */
const BATTLE_UNLOCK = 'u1-l2';

export function ArenaHome({ profile }: { profile: Profile }) {
  const navigate = useNavigate();
  const { patchProfile } = useSession();
  const due = dueItems(profile.srs, Date.now()).length;
  const battleOpen = (profile.progress[BATTLE_UNLOCK] ?? 0) > 0;
  const storyOpen = LESSONS.some((l) => (profile.progress[l.id] ?? 0) > 0);

  return (
    <main className="page stack">
      <div className="card home-hero home-hero--row">
        <Avatar id={profile.avatar} size={92} />
        <div className="stack" style={{ gap: 'var(--sp-2)' }}>
          <h1>
            {he.home.hello}, {profile.name}!
          </h1>
          <StatusPills profile={profile} />
        </div>
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

      <button
        type="button"
        className="battle-banner"
        disabled={!battleOpen}
        onClick={() => navigate('/battle')}
      >
        <span className="battle-banner__text">
          <strong>{he.home.battle}</strong>
          <small>{battleOpen ? he.home.battleHint : he.home.battleLocked}</small>
        </span>
        {battleOpen ? <Monster id="spike" size={92} /> : <Lock size={44} />}
      </button>

      <div className="actions">
        <button
          type="button"
          className="action"
          disabled={due === 0}
          onClick={() => navigate('/review')}
        >
          <ReviewIcon size={56} />
          <span>{he.home.review}</span>
          {due > 0 ? <span className="badge">{due}</span> : <small>{he.home.reviewNone}</small>}
        </button>
        <button
          type="button"
          className="action"
          disabled={!storyOpen}
          onClick={() => navigate('/story')}
        >
          <StoryIcon size={56} />
          <span>{he.home.story}</span>
        </button>
        <button type="button" className="action" onClick={() => navigate('/companion')}>
          <Companion stage={profile.companion.stage} equipped={profile.equipped} size={56} />
          <span>{he.home.companion}</span>
        </button>
        <button type="button" className="action" onClick={() => navigate('/cards')}>
          <CardsIcon size={56} />
          <span>{he.home.cards}</span>
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
