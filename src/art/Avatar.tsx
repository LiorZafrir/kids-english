import type { AvatarId } from '@/features/profiles/types';
import { AVATAR_FILE, artUrl } from './art';
import './art.css';

/** Soft background tint behind each animal. */
const TINT: Record<AvatarId, string> = {
  fox: '#fed7aa',
  owl: '#ddd6fe',
  bear: '#fde68a',
  bunny: '#fbcfe8',
  cat: '#bae6fd',
  frog: '#bbf7d0',
  panda: '#c7d2fe',
  lion: '#fef08a',
};

export function Avatar({ id, size = 72 }: { id: AvatarId; size?: number }) {
  return (
    <span
      className="avatar"
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle at 35% 28%, #fff, ${TINT[id]} 70%)`,
      }}
    >
      <img className="art" src={artUrl(AVATAR_FILE[id] ?? 'fox')} alt="" draggable={false} />
    </span>
  );
}
