import { useId } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar } from '@/art/Avatar';
import { Companion } from '@/art/Companion';
import { Lock } from '@/art/icons';
import { Star } from '@/art/Star';
import { LESSONS } from '@/content/phonics';
import { he } from '@/core/i18n/he';
import { dueItems } from '@/core/srs/leitner';
import type { Profile } from '@/features/profiles/types';
import { EventBanner, StatusPills } from './parts';
import '@/features/lessons/lessons.css';

/** A flower per lesson: closed bud when locked, bloom colored by how well it went. */
function FlowerArt({ open, stars, n }: { open: boolean; stars: number; n: number }) {
  const uid = useId();
  const petal =
    stars >= 3 ? '#fbbf24' : stars === 2 ? '#f472b6' : stars === 1 ? '#c084fc' : '#f9a8d4';
  return (
    <svg width="96" height="96" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id={`${uid}f`} cx="0.4" cy="0.3" r="0.9">
          <stop offset="0" stopColor="#fff" stopOpacity=".85" />
          <stop offset="1" stopColor={open ? petal : '#cbd5e1'} />
        </radialGradient>
      </defs>
      <path d="M50 58v34" stroke="#16a34a" strokeWidth="6" strokeLinecap="round" />
      <path d="M50 80q-16-4-20-18 16 0 20 18zM50 74q16-4 20-18-16 0-20 18z" fill="#22c55e" />
      {open ? (
        Array.from({ length: 6 }, (_, i) => (
          <ellipse
            key={i}
            cx="50"
            cy="24"
            rx="11"
            ry="17"
            fill={`url(#${uid}f)`}
            transform={`rotate(${i * 60} 50 38)`}
          />
        ))
      ) : (
        <ellipse cx="50" cy="40" rx="15" ry="22" fill={`url(#${uid}f)`} />
      )}
      <circle
        cx="50"
        cy="38"
        r="11"
        fill={open ? '#fde047' : '#94a3b8'}
        stroke="#a16207"
        strokeWidth="1.5"
      />
      <text x="50" y="43" textAnchor="middle" fontSize="14" fontWeight="800" fill="#1e1b4b">
        {open ? n : ''}
      </text>
    </svg>
  );
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
          <svg width="72" height="72" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
            <path d="M22 44h44v34a10 10 0 01-10 10H32a10 10 0 01-10-10z" fill="#38bdf8" />
            <path d="M66 52h14a10 10 0 010 20H66" fill="none" stroke="#0284c7" strokeWidth="6" />
            <path d="M22 50L6 34" stroke="#0284c7" strokeWidth="7" strokeLinecap="round" />
            <ellipse cx="44" cy="44" rx="22" ry="5" fill="#7dd3fc" />
            <path d="M10 56c-4 8-4 12 0 12s4-4 0-12z" fill="#7dd3fc" />
            <ellipse cx="34" cy="62" rx="5" ry="10" fill="#fff" opacity=".35" />
          </svg>
          {due > 0 && <span className="badge">{due}</span>}
        </button>
        <button
          type="button"
          className="tile-big"
          onClick={() => navigate('/cards')}
          aria-label={he.home.cards}
        >
          <svg width="72" height="72" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
            <rect
              x="14"
              y="14"
              width="56"
              height="72"
              rx="10"
              fill="#f9a8d4"
              transform="rotate(-10 42 50)"
            />
            <rect
              x="30"
              y="12"
              width="56"
              height="72"
              rx="10"
              fill="#fde68a"
              transform="rotate(8 58 48)"
            />
            <path
              d="M58 30l5 10 11 1.500-8 8 2 11-10-5.500-10 5.500 2-11-8-8 11-1.500z"
              fill="#facc15"
              stroke="#a16207"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
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
              <FlowerArt open={open} stars={best} n={i + 1} />
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
