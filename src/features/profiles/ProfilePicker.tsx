import { Link, useNavigate } from 'react-router-dom';
import { useSession } from '@/app/store';
import { Avatar } from '@/art/Avatar';
import { Logo } from '@/art/Logo';
import { he } from '@/core/i18n/he';
import './profiles.css';

export function ProfilePicker() {
  const { profiles, selectProfile, mode } = useSession();
  const navigate = useNavigate();

  return (
    <main className="page">
      <header className="hero">
        <Logo />
        <h1 style={{ marginTop: 'var(--sp-4)' }}>{he.profiles.title}</h1>
      </header>
      <div className="profile-grid">
        {profiles.map((p) => (
          <button
            key={p.id}
            className="profile-tile"
            onClick={() => {
              selectProfile(p.id);
              navigate('/home');
            }}
          >
            <Avatar id={p.avatar} size={88} />
            <span>{p.name}</span>
          </button>
        ))}
        <Link to="/profiles/new" className="profile-tile profile-tile--add">
          <span aria-hidden="true" className="plus">
            +
          </span>
          <span>{he.profiles.add}</span>
        </Link>
      </div>
      <p>
        <Link to="/parent">{he.home.parent}</Link>
      </p>
      {mode === 'local' && <p className="banner">{he.mode.local}</p>}
    </main>
  );
}
