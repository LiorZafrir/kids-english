import { useId } from 'react';
import type { MonsterId } from '@/content/cards';

export const MONSTERS: MonsterId[] = ['gloop', 'spike', 'zorb'];

const Eye = ({ x, y, r = 8 }: { x: number; y: number; r?: number }) => (
  <g>
    <circle cx={x} cy={y} r={r} fill="#fff" />
    <circle cx={x + r * 0.2} cy={y + r * 0.1} r={r * 0.5} fill="#1e1b4b" />
    <circle cx={x + r * 0.4} cy={y - r * 0.2} r={r * 0.18} fill="#fff" />
  </g>
);

/** Original arena monsters, drawn in code. 120x120 viewBox. */
export function Monster({ id, size = 140 }: { id: MonsterId; size?: number }) {
  const uid = useId();
  const grad = (name: string, a: string, b: string) => (
    <radialGradient id={`${uid}${name}`} cx="0.38" cy="0.3" r="0.9">
      <stop offset="0" stopColor={a} />
      <stop offset="1" stopColor={b} />
    </radialGradient>
  );
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" role="img" aria-label={id}>
      <ellipse cx="60" cy="108" rx="36" ry="6" fill="#000" opacity=".25" />
      {id === 'gloop' && (
        <>
          <defs>{grad('g', '#bef264', '#16a34a')}</defs>
          <path d="M16 100c-4-40 10-80 44-80s48 40 44 80c-14 8-74 8-88 0z" fill={`url(#${uid}g)`} />
          <ellipse
            cx="42"
            cy="48"
            rx="9"
            ry="14"
            fill="#fff"
            opacity=".28"
            transform="rotate(18 42 48)"
          />
          <circle cx="30" cy="84" r="5" fill="#86efac" opacity=".7" />
          <circle cx="92" cy="74" r="4" fill="#86efac" opacity=".7" />
          <Eye x={60} y={56} r={16} />
          <path
            d="M44 82q16 14 32 0"
            fill="none"
            stroke="#14532d"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path d="M52 86l3 7 4-6 4 6 3-7" fill="#fff" />
        </>
      )}
      {id === 'spike' && (
        <>
          <defs>{grad('s', '#d8b4fe', '#7e22ce')}</defs>
          {[-60, -36, -12, 12, 36, 60].map((a) => (
            <path key={a} d="M54 36L60 4l6 32z" fill="#4c1d95" transform={`rotate(${a} 60 70)`} />
          ))}
          <circle cx="60" cy="70" r="40" fill={`url(#${uid}s)`} />
          <path d="M26 56L14 40l22 6zM94 56l12-16-22 6z" fill="#fde047" />
          <Eye x={44} y={66} r={9} />
          <Eye x={76} y={66} r={9} />
          <path
            d="M34 56l20 6M86 56l-20 6"
            stroke="#2e1065"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path d="M42 88q18-12 36 0-18 12-36 0z" fill="#2e1065" />
          <path d="M50 88l3 6 3-6M64 88l3 6 3-6" fill="#fff" />
        </>
      )}
      {id === 'zorb' && (
        <>
          <defs>{grad('z', '#fdba74', '#ea580c')}</defs>
          <path d="M60 4v16" stroke="#9a3412" strokeWidth="4" strokeLinecap="round" />
          <circle cx="60" cy="6" r="7" fill="#facc15" />
          <path d="M26 100c-6-44 6-78 34-78s40 34 34 78c-12 8-56 8-68 0z" fill={`url(#${uid}z)`} />
          <Eye x={40} y={52} r={9} />
          <Eye x={60} y={42} r={11} />
          <Eye x={80} y={52} r={9} />
          <path
            d="M40 78q20 14 40 0"
            fill="none"
            stroke="#7c2d12"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M18 70q-12 10-6 24M102 70q12 10 6 24"
            stroke="#ea580c"
            strokeWidth="7"
            strokeLinecap="round"
            fill="none"
          />
          <ellipse
            cx="36"
            cy="40"
            rx="6"
            ry="10"
            fill="#fff"
            opacity=".25"
            transform="rotate(20 36 40)"
          />
        </>
      )}
    </svg>
  );
}
