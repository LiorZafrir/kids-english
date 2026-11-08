import type { PictureId } from '@/content/phonics/types';
import { PICTURE_FILE, artUrl } from './art';
import './art.css';

/** A word picture. Pass `label` when the picture carries meaning for screen readers. */
export function Picture({
  id,
  size = 96,
  label,
}: {
  id: PictureId;
  size?: number;
  label?: string;
}) {
  return (
    <img
      className="art"
      src={artUrl(PICTURE_FILE[id])}
      width={size}
      height={size}
      alt={label ?? ''}
      draggable={false}
    />
  );
}

/** Any illustration by file name (icons, flowers, rewards). */
export function Art({ slug, size = 48, label }: { slug: string; size?: number; label?: string }) {
  return (
    <img
      className="art"
      src={artUrl(slug)}
      width={size}
      height={size}
      alt={label ?? ''}
      draggable={false}
    />
  );
}
