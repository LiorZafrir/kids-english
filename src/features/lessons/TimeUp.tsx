import { useNavigate } from 'react-router-dom';
import { Companion } from '@/art/Companion';
import { useSession } from '@/app/store';
import { he } from '@/core/i18n/he';
import { Button } from '@/ui/Button';

/** Shown when today's daily limit (set by a parent) is used up. */
export function TimeUp() {
  const navigate = useNavigate();
  const profile = useSession((s) => s.profiles.find((p) => p.id === s.activeProfileId));
  return (
    <main className="page stack">
      <div className="card stack step">
        <Companion stage={profile?.companion.stage ?? 'egg'} equipped={profile?.equipped} />
        <h1>{he.limit.title}</h1>
        <p>{he.limit.body}</p>
      </div>
      <Button onClick={() => navigate('/home')}>{he.lesson.backHome}</Button>
    </main>
  );
}
