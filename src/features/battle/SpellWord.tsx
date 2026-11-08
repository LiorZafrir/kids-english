import { useEffect, useMemo, useState } from 'react';
import { Picture } from '@/art/Picture';
import { Speaker } from '@/art/icons';
import type { PictureId } from '@/content/phonics';
import { play } from '@/core/audio/player';
import { resolveWord } from '@/core/audio/resolver';
import { he } from '@/core/i18n/he';
import { Ltr } from '@/core/i18n/Ltr';
import { shuffle } from '@/features/lessons/buildLesson';
import '@/features/lessons/lessons.css';
import './battle.css';

interface Props {
  word: string;
  /** "see": the word is shown. "hear": only its sound (and picture) is given. */
  mode: 'see' | 'hear';
  picture?: PictureId;
  onWrong?: () => void;
  onDone: () => void;
}

const FILLERS = 'aeioustnpmrk'.split('');

/** Spell a word by tapping letter tiles in order. Wrong tiles shake and are not placed. */
export function SpellWord({ word, mode, picture, onWrong, onDone }: Props) {
  const [typed, setTyped] = useState('');
  const [used, setUsed] = useState<number[]>([]);
  const [shake, setShake] = useState(false);
  const say = () => void play(resolveWord(word, word));

  const tiles = useMemo(() => {
    const extra = shuffle(FILLERS.filter((l) => !word.includes(l))).slice(0, 2);
    return shuffle([...word.split(''), ...extra]).map((letter, id) => ({ id, letter }));
  }, [word]);

  useEffect(() => {
    if (mode === 'hear') say();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tap = (id: number, letter: string) => {
    if (used.includes(id)) return;
    if (letter !== word[typed.length]) {
      onWrong?.();
      setShake(true);
      setTimeout(() => setShake(false), 300);
      return;
    }
    const next = typed + letter;
    setUsed([...used, id]);
    setTyped(next);
    if (next === word) setTimeout(onDone, 450);
  };

  return (
    <div className="stack" style={{ alignItems: 'center' }}>
      {picture && <Picture id={picture} size={96} />}
      {mode === 'see' ? (
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
    </div>
  );
}
