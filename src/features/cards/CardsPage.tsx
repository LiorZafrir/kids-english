import { Navigate, useNavigate } from 'react-router-dom';
import { useSession } from '@/app/store';
import { CardFace } from '@/art/CardFace';
import { CARDS } from '@/content/cards';
import { he } from '@/core/i18n/he';
import { Button } from '@/ui/Button';
import '@/features/lessons/lessons.css';
import './cards.css';

export function CardsPage() {
  const navigate = useNavigate();
  const profile = useSession((s) => s.profiles.find((p) => p.id === s.activeProfileId));
  if (!profile) return <Navigate to="/" replace />;
  const owned = CARDS.filter((c) => (profile.cards[c.id] ?? 0) > 0).length;

  return (
    <main className="page stack">
      <h1>{he.cards.title}</h1>
      <p>{he.cards.collected(owned, CARDS.length)}</p>
      <div className="card-grid">
        {CARDS.map((c) => (
          <CardFace key={c.id} id={c.id} owned={profile.cards[c.id] ?? 0} />
        ))}
      </div>
      <Button variant="secondary" onClick={() => navigate('/home')}>
        {he.lesson.backHome}
      </Button>
    </main>
  );
}
