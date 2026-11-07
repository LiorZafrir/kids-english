import { useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useSession, type FinishSummary } from '@/app/store';
import { Avatar } from '@/art/Avatar';
import { ArrowForward, Heart } from '@/art/icons';
import { Monster, MONSTERS } from '@/art/Monster';
import { learnedFromProgress } from '@/content/phonics';
import { he } from '@/core/i18n/he';
import { distractorsFor } from '@/core/progress/adaptive';
import { timeUp } from '@/core/progress/applySession';
import { Button } from '@/ui/Button';
import { buildBattle, starsFor, type Step } from '@/features/lessons/buildLesson';
import { DoneScreen } from '@/features/lessons/Runner';
import { Pick } from '@/features/lessons/steps';
import { TimeUp } from '@/features/lessons/TimeUp';
import { stopAudio } from '@/core/audio/player';
import { WordPenalty } from './WordPenalty';
import './battle.css';

const HEARTS = 3;
const MONSTER_HP = 5;

type Pickstep = Extract<Step, { type: 'pick' }>;

export function Battle() {
  const navigate = useNavigate();
  const { profiles, activeProfileId, finishSession } = useSession();
  const profile = profiles.find((p) => p.id === activeProfileId);

  const [steps] = useState<Pickstep[]>(() =>
    profile
      ? buildBattle(
          learnedFromProgress(profile.progress),
          profile.grade,
          20,
          Math.random,
          distractorsFor(profile.recent),
        ).filter((s): s is Pickstep => s.type === 'pick')
      : [],
  );
  const monsterId = MONSTERS[(profile?.battlesWon ?? 0) % MONSTERS.length] ?? 'gloop';
  const [blocked] = useState(() => (profile ? timeUp(profile, Date.now()) : false));

  const [index, setIndex] = useState(0);
  const [hp, setHp] = useState(MONSTER_HP);
  const [hearts, setHearts] = useState(HEARTS);
  const [solved, setSolved] = useState(false);
  const [penalty, setPenalty] = useState<string | null>(null);
  const [hit, setHit] = useState(false);
  const [outcome, setOutcome] = useState<{
    won: boolean;
    stars: number;
    summary: FinishSummary | null;
  } | null>(null);

  const results = useRef<{ item: string; firstTry: boolean }[]>([]);
  const missedThisQuestion = useRef(false);
  const mistakes = useRef(0);
  const started = useRef(Date.now());
  const ended = useRef(false);

  useEffect(() => stopAudio, []);

  if (!profile || steps.length === 0) return <Navigate to="/home" replace />;
  if (blocked && !outcome) return <TimeUp />;

  const end = async (won: boolean) => {
    if (ended.current) return;
    ended.current = true;
    const stars = won ? starsFor(mistakes.current) : 1;
    const summary = await finishSession({
      stars,
      results: results.current,
      seconds: (Date.now() - started.current) / 1000,
      xp: won ? 15 : 3,
      won,
      cardChance: won ? 1 : 0,
      cardBoost: 20,
    });
    setOutcome({ won, stars, summary });
  };

  if (outcome) {
    return (
      <DoneScreen
        title={outcome.won ? he.battle.won : he.battle.lost}
        stars={outcome.stars}
        summary={outcome.summary}
      >
        {!outcome.won && <p>{he.battle.lostHint}</p>}
        <Button big onClick={() => navigate('/battle', { replace: true })} disabled={false}>
          {he.battle.again} <ArrowForward />
        </Button>
        <Button variant="secondary" onClick={() => navigate('/home')}>
          {he.lesson.backHome}
        </Button>
      </DoneScreen>
    );
  }

  const step = steps[index];
  // Enough questions are built for any fight (at most 7 can be asked); this is only a safety net.
  if (!step) return <Navigate to="/home" replace />;

  const next = () => {
    setSolved(false);
    missedThisQuestion.current = false;
    if (hp <= 0) {
      void end(true);
      return;
    }
    if (hearts <= 0) {
      void end(false);
      return;
    }
    setIndex((i) => i + 1);
  };

  return (
    <main className="page stack">
      <header className="lesson-top">
        <Button variant="ghost" onClick={() => navigate('/home')}>
          {he.common.back}
        </Button>
      </header>

      <div className="card arena">
        <div className="arena__side">
          <Avatar id={profile.avatar} size={72} />
          <div className="hearts" role="img" aria-label={he.battle.heartsLeft(hearts)}>
            {Array.from({ length: HEARTS }, (_, i) => (
              <Heart key={i} full={i < hearts} />
            ))}
          </div>
        </div>
        <span className="arena__vs" aria-hidden="true">
          VS
        </span>
        <div className="arena__side">
          <div className={hit ? 'monster--hit' : undefined}>
            <Monster id={monsterId} size={96} />
          </div>
          <div
            className="hp"
            role="progressbar"
            aria-label={he.battle.monsterHp}
            aria-valuemin={0}
            aria-valuemax={MONSTER_HP}
            aria-valuenow={Math.max(0, hp)}
          >
            <div
              className="hp__bar"
              style={{ width: `${(Math.max(0, hp) / MONSTER_HP) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <Pick
        key={index}
        step={step}
        quiet
        onWrong={() => {
          mistakes.current += 1;
          if (!missedThisQuestion.current) {
            missedThisQuestion.current = true;
            setHearts((h) => h - 1);
            setPenalty(step.word);
          }
        }}
        onSolved={(firstTry) => {
          results.current.push({ item: step.item, firstTry });
          setSolved(true);
          if (firstTry) {
            setHp((h) => h - 1);
            setHit(true);
            setTimeout(() => setHit(false), 450);
          }
        }}
      />

      <Button big onClick={next} disabled={!solved}>
        {hp <= 0 || hearts <= 0 ? he.lesson.finish : he.battle.nextQuestion} <ArrowForward />
      </Button>

      {penalty && <WordPenalty word={penalty} onDone={() => setPenalty(null)} />}
    </main>
  );
}
