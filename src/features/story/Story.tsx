import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useSession, type FinishSummary } from '@/app/store';
import { ArrowForward, Lock, Speaker } from '@/art/icons';
import { Picture } from '@/art/Picture';
import { CHAPTERS, chapterById } from '@/content/story';
import { play } from '@/core/audio/player';
import { he } from '@/core/i18n/he';
import { Ltr } from '@/core/i18n/Ltr';
import { Button } from '@/ui/Button';
import { DoneScreen } from '@/features/lessons/Runner';
import '@/features/lessons/lessons.css';
import './story.css';

const unlocked = (progress: Record<string, number>, lesson: string) => (progress[lesson] ?? 0) > 0;

export function StoryList() {
  const navigate = useNavigate();
  const profile = useSession((s) => s.profiles.find((p) => p.id === s.activeProfileId));
  if (!profile || profile.grade === 'kg') return <Navigate to="/home" replace />;
  return (
    <main className="page stack">
      <h1>{he.story.title}</h1>
      <p>{he.story.intro}</p>
      <ol className="path">
        {CHAPTERS.map((c, i) => {
          const open = unlocked(profile.progress, c.unlockLesson);
          const read = (profile.progress[`story:${c.id}`] ?? 0) > 0;
          return (
            <li key={c.id}>
              <button
                type="button"
                className={`path__item${read ? ' path__item--done' : ''}`}
                disabled={!open}
                onClick={() => navigate(`/story/${c.id}`)}
              >
                <span className="path__num">{open ? i + 1 : <Lock />}</span>
                <span className="path__title">
                  {c.titleHe}
                  {!open && <span className="sr-only"> ({he.lesson.locked})</span>}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
      <Button variant="secondary" onClick={() => navigate('/home')}>
        {he.lesson.backHome}
      </Button>
    </main>
  );
}

export function StoryReader() {
  const { chapterId = '' } = useParams();
  const navigate = useNavigate();
  const { profiles, activeProfileId, finishSession } = useSession();
  const profile = profiles.find((p) => p.id === activeProfileId);
  const chapter = chapterById(chapterId);
  const [page, setPage] = useState(0);
  const [done, setDone] = useState<FinishSummary | null | false>(false);
  // Captured on entry: finishing updates progress, which must not change what we paid.
  const [alreadyRead] = useState(() => (profile?.progress[`story:${chapterId}`] ?? 0) > 0);

  if (!profile || !chapter || !unlocked(profile.progress, chapter.unlockLesson)) {
    return <Navigate to="/story" replace />;
  }

  if (done !== false) {
    return (
      <DoneScreen title={he.story.chapterDone} stars={alreadyRead ? 0 : 2} summary={done}>
        <Button big onClick={() => navigate('/story')}>
          {he.story.toList}
        </Button>
      </DoneScreen>
    );
  }

  const p = chapter.pages[page];
  if (!p) return <Navigate to="/story" replace />;
  const last = page === chapter.pages.length - 1;

  const finish = async () => {
    // Stars are paid once per chapter; re-reading is free practice.
    const summary = await finishSession({
      progressKey: `story:${chapter.id}`,
      stars: alreadyRead ? 0 : 2,
      results: [],
      seconds: 60,
      xp: alreadyRead ? 0 : 8,
      cardChance: alreadyRead ? 0 : 0.2,
    });
    setDone(summary);
  };

  return (
    <main className="page stack">
      <h1>{chapter.titleHe}</h1>
      <div className="card stack step story-page">
        <div className="story-art">
          {p.art.map((id) => (
            <Picture key={id} id={id} size={90} />
          ))}
        </div>
        <p>{p.he}</p>
        <Ltr as="p" className="story-en">
          {p.en.split(' ').map((w, i) => (
            <button
              key={`${w}${i}`}
              type="button"
              className="story-word"
              onClick={() => void play({ kind: 'tts', text: w.replace(/[^a-z]/gi, '') })}
            >
              {w}
            </button>
          ))}
        </Ltr>
        <Button variant="secondary" onClick={() => void play({ kind: 'tts', text: p.en })}>
          <Speaker size={22} /> {he.story.readAloud}
        </Button>
      </div>
      <Button big onClick={() => (last ? void finish() : setPage(page + 1))}>
        {last ? he.lesson.finish : he.lesson.next} <ArrowForward />
      </Button>
    </main>
  );
}
