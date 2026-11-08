import { Avatar } from '@/art/Avatar';
import { Companion } from '@/art/Companion';
import { Monster, MONSTERS } from '@/art/Monster';
import { Picture } from '@/art/Picture';
import { AVATAR_IDS } from '@/features/profiles/types';
import type { PictureId } from '@/content/phonics';

const PICTURES: PictureId[] = [
  'sun',
  'apple',
  'tiger',
  'pig',
  'insect',
  'nut',
  'pin',
  'pan',
  'tap',
  'ant',
  'cat',
  'egg',
  'dog',
  'hat',
  'rat',
  'man',
  'hen',
  'map',
];

/** Dev-only sheet of every illustration, for reviewing the art in one screenshot. */
export function Gallery() {
  return (
    <main className="page stack" style={{ maxWidth: 900 }}>
      <div className="row">
        {AVATAR_IDS.map((id) => (
          <Avatar key={id} id={id} size={92} />
        ))}
      </div>
      <div className="row">
        {PICTURES.map((id) => (
          <Picture key={id} id={id} size={92} />
        ))}
      </div>
      <div className="row">
        {MONSTERS.map((id) => (
          <Monster key={id} id={id} size={110} />
        ))}
        {(['egg', 'baby', 'kid', 'hero'] as const).map((stage) => (
          <Companion
            key={stage}
            stage={stage}
            size={110}
            equipped={{ hat: 'hat-crown', extra: 'extra-glasses' }}
          />
        ))}
      </div>
    </main>
  );
}
