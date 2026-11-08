import { useState } from 'react';
import { he } from '@/core/i18n/he';
import { SpellWord } from './SpellWord';
import './battle.css';

interface Props {
  word: string;
  onDone: () => void;
}

/**
 * The Word Penalty: after a miss the child spells the word from letter tiles twice,
 * first with the word in view, then from memory (hearing it only).
 */
export function WordPenalty({ word, onDone }: Props) {
  const [round, setRound] = useState<1 | 2>(1);
  return (
    <div className="penalty" role="dialog" aria-modal="true" aria-label={he.battle.penaltyTitle}>
      <div className="card stack step penalty__box">
        <h2>{he.battle.penaltyTitle}</h2>
        <p>{round === 1 ? he.battle.penaltyCopy : he.battle.penaltyMemory}</p>
        <SpellWord
          key={round}
          word={word}
          mode={round === 1 ? 'see' : 'hear'}
          onDone={() => (round === 1 ? setRound(2) : onDone())}
        />
        <p className="penalty__round">{he.battle.penaltyRound(round)}</p>
      </div>
    </div>
  );
}
