import { useEffect, useMemo, useState } from 'react';
import { Check, Speaker } from '@/art/icons';
import { Picture } from '@/art/Picture';
import { KEYWORDS, WORDS, wordById } from '@/content/phonics';
import { PHONEMES, resolvePhoneme, resolveWord } from '@/core/audio/resolver';
import { play, playSequence } from '@/core/audio/player';
import { he } from '@/core/i18n/he';
import { Ltr } from '@/core/i18n/Ltr';
import { Button } from '@/ui/Button';
import { SpellWord } from '@/features/battle/SpellWord';
import type { Option, PickStep, SayRef, Step } from './buildLesson';
import './lessons.css';

export function sayRef(ref: SayRef) {
  if ('phoneme' in ref) return resolvePhoneme(ref.phoneme);
  return resolveWord(ref.word, wordById(ref.word)?.text ?? ref.word);
}

export function pictureLabel(id: string): string {
  return (
    WORDS.find((w) => w.picture === id)?.text ??
    Object.values(KEYWORDS).find((k) => k.picture === id)?.word ??
    id
  );
}

export function ListenButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button type="button" className="listen" onClick={onClick} aria-label={label}>
      <Speaker size={40} />
    </button>
  );
}

export function Teach({ phoneme }: { phoneme: string }) {
  const kw = KEYWORDS[phoneme];
  const grapheme = PHONEMES.find((p) => p.id === phoneme)?.grapheme ?? phoneme;
  const say = () => void play(resolvePhoneme(phoneme));
  useEffect(say, [phoneme]);
  return (
    <div className="card stack step teach">
      <h2>{he.lesson.teachTitle}</h2>
      <button type="button" className="letter-card" onClick={say} aria-label={he.lesson.tapToHear}>
        <Ltr as="span" className="letter-card__glyph">
          {grapheme}
        </Ltr>
        <Speaker size={30} />
      </button>
      {kw && (
        <div className="teach__kw">
          <Picture id={kw.picture} size={110} label={kw.word} />
          <Ltr as="span" className="teach__word">
            {kw.word}
          </Ltr>
        </div>
      )}
    </div>
  );
}

export function Blend({ step }: { step: Extract<Step, { type: 'blend' }> }) {
  const [lit, setLit] = useState<number | null>(null);
  const text = wordById(step.word)?.text ?? step.word;
  const wordAudio = () => resolveWord(step.word, text);
  return (
    <div className="card stack step">
      <h2>{he.lesson.blendTitle}</h2>
      <p>{he.lesson.blendHint}</p>
      <div className="tiles" dir="ltr">
        {step.sounds.map((s, i) => (
          <button
            key={`${s}${i}`}
            type="button"
            className={`tile${lit === i ? ' tile--lit' : ''}`}
            onClick={() => {
              setLit(i);
              void play(resolvePhoneme(s));
            }}
            aria-label={step.letters[i] ?? s}
          >
            {step.letters[i] ?? s}
          </button>
        ))}
      </div>
      <div className="row" style={{ justifyContent: 'center' }}>
        <Button
          variant="secondary"
          onClick={() =>
            void playSequence([...step.sounds.map((s) => resolvePhoneme(s)), wordAudio()], 350)
          }
        >
          <Speaker size={22} /> {he.lesson.blendAll}
        </Button>
        <Button variant="secondary" onClick={() => void play(wordAudio())}>
          <Speaker size={22} /> {he.lesson.hearWord}
        </Button>
      </div>
      <div className="teach__kw">
        {step.picture && <Picture id={step.picture} size={96} label={pictureLabel(step.picture)} />}
        <Ltr as="span" className="teach__word">
          {text}
        </Ltr>
      </div>
    </div>
  );
}

