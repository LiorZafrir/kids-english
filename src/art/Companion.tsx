import { useId } from 'react';
import type { CompanionStage } from '@/features/profiles/types';

interface Props {
  stage: CompanionStage;
  equipped?: Record<string, string | null>;
  size?: number;
}

/** Body geometry per growth stage: center, radius, eye line, top of head, neck line. */
const GEO: Record<
  Exclude<CompanionStage, 'egg'>,
  { cy: number; r: number; eyeY: number; topY: number; neckY: number }
> = {
  baby: { cy: 76, r: 30, eyeY: 72, topY: 46, neckY: 98 },
  kid: { cy: 70, r: 34, eyeY: 66, topY: 36, neckY: 98 },
  hero: { cy: 68, r: 36, eyeY: 64, topY: 32, neckY: 98 },
};

function Hat({ id, y }: { id: string; y: number }) {
  switch (id) {
    case 'hat-cap':
      return (
        <g>
          <path d={`M36 ${y + 6}a24 22 0 0148 0z`} fill="#2563eb" />
          <path d={`M60 ${y + 6}h34a6 4 0 010 8H60z`} fill="#1d4ed8" />
          <circle cx="60" cy={y - 16} r="3" fill="#93c5fd" />
        </g>
      );
    case 'hat-bow':
      return (
        <g transform={`translate(78 ${y + 4})`}>
          <path d="M0 0L-16-10v20z" fill="#ec4899" />
          <path d="M0 0L16-10v20z" fill="#ec4899" />
          <circle r="5" fill="#be185d" />
        </g>
      );
    case 'hat-party':
      return (
        <g>
          <path d={`M60 ${y - 34}L42 ${y + 8}h36z`} fill="#a855f7" />
          <path d={`M50 ${y - 12}l22 0M46 ${y - 2}h28`} stroke="#fde047" strokeWidth="3" />
          <circle cx="60" cy={y - 36} r="5" fill="#facc15" />
        </g>
      );
    case 'hat-crown':
      return (
        <g>
          <path
            d={`M40 ${y + 8}l-4-26 14 12 10-16 10 16 14-12-4 26z`}
            fill="#facc15"
            stroke="#a16207"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <circle cx="60" cy={y - 2} r="3.5" fill="#ef4444" />
        </g>
      );
    default:
      return null;
  }
}

