export type Slot = 'hat' | 'extra';

export interface ShopItem {
  id: string;
  slot: Slot;
  nameHe: string;
  price: number;
}

export const SHOP: ShopItem[] = [
  { id: 'hat-cap', slot: 'hat', nameHe: 'כובע מצחייה', price: 10 },
  { id: 'hat-bow', slot: 'hat', nameHe: 'סרט', price: 15 },
  { id: 'hat-grad', slot: 'hat', nameHe: 'כובע בוגר', price: 20 },
  { id: 'hat-crown', slot: 'hat', nameHe: 'כתר', price: 40 },
  { id: 'extra-glasses', slot: 'extra', nameHe: 'משקפי שמש', price: 12 },
  { id: 'extra-scarf', slot: 'extra', nameHe: 'צעיף', price: 18 },
];

export function itemById(id: string): ShopItem | undefined {
  return SHOP.find((i) => i.id === id);
}
