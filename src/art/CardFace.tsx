import { cardById, type CardDef, type Rarity } from '@/content/cards';
import { he } from '@/core/i18n/he';
import { Monster } from './Monster';
import { Art, Picture } from './Picture';
import './card.css';

function CardArt({ card }: { card: CardDef }) {
  const a = card.art;
  if (a.kind === 'picture') return <Picture id={a.id} size={92} />;
  if (a.kind === 'monster') return <Monster id={a.id} size={96} />;
  return <Art slug={a.slug} size={92} />;
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
        <CardArt card={card} />
      </div>
      <figcaption>
        <span className="tcard__name">{locked ? '?' : card.nameHe}</span>
        <span className="tcard__rarity">{RARITY_HE[card.rarity]}</span>
      </figcaption>
      {owned > 1 && <span className="tcard__count">×{owned}</span>}
    </figure>
  );
}
