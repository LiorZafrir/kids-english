/**
 * Single place for all product names, so they are easy to rename.
 * Everything here is an original placeholder name.
 */
export const APP = {
  name: 'Wordlands',
  nameHe: 'וורדלנדס',
  repo: 'kids-english',
} as const;

export const WORLDS = {
  arena: { id: 'arena', nameHe: 'הזירה', nameEn: 'Arena' },
  garden: { id: 'garden', nameHe: 'גן הקסם', nameEn: 'Magic Garden' },
} as const;

export type WorldId = keyof typeof WORLDS;

/** Name of the pastel creatures living in the Magic Garden village. */
export const VILLAGE_FOLK = { nameEn: 'Puffbloom', nameHe: 'פאפבלום' } as const;

/** Family-wide defaults. */
export const DEFAULTS = {
  dailyLimitMin: 15,
  pinLength: 4,
} as const;