/** Spell the word from tiles; the child sees a picture (if any) and hears the word. */
export function Build({
  step,
  onWrong,
  onSolved,
}: {
  step: Extract<Step, { type: 'build' }>;
  onWrong: () => void;
  onSolved: (firstTry: boolean) => void;
}) {
  const [wrongs, setWrongs] = useState(0);
  return (
    <div className="card stack step">
      <h2>{he.lesson.spellTitle}</h2>
      <SpellWord
        word={step.word}
        mode="hear"
        picture={step.picture}
        onWrong={() => {
          setWrongs((n) => n + 1);
          onWrong();
        }}
        onDone={() => onSolved(wrongs === 0)}
      />
    </div>
  );
}

function OptionFace({ option, index }: { option: Option; index: number }) {
  switch (option.kind) {
    case 'letter':
      return (
        <Ltr as="span" className="opt__letter">
          {option.text}
        </Ltr>
      );
    case 'word':
      return (
        <Ltr as="span" className="opt__word">
          {option.text}
        </Ltr>
      );
    case 'sound':
      return (
        <>
          <Speaker size={44} />
          <span className="opt__num" aria-hidden="true">
            {index + 1}
          </span>
        </>
      );
    case 'picture':
      return <Picture id={option.id} size={76} label={pictureLabel(option.id)} />;
  }
}

export function promptFor(step: PickStep): string {
  const kinds = new Set(step.options.map((o) => o.kind));
  if (kinds.has('sound')) return he.lesson.whichSound;
  if (kinds.has('word'))
    return step.showPicture ? he.lesson.whichWordForPicture : he.lesson.whichWordHeard;
  if (step.show) return he.lesson.whichPictureForWord;
  if (step.say && 'phoneme' in step.say) {
    return kinds.has('letter') ? he.lesson.whichLetter : he.lesson.whichPicture;
  }
  return he.lesson.whichPictureForSound;
}

interface PickProps {
  step: PickStep;
  /** Called on every wrong tap. */
  onWrong: () => void;
  /** Called once when the right option is tapped; firstTry is true when nothing was missed. */
  onSolved: (firstTry: boolean) => void;
  /** Hides the "great" feedback line (battles show their own). */
  quiet?: boolean;
}

export function Pick({ step, onWrong, onSolved, quiet = false }: PickProps) {
  const [wrong, setWrong] = useState<number[]>([]);
  const [solved, setSolved] = useState(false);
  const say = useMemo(
    () => (step.say ? () => void play(sayRef(step.say as SayRef)) : null),
    [step],
  );
  useEffect(() => {
    say?.();
  }, [say]);

  const prompt = promptFor(step);

  const choose = (i: number) => {
    if (solved || wrong.includes(i)) return;
    const option = step.options[i];
    // A sound button is also how the child listens: they hear it as they choose.
    if (option?.kind === 'sound') void play(resolvePhoneme(option.phoneme));
    if (i === step.correct) {
      setSolved(true);
      onSolved(wrong.length === 0);
      if (option?.kind !== 'sound') say?.();
    } else {
      setWrong([...wrong, i]);
      onWrong();
    }
  };

  return (
    <div className="card stack step">
      <h2>{prompt}</h2>
      {step.show && (
        <Ltr as="p" className="show-word">
          {step.show}
        </Ltr>
      )}
      {step.showPicture && <Picture id={step.showPicture} size={112} />}
      {say && <ListenButton onClick={say} label={he.lesson.listenAgain} />}
      <div className="opts" role="group" aria-label={prompt}>
        {step.options.map((o, i) => {
          const state = solved && i === step.correct ? 'ok' : wrong.includes(i) ? 'bad' : '';
          return (
            <button
              key={i}
              type="button"
              className={`opt${state ? ` opt--${state}` : ''}`}
              onClick={() => choose(i)}
              disabled={state === 'bad'}
              aria-label={o.kind === 'sound' ? he.lesson.tapToHear : undefined}
            >
              <OptionFace option={o} index={i} />
              {state === 'ok' && (
                <span className="opt__badge">
                  <Check size={22} />
                </span>
              )}
            </button>
          );
        })}
      </div>
      {!quiet && (
        <p className="feedback" role="status" aria-live="polite">
          {solved ? he.lesson.great : wrong.length > 0 ? he.lesson.tryAgain : ' '}
        </p>
      )}
    </div>
  );
}
