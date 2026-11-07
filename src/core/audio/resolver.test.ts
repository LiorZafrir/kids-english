import { LETTERS, PHONEMES, resolveLetterName, resolvePhoneme, resolveWord } from './resolver';

const empty = { phonemes: [], letters: [], words: [] };

describe('audio resolver', () => {
  it('falls back to TTS (example word) when no recording exists', () => {
    expect(resolvePhoneme('s', empty)).toEqual({ kind: 'tts', text: 'sun' });
    expect(resolveLetterName('B', empty)).toEqual({ kind: 'tts', text: 'B' });
    expect(resolveWord('w1', 'cat', empty)).toEqual({ kind: 'tts', text: 'cat' });
  });

  it('prefers a recorded file when listed in the manifest', () => {
    const m = { phonemes: ['s'], letters: ['b'], words: ['w1'] };
    expect(resolvePhoneme('s', m)).toMatchObject({ kind: 'file' });
    expect(resolveLetterName('B', m)).toMatchObject({ kind: 'file' });
    expect(resolveWord('w1', 'cat', m)).toMatchObject({ kind: 'file' });
  });

  it('phoneme data is clean: unique ids, example words, 26 letters', () => {
    const ids = PHONEMES.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const p of PHONEMES) expect(p.example).toMatch(/^[a-z]+$/);
    expect(LETTERS).toHaveLength(26);
    expect(ids.slice(0, 6)).toEqual(['s', 'a', 't', 'p', 'i', 'n']);
  });
});
