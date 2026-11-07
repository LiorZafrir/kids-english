import { useMemo, useState } from 'react';
import { Speaker } from '@/art/icons';
import { play } from '@/core/audio/player';
import { resolveWord } from '@/core/audio/resolver';
import { he } from '@/core/i18n/he';
import { Ltr } from '@/core/i18n/Ltr';
import { shuffle } from '@/features/lessons/buildLesson';
import '@/features/lessons/lessons.css';
import './battle.css';

interface Props {
  word: string;
  onDone: () => void;
}

const FILLERS = 'aeioustnpmrk'.split('');

/**
 * The Word Penalty: after a miss the child spells the word from letter tiles twice,
 * first with the word in view, then from memory (hearing it only).
 */
export function WordPenalty({ word, onDone }: Props) {
  const [round, setRound] = useState<1 | 2>(1);
  const [typed, setTyped] = useState('');
  const [shake, setShake] = useState(false);

  const tiles = useMemo(() => {
    const extra = shuffle(FILLERS.filter((l) => !word.includes(l))).slice(0, 2);
    return shuffle([...word.split(''), ...extra]).map((letter, id) => ({ id, letter }));
  }, [word, round]); // eslint-disable-line react-hooks/exhaustive-deps
  const [used, setUsed] = useState<number[]>([]);

  const say = () => void play(resolveWord(word, word));

  const tap = (id: number, letter: string) => {
    if (used.includes(id)) return;
    if (letter !== word[typed.length]) {
      setShake(true);
      setTimeout(() => setShake(false), 300);
      return;
    }
    const next = typed + letter;
    setUsed([...used, id]);
    setTyped(next);
    if (next === word) {
      setTimeout(() => {
        if (round === 1) {
          setRound(2);
          setTyped('');
          setUsed([]);
          say();
        } else {
          onDone();
        }
      }, 450);
    }
  };

  return (
    <div className="penalty" role="dialog" aria-modal="true" aria-label={he.battle.penaltyTitle}>
      <div className="card stack step penalty__box">
        <h2>{he.battle.penaltyTitle}</h2>
        <p>{round === 1 ? he.battle.penaltyCopy : he.battle.penaltyMemory}</p>
        {round === 1 ? (
          <Ltr as="p" className="show-word">
            {word}
          </Ltr>
        ) : (
          <button type="button" className="listen" onClick={say} aria-label={he.lesson.listenAgain}>
            <Speaker size={36} />
          </button>
        )}
        <div className={`slots${shake ? ' slots--shake' : ''}`} dir="ltr" aria-live="polite">
          {word.split('').map((_, i) => (
            <span key={i} className={`slot${typed[i] ? ' slot--on' : ''}`}>
              {typed[i] ?? ''}
            </span>
          ))}
        </div>
        <div className="tiles" dir="ltr">
          {tiles.map((t) => (
            <button
              key={t.id}
              type="button"
              className="tile tile--sm"
              disabled={used.includes(t.id)}
              onClick={() => tap(t.id, t.letter)}
            >
              {t.letter}
            </button>
          ))}
        </div>
        <p className="penalty__round">{he.battle.penaltyRound(round)}</p>
      </div>
    </div>
  );
}
