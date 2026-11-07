import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useSession } from '@/app/store';
import { Companion } from '@/art/Companion';
import { Star } from '@/art/Star';
import { SHOP, type ShopItem } from '@/content/shop';
import { he } from '@/core/i18n/he';
import { STAGE_XP } from '@/core/progress/applySession';
import { Button } from '@/ui/Button';
import type { CompanionStage } from '@/features/profiles/types';
import './companion.css';

const ORDER: CompanionStage[] = ['egg', 'baby', 'kid', 'hero'];

export function CompanionPage() {
  const navigate = useNavigate();
  const { profiles, activeProfileId, buyItem, equipItem } = useSession();
  const profile = profiles.find((p) => p.id === activeProfileId);
  const [note, setNote] = useState('');
  if (!profile) return <Navigate to="/" replace />;

  const { stage, xp } = profile.companion;
  const nextStage = ORDER[ORDER.indexOf(stage) + 1];
  const from = STAGE_XP[stage];
  const to = nextStage ? STAGE_XP[nextStage] : from;
  const pct = nextStage ? Math.round(((xp - from) / (to - from)) * 100) : 100;

  const buy = async (item: ShopItem) => {
    const ok = await buyItem(item.id);
    setNote(ok ? he.shop.bought : he.shop.notEnough);
  };

  return (
    <main className="page stack">
      <div className="card stack step companion-hero">
        <Companion stage={stage} equipped={profile.equipped} size={190} />
        <h1>{he.companion.name}</h1>
        <p>{he.companion.stage[stage]}</p>
        <div
          className="progress"
          role="progressbar"
          aria-label={he.companion.growth}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
          style={{ width: '100%' }}
        >
          <div className="progress__bar" style={{ width: `${pct}%` }} />
        </div>
        <p className="muted">
          {nextStage
            ? he.companion.toNext(to - xp, he.companion.stage[nextStage])
            : he.companion.max}
        </p>
      </div>

      <div className="row" style={{ justifyContent: 'space-between' }}>
        <h2 style={{ margin: 0 }}>{he.shop.title}</h2>
        <span className="pill" aria-label={`${profile.stars} ${he.profiles.stars}`}>
          <Star size={22} /> {profile.stars}
        </span>
      </div>
      <p role="status" aria-live="polite" className="muted">
        {note || ' '}
      </p>
      <ul className="shop">
        {SHOP.map((item) => {
          const owned = profile.inventory.includes(item.id);
          const worn = profile.equipped[item.slot] === item.id;
          return (
            <li key={item.id} className="shop__item">
              <span className="shop__name">
                {item.nameHe}
                <small>{item.slot === 'hat' ? he.shop.hat : he.shop.extra}</small>
              </span>
              {owned ? (
                <Button
                  variant={worn ? 'secondary' : 'primary'}
                  onClick={() => void equipItem(item.slot, worn ? null : item.id)}
                  aria-pressed={worn}
                >
                  {worn ? he.shop.takeOff : he.shop.wear}
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  disabled={profile.stars < item.price}
                  onClick={() => void buy(item)}
                >
                  <Star size={18} /> {item.price}
                </Button>
              )}
            </li>
          );
        })}
      </ul>
      <Button variant="secondary" onClick={() => navigate('/home')}>
        {he.lesson.backHome}
      </Button>
    </main>
  );
}
