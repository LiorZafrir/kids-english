import type { PictureId } from '@/content/phonics/types';

/**
 * Story chapters in the village of Puffbloom. Hebrew narration carries the plot; the English line
 * on each page may only use sounds taught by `unlockLesson` plus the SIGHT words below
 * (enforced by tests).
 */
export const SIGHT = ['a', 'the', 'on'];

export interface StoryPage {
  he: string;
  en: string;
  art: PictureId[];
}

export interface Chapter {
  id: string;
  unlockLesson: string;
  titleHe: string;
  pages: StoryPage[];
}

export const CHAPTERS: Chapter[] = [
  {
    id: 'ch1',
    unlockLesson: 'u1-l3',
    titleHe: 'המכתב הראשון',
    pages: [
      {
        he: 'בכפר פאפבלום מצאו קופסה ישנה ובה מכתב. מה כתוב בו?',
        en: 'A pin. A pan.',
        art: ['pin', 'pan'],
      },
      { he: 'האיש הזקן הוציא מחבת ומחט. הוא התחיל לבשל.', en: 'Tap, tap, tap.', art: ['tap'] },
    ],
  },
  {
    id: 'ch2',
    unlockLesson: 'u1-l4',
    titleHe: 'הנמלה הקטנה',
    pages: [
      {
        he: 'נמלה קטנה הלכה לאיבוד בגינה. היא חיפשה את הדרך הביתה.',
        en: 'An ant.',
        art: ['ant'],
      },
      {
        he: 'היא מצאה מחבת גדולה והסתתרה בה מהגשם.',
        en: 'The ant sat in a pan.',
        art: ['ant', 'pan'],
      },
    ],
  },
  {
    id: 'ch3',
    unlockLesson: 'u2-l2',
    titleHe: 'החתול והעכברוש',
    pages: [
      {
        he: 'חתול ועכברוש גרו בכפר. הם לא תמיד הסתדרו.',
        en: 'A cat. A rat.',
        art: ['cat', 'rat'],
      },
      {
        he: 'יום אחד הם ישבו יחד וחיכו לגשם.',
        en: 'The cat sat. The rat sat.',
        art: ['cat', 'rat'],
      },
    ],
  },
  {
    id: 'ch4',
    unlockLesson: 'u2-l4',
    titleHe: 'המפה של האיש',
    pages: [
      {
        he: 'איש אחד מצא מפה ישנה. התרנגולת רצתה לבוא איתו.',
        en: 'A man. A hen.',
        art: ['man', 'hen'],
      },
      {
        he: 'הם שמו כובע ויצאו לדרך אל האוצר.',
        en: 'The man had a hat. The hen sat on a map.',
        art: ['man', 'hat', 'hen', 'map'],
      },
    ],
  },
];

export function chapterById(id: string): Chapter | undefined {
  return CHAPTERS.find((c) => c.id === id);
}
