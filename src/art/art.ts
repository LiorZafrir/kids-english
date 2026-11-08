import type { PictureId } from '@/content/phonics/types';

/**
 * Illustrations are Microsoft Fluent Emoji (3D), MIT licensed, downloaded by
 * `npm run art` into public/art/. See CREDITS.md. This file maps what the app calls things
 * to the file names.
 */
export const artUrl = (slug: string): string => `${import.meta.env.BASE_URL}art/${slug}.png`;

export const PICTURE_FILE: Record<PictureId, string> = {
  sun: 'sun',
  apple: 'red-apple',
  tiger: 'tiger-face',
  pig: 'pig-face',
  insect: 'bug',
  nut: 'peanuts',
  pin: 'pushpin',
  pan: 'cooking',
  tap: 'potable-water',
  ant: 'ant',
  cat: 'cat-face',
  egg: 'egg',
  dog: 'dog-face',
  hat: 'top-hat',
  rat: 'rat',
  man: 'man',
  hen: 'chicken',
  map: 'world-map',
};

export const AVATAR_FILE: Record<string, string> = {
  fox: 'fox',
  owl: 'owl',
  bear: 'bear',
  bunny: 'rabbit-face',
  cat: 'cat-face',
  frog: 'frog',
  panda: 'panda',
  lion: 'lion',
};

export const MONSTER_FILE: Record<string, string> = {
  gloop: 'alien-monster',
  spike: 'ogre',
  zorb: 'alien',
};

export const COMPANION_FILE = {
  egg: 'egg',
  baby: 'hatching-chick',
  kid: 'baby-chick',
  hero: 'unicorn',
} as const;

/** Shop item id to the picture drawn on the companion. */
export const WEARABLE_FILE: Record<string, string> = {
  'hat-cap': 'billed-cap',
  'hat-bow': 'ribbon',
  'hat-grad': 'graduation-cap',
  'hat-crown': 'crown',
  'extra-glasses': 'sunglasses',
  'extra-scarf': 'scarf',
};
