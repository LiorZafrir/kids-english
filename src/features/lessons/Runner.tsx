import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '@/app/store';
import { ArrowForward, Speaker } from '@/art/icons';
import { Star } from '@/art/Star';
import { stopAudio } from '@/core/audio/player';
import { he } from '@/core/i18n/he';
import { Button } from '@/ui/Button';
import { CardFace } from '@/art/CardFace';
import type { FinishSummary } from '@/app/store';
import type { Step } from './buildLesson';
import { Blend, Pick, Teach } from './steps';
import './lessons.css';

export interface RunResult {
  mistakes: number;
  results: { item: string; firstTry: boolean }[];
  seconds: number;
}

interface RunnerProps {
  steps: Step[];
  onDone: (r: RunResult) => void;
  /** Where the back button goes. */
  backTo?: string;
}

/** Plays a list of steps: progress bar, mute, continue button. Reports totals at the end. */
export function Runner({ steps, onDone, backTo = '/home' }: RunnerProps) {
  const navigate = useNavigate();
  const { settings, updateSettings } = useSession();
  const [index, setIndex] = useState(0);
  const [solved, setSolved] = useState(false);
  const mistakes = useRef(0);
  const results = useRef<RunResult['results']>([]);
  const started = useRef(Date.now());
  const ended = useRef(false);

  useEffect(() => stopAudio, []);

  const step = steps[index];
  const canContinue = !step || step.type !== 'pick' || solved;

  const advance = () => {
    setSolved(false);
    if (index + 1 >= steps.length) {
      if (ended.current) return; // a double tap must not pay out twice
      ended.current = true;
      onDone({
        mistakes: mistakes.current,
        results: results.current,
        seconds: (Date.now() - started.current) / 1000,
      });
      return;
    }
    setIndex((i) => i + 1);
  };

  if (!step) return null;

  return (
    <main className="page stack">
      <header className="lesson-top">
        <Button variant="ghost" onClick={() => navigate(backTo)}>
          {he.common.back}
        </Button>
        <div
          className="progress"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={steps.length}
          aria-valuenow={index}
        >
          <div className="progress__bar" style={{ width: `${(index / steps.length) * 100}%` }} />
        </div>
        <button
          type="button"
          className="mute"
          aria-pressed={settings.muted}
          aria-label={settings.muted ? he.common.unmute : he.common.mute}
          onClick={() => void updateSettings({ muted: !settings.muted })}
        >
          <Speaker size={26} muted={settings.muted} />
        </button>
      </header>

      {step.type === 'teach' && <Teach key={index} phoneme={step.phoneme} />}
      {step.type === 'blend' && <Blend key={index} step={step} />}
      {step.type === 'pick' && (
        <Pick
          key={index}
          step={step}
          onWrong={() => (mistakes.current += 1)}
          onSolved={(firstTry) => {
            results.current.push({ item: step.item, firstTry });
            setSolved(true);
          }}
        />
      )}

      <Button big onClick={advance} disabled={!canContinue}>
        {index === steps.length - 1 ? he.lesson.finish : he.lesson.next} <ArrowForward />
      </Button>
    </main>
  );
}

interface DoneProps {
  title: string;
  stars: number;
  summary: FinishSummary | null;
  children?: ReactNode;
}

/** End-of-session reward screen: stars, event bonus, dropped card. */
export function DoneScreen({ title, stars, summary, children }: DoneProps) {
  return (
    <main className="page stack">
      <div className="card stack step done">
        <h1>{title}</h1>
        <div className="done__stars" role="img" aria-label={`${stars} ${he.profiles.stars}`}>
          {[1, 2, 3].map((n) => (
            <span key={n} className={n <= stars ? 'done__star done__star--on' : 'done__star'}>
              <Star size={64} />
            </span>
          ))}
        </div>
        <p>{he.lesson.starsEarned(stars)}</p>
        {summary && summary.bonusStars > 0 && (
          <p className="bonus">{he.events.bonus(summary.bonusStars)}</p>
        )}
        {summary && summary.cards.length > 0 && (
          <div className="drop">
            <p>{he.cards.newCard}</p>
            {summary.cards.map((id, i) => (
              <div key={`${id}${i}`} className="drop__card">
                <CardFace id={id} />
              </div>
            ))}
          </div>
        )}
      </div>
      {children}
    </main>
  );
}
