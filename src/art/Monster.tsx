import type { MonsterId } from '@/content/cards';
import { MONSTER_FILE, artUrl } from './art';
import './art.css';

export const MONSTERS: MonsterId[] = ['gloop', 'spike', 'zorb'];

export function Monster({ id, size = 140 }: { id: MonsterId; size?: number }) {
  return (
    <img
      className="art"
      src={artUrl(MONSTER_FILE[id] ?? 'alien')}
      width={size}
      height={size}
      alt=""
      draggable={false}
    />
  );
}
