export type Slot = 'hat' | 'extra';

export interface ShopItem {
  id: string;
  slot: Slot;
  nameHe: string;
  price: number;
}

export const SHOP: ShopItem[] = [
  { id: 'hat-cap', slot: 'hat', nameHe: 'כובע מצחייה', price: 10 },
  { id: 'hat-bow', slot: 'hat', nameHe: 'סרט פרפר', price: 15 },
  { id: 'hat-party', slot: 'hat', nameHe: 'כובע מסיבה', price: 20 },
  { id: 'hat-crown', slot: 'hat', nameHe: 'כתר', price: 40 },
  { id: 'extra-glasses', slot: 'extra', nameHe: 'משקפי שמש', price: 12 },
  { id: 'extra-scarf', slot: 'extra', nameHe: 'צעיף', price: 18 },
  { id: 'extra-cape', slot: 'extra', nameHe: 'גלימה', price: 30 },
];

export function itemById(id: string): ShopItem | undefined {
  return SHOP.find((i) => i.id === id);
}
