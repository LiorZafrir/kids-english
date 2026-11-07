import { Navigate, useNavigate } from 'react-router-dom';
import { useSession } from '@/app/store';
import { he } from '@/core/i18n/he';
import { Button } from '@/ui/Button';
import { ArenaHome } from './ArenaHome';
import { GardenHome } from './GardenHome';
import '@/features/profiles/profiles.css';

/** Home: Arena for readers, Magic Garden for the child who can't read yet (by profile world). */
export function Home() {
  const { profiles, activeProfileId, selectProfile } = useSession();
  const navigate = useNavigate();
  const profile = profiles.find((p) => p.id === activeProfileId);
  if (!profile) return <Navigate to="/" replace />;

  return (
    <>
      {profile.world === 'garden' ? (
        <GardenHome profile={profile} />
      ) : (
        <ArenaHome profile={profile} />
      )}
      <div className="page">
        <Button
          variant="secondary"
          style={{ width: '100%' }}
          onClick={() => {
            selectProfile(null);
            navigate('/');
          }}
        >
          {he.home.switchProfile}
        </Button>
      </div>
    </>
  );
}
