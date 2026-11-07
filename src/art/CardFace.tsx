import { cardById, type CardDef, type Rarity } from '@/content/cards';
import { he } from '@/core/i18n/he';
import { Companion } from './Companion';
import { Monster } from './Monster';
import { Picture } from './Picture';
import { Star } from './Star';
import './card.css';

function Art({ card }: { card: CardDef }) {
  const a = card.art;
  if (a.kind === 'picture') return <Picture id={a.id} size={92} />;
  if (a.kind === 'monster') return <Monster id={a.id} size={96} />;
  if (a.kind === 'companion') return <Companion stage={a.stage} size={100} />;
  return (
    <span className="card-star" style={{ background: a.color }}>
      <Star size={56} />
    </span>
  );
}

const RARITY_HE: Record<Rarity, string> = {
  common: he.cards.common,
  rare: he.cards.rare,
  epic: he.cards.epic,
  event: he.cards.event,
};

/** A collectible card. `owned` 0 shows a locked silhouette. */
export function CardFace({ id, owned = 1 }: { id: string; owned?: number }) {
  const card = cardById(id);
  if (!card) return null;
  const locked = owned === 0;
  return (
    <figure className={`tcard tcard--${card.rarity}${locked ? ' tcard--locked' : ''}`}>
      <div className="tcard__art">
        <Art card={card} />
      </div>
      <figcaption>
        <span className="tcard__name">{locked ? '?' : card.nameHe}</span>
        <span className="tcard__rarity">{RARITY_HE[card.rarity]}</span>
      </figcaption>
      {owned > 1 && <span className="tcard__count">×{owned}</span>}
    </figure>
  );
}
