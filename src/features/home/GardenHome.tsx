import { useNavigate } from 'react-router-dom';
import { Avatar } from '@/art/Avatar';
import { Companion } from '@/art/Companion';
import { CardsIcon, WaterIcon } from '@/art/HomeIcons';
import { Lock } from '@/art/icons';
import { Art } from '@/art/Picture';
import { Star } from '@/art/Star';
import { LESSONS } from '@/content/phonics';
import { he } from '@/core/i18n/he';
import { dueItems } from '@/core/srs/leitner';
import type { Profile } from '@/features/profiles/types';
import { EventBanner, StatusPills } from './parts';
import '@/features/lessons/lessons.css';

/** A plant per lesson: a seedling while locked, a flower that blooms with the stars earned. */
const FLOWER = ['blossom', 'tulip', 'cherry-blossom', 'sunflower'];

function FlowerArt({ open, stars }: { open: boolean; stars: number }) {
  return <Art slug={open ? (FLOWER[Math.min(stars, 3)] ?? 'blossom') : 'seedling'} size={88} />;
}

/** Magic Garden home for a child who can't read: big pictures, no text needed to move around. */
export function GardenHome({ profile }: { profile: Profile }) {
  const navigate = useNavigate();
  const due = dueItems(profile.srs, Date.now()).length;

  return (
    <main className="page stack">
      <div className="card stack home-hero">
        <Avatar id={profile.avatar} size={96} />
        <h1>
          {he.home.hello}, {profile.name}!
        </h1>
        <StatusPills profile={profile} />
      </div>

      <EventBanner />

      <div className="garden-grid garden-grid--3">
        <button
          type="button"
          className="tile-big"
          onClick={() => navigate('/companion')}
          aria-label={he.home.companion}
        >
          <Companion stage={profile.companion.stage} equipped={profile.equipped} size={84} />
        </button>
        <button
          type="button"
          className="tile-big"
          disabled={due === 0}
          onClick={() => navigate('/review')}
          aria-label={he.home.water}
          style={{ opacity: due === 0 ? 0.5 : 1 }}
        >
          <WaterIcon size={72} />
          {due > 0 && <span className="badge">{due}</span>}
        </button>
        <button
          type="button"
          className="tile-big"
          onClick={() => navigate('/cards')}
          aria-label={he.home.cards}
        >
          <CardsIcon size={72} />
        </button>
      </div>

      <div className="garden-grid">
        {LESSONS.map((lesson, i) => {
          const prev = LESSONS[i - 1];
          const open = !prev || (profile.progress[prev.id] ?? 0) > 0;
          const best = profile.progress[lesson.id] ?? 0;
          return (
            <button
              key={lesson.id}
              type="button"
              className="flower"
              disabled={!open}
              onClick={() => navigate(`/lesson/${lesson.id}`)}
              aria-label={`${he.lesson.lessons} ${i + 1}${open ? '' : ` (${he.lesson.locked})`}`}
            >
              <FlowerArt open={open} stars={best} />
              {open ? (
                <span className="path__stars" aria-hidden="true">
                  {[1, 2, 3].map((n) => (
                    <span key={n} className={n <= best ? 'on' : ''}>
                      <Star size={20} />
                    </span>
                  ))}
                </span>
              ) : (
                <Lock size={22} />
              )}
            </button>
          );
        })}
      </div>
    </main>
  );
}
