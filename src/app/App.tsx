import { useEffect } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { setMuted } from '@/core/audio/player';
import { he } from '@/core/i18n/he';
import { Button } from '@/ui/Button';
import { Battle } from '@/features/battle/Battle';
import { CardsPage } from '@/features/cards/CardsPage';
import { CompanionPage } from '@/features/companion/CompanionPage';
import { LessonPlayer } from '@/features/lessons/LessonPlayer';
import { Placement } from '@/features/placement/Placement';
import { ReviewPlayer } from '@/features/review/ReviewPlayer';
import { StoryList, StoryReader } from '@/features/story/Story';
import { AuthScreen } from '@/features/auth/AuthScreen';
import { Home } from '@/features/home/Home';
import { ParentGate } from '@/features/parent/ParentGate';
import { CreateProfile } from '@/features/profiles/CreateProfile';
import { ProfilePicker } from '@/features/profiles/ProfilePicker';
import { useSession } from './store';

/** Applies world + contrast themes to <html> so CSS tokens switch globally. */
function useTheme() {
  const world = useSession((s) => s.profiles.find((p) => p.id === s.activeProfileId)?.world);
  const highContrast = useSession((s) => s.settings.highContrast);
  useEffect(() => {
    const root = document.documentElement;
    if (world) root.dataset.world = world;
    else delete root.dataset.world;
    if (highContrast) root.dataset.contrast = 'high';
    else delete root.dataset.contrast;
  }, [world, highContrast]);
}

export function App() {
  const { status, boot, loadError, signOut } = useSession();
  useEffect(() => {
    void boot();
  }, [boot]);
  useTheme();
  const muted = useSession((s) => s.settings.muted);
  useEffect(() => setMuted(muted), [muted]);

  if (status === 'booting') return <p className="page">{he.common.loading}</p>;
  if (status === 'signed-out') return <AuthScreen />;
  if (status === 'error') {
    return (
      <main className="page stack">
        <div className="card stack">
          <h1>{he.loadError.title}</h1>
          <p>{he.loadError.hints[loadError ?? ''] ?? he.loadError.generic}</p>
          <p dir="ltr" className="muted">
            {loadError}
          </p>
          <Button onClick={() => location.reload()}>{he.loadError.retry}</Button>
          <Button variant="secondary" onClick={() => void signOut()}>
            {he.auth.signOut}
          </Button>
        </div>
      </main>
    );
  }

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<ProfilePicker />} />
        <Route path="/profiles/new" element={<CreateProfile />} />
        <Route path="/home" element={<Home />} />
        <Route path="/lesson/:lessonId" element={<LessonPlayer />} />
        <Route path="/review" element={<ReviewPlayer />} />
        <Route path="/placement" element={<Placement />} />
        <Route path="/battle" element={<Battle />} />
        <Route path="/cards" element={<CardsPage />} />
        <Route path="/companion" element={<CompanionPage />} />
        <Route path="/story" element={<StoryList />} />
        <Route path="/story/:chapterId" element={<StoryReader />} />
        <Route path="/parent" element={<ParentGate />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
