import type { CSSProperties } from 'react';
import type { CompanionStage } from '@/features/profiles/types';
import { COMPANION_FILE, WEARABLE_FILE, artUrl } from './art';
import './art.css';

interface Props {
  stage: CompanionStage;
  equipped?: Record<string, string | null>;
  size?: number;
}

/** Where each wearable sits on the base picture: top offset and width, as a share of its size. */
const SPOT: Record<string, { top: number; width: number }> = {
  'hat-cap': { top: -0.1, width: 0.5 },
  'hat-bow': { top: -0.08, width: 0.4 },
  'hat-grad': { top: -0.12, width: 0.52 },
  'hat-crown': { top: -0.1, width: 0.46 },
  'extra-glasses': { top: 0.3, width: 0.56 },
  'extra-scarf': { top: 0.58, width: 0.6 },
};

export function Companion({ stage, equipped = {}, size = 160 }: Props) {
  const worn = Object.values(equipped).flatMap((id) => {
    const file = id ? WEARABLE_FILE[id] : undefined;
    const spot = id ? SPOT[id] : undefined;
    if (!id || !file || !spot) return [];
    const style: CSSProperties = { top: spot.top * size, width: spot.width * size };
    return [{ id, file, style }];
  });

  return (
    <span className="companion" style={{ width: size, height: size }}>
      <img className="art" src={artUrl(COMPANION_FILE[stage])} alt="" draggable={false} />
      {stage !== 'egg' &&
        worn.map((it) => (
          <img
            key={it.id}
            className="art companion__wear"
            src={artUrl(it.file)}
            alt=""
            draggable={false}
            style={it.style}
          />
        ))}
    </span>
  );
}