export function Companion({ stage, equipped = {}, size = 160 }: Props) {
  const uid = useId();
  const hat = equipped.hat ?? null;
  const extra = equipped.extra ?? null;
  const body = `url(#${uid}b)`;
  const petal = `url(#${uid}p)`;

  const defs = (
    <defs>
      <radialGradient id={`${uid}b`} cx="0.38" cy="0.3" r="0.85">
        <stop offset="0" stopColor="#fbcfe8" />
        <stop offset="1" stopColor="#c084fc" />
      </radialGradient>
      <radialGradient id={`${uid}p`} cx="0.4" cy="0.3" r="0.9">
        <stop offset="0" stopColor={stage === 'hero' ? '#fef08a' : '#fde68a'} />
        <stop offset="1" stopColor={stage === 'hero' ? '#f59e0b' : '#fb923c'} />
      </radialGradient>
      <radialGradient id={`${uid}e`} cx="0.35" cy="0.25" r="0.9">
        <stop offset="0" stopColor="#f5f3ff" />
        <stop offset="1" stopColor="#c4b5fd" />
      </radialGradient>
    </defs>
  );

  if (stage === 'egg') {
    return (
      <svg width={size} height={size} viewBox="0 0 120 120" role="img" aria-label="egg">
        {defs}
        <ellipse cx="60" cy="108" rx="28" ry="5" fill="#1e1b4b" opacity=".15" />
        <path
          d="M60 20c-22 0-34 34-34 56a34 34 0 0068 0c0-22-12-56-34-56z"
          fill={`url(#${uid}e)`}
        />
        <circle cx="46" cy="70" r="6" fill="#c084fc" opacity=".7" />
        <circle cx="72" cy="86" r="5" fill="#f9a8d4" opacity=".8" />
        <circle cx="68" cy="56" r="4" fill="#a5b4fc" opacity=".8" />
        <path
          d="M44 38l8 8-6 6 8 6"
          fill="none"
          stroke="#7c3aed"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity=".5"
        />
        <ellipse
          cx="46"
          cy="44"
          rx="5"
          ry="9"
          fill="#fff"
          opacity=".6"
          transform="rotate(18 46 44)"
        />
      </svg>
    );
  }

  const g = GEO[stage];
  const petals = stage === 'baby' ? 0 : stage === 'kid' ? 8 : 10;
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" role="img" aria-label="Puffbloom">
      {defs}
      <ellipse cx="60" cy="112" rx="30" ry="5" fill="#1e1b4b" opacity=".15" />
      {extra === 'extra-cape' && (
        <path d={`M34 ${g.neckY - 14}L22 112h76L86 ${g.neckY - 14}z`} fill="#dc2626" />
      )}
      {petals > 0 &&
        Array.from({ length: petals }, (_, i) => (
          <ellipse
            key={i}
            cx="60"
            cy={g.cy - g.r - 6}
            rx={stage === 'hero' ? 11 : 9}
            ry={stage === 'hero' ? 17 : 14}
            fill={petal}
            transform={`rotate(${(i * 360) / petals} 60 ${g.cy})`}
          />
        ))}
      <ellipse cx="44" cy="108" rx="11" ry="6" fill="#a855f7" />
      <ellipse cx="76" cy="108" rx="11" ry="6" fill="#a855f7" />
      {stage !== 'baby' && (
        <>
          <ellipse
            cx={60 - g.r - 2}
            cy={g.cy + 8}
            rx="8"
            ry="12"
            fill="#c084fc"
            transform={`rotate(20 ${60 - g.r} ${g.cy + 8})`}
          />
          <ellipse
            cx={60 + g.r + 2}
            cy={g.cy + 8}
            rx="8"
            ry="12"
            fill="#c084fc"
            transform={`rotate(-20 ${60 + g.r} ${g.cy + 8})`}
          />
        </>
      )}
      <circle cx="60" cy={g.cy} r={g.r} fill={body} />
      {stage === 'baby' && (
        <>
          <path d={`M60 ${g.topY + 2}q-2-14-14-16 2 14 14 16z`} fill="#4ade80" />
          <path d={`M60 ${g.topY + 2}q2-16 16-16-2 14-16 16z`} fill="#22c55e" />
        </>
      )}
      {stage === 'hero' && (
        <path
          d="M60 36l2.6 5.4 5.9.8-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8-4.3-4.1 5.9-.8z"
          fill="#facc15"
          stroke="#a16207"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
      )}
      <ellipse cx="45" cy={g.eyeY + 10} rx="6" ry="4" fill="#fb7185" opacity=".4" />
      <ellipse cx="75" cy={g.eyeY + 10} rx="6" ry="4" fill="#fb7185" opacity=".4" />
      {([48, 72] as const).map((x) => (
        <g key={x}>
          <ellipse cx={x} cy={g.eyeY} rx="6.5" ry="8" fill="#1e1b4b" />
          <circle cx={x + 2} cy={g.eyeY - 3} r="2.4" fill="#fff" />
          <circle cx={x - 2} cy={g.eyeY + 3} r="1.1" fill="#fff" />
        </g>
      ))}
      <path
        d={`M52 ${g.eyeY + 12}q8 8 16 0`}
        fill="none"
        stroke="#6b21a8"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {extra === 'extra-glasses' && (
        <g fill="#0f172a" stroke="#0f172a" strokeWidth="2">
          <rect x="37" y={g.eyeY - 9} width="22" height="16" rx="7" opacity=".85" />
          <rect x="61" y={g.eyeY - 9} width="22" height="16" rx="7" opacity=".85" />
          <path d={`M59 ${g.eyeY - 3}h2`} />
        </g>
      )}
      {extra === 'extra-scarf' && (
        <g>
          <path d={`M36 ${g.neckY - 10}q24 14 48 0l2 10q-26 14-52 0z`} fill="#ef4444" />
          <path d={`M78 ${g.neckY - 2}l8 18-10 2-4-16z`} fill="#dc2626" />
        </g>
      )}
      {hat && <Hat id={hat} y={g.topY} />}
    </svg>
  );
}
