import { useId, type ReactNode } from 'react';
import type { AvatarId } from '@/features/profiles/types';

/**
 * Original characters, drawn in code. Shared style: soft radial shading, glossy eyes,
 * blush cheeks, rim light and a ground shadow, so the whole cast feels like one family.
 */

function mix(a: string, b: string, t: number): string {
  const p = (h: string, i: number) => parseInt(h.slice(1 + i * 2, 3 + i * 2), 16);
  const c = (i: number) =>
    Math.round(p(a, i) + (p(b, i) - p(a, i)) * t)
      .toString(16)
      .padStart(2, '0');
  return `#${c(0)}${c(1)}${c(2)}`;
}
const light = (c: string, t: number) => mix(c, '#ffffff', t);
const dark = (c: string, t: number) => mix(c, '#000000', t);

interface Spec {
  bg: string;
  fur: string;
}
const SPEC: Record<AvatarId, Spec> = {
  fox: { bg: '#fed7aa', fur: '#f97316' },
  owl: { bg: '#ddd6fe', fur: '#8b5cf6' },
  bear: { bg: '#fde68a', fur: '#b45309' },
  bunny: { bg: '#fbcfe8', fur: '#f9a8d4' },
  cat: { bg: '#bae6fd', fur: '#94a3b8' },
  frog: { bg: '#bbf7d0', fur: '#22c55e' },
  panda: { bg: '#c7d2fe', fur: '#f1f5f9' },
  lion: { bg: '#fef08a', fur: '#f59e0b' },
};

const INK = '#1e1b4b';
const BLUSH = '#fb7185';

function Eye({
  cx,
  cy,
  r = 7.2,
  iris = INK,
  slit = false,
}: {
  cx: number;
  cy: number;
  r?: number;
  iris?: string;
  slit?: boolean;
}) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="#fff" />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#000" strokeOpacity=".12" />
      <circle cx={cx + 0.4} cy={cy + 0.8} r={r * 0.7} fill={iris} />
      {slit ? (
        <ellipse cx={cx + 0.4} cy={cy + 0.8} rx={r * 0.18} ry={r * 0.6} fill="#0f172a" />
      ) : (
        <circle cx={cx + 0.4} cy={cy + 0.8} r={r * 0.38} fill="#0f172a" />
      )}
      <circle cx={cx + r * 0.28} cy={cy - r * 0.2} r={r * 0.26} fill="#fff" />
      <circle cx={cx - r * 0.2} cy={cy + r * 0.38} r={r * 0.12} fill="#fff" opacity=".8" />
    </g>
  );
}

function Cheeks({ y = 66, dx = 20 }: { y?: number; dx?: number }) {
  return (
    <g fill={BLUSH} opacity=".45">
      <ellipse cx={50 - dx} cy={y} rx="5" ry="3.2" />
      <ellipse cx={50 + dx} cy={y} rx="5" ry="3.2" />
    </g>
  );
}

function Mouth({ y = 70 }: { y?: number }) {
  return (
    <path
      d={`M50 ${y - 3} L50 ${y} M50 ${y} Q45.5 ${y + 5} 41.5 ${y + 1.5} M50 ${y} Q54.5 ${y + 5} 58.5 ${y + 1.5}`}
      fill="none"
      stroke={INK}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}

function Nose({
  y = 65,
  fill = INK,
  rx = 4,
  ry = 3,
}: {
  y?: number;
  fill?: string;
  rx?: number;
  ry?: number;
}) {
  return (
    <g>
      <ellipse cx="50" cy={y} rx={rx} ry={ry} fill={fill} />
      <ellipse
        cx="48.8"
        cy={y - ry * 0.4}
        rx={rx * 0.35}
        ry={ry * 0.28}
        fill="#fff"
        opacity=".55"
      />
    </g>
  );
}

/** The glossy head: gradient fill, rim light, soft inner shade at the bottom. */
function Head({
  id,
  fur,
  rx = 31,
  ry = 31,
  cy = 58,
}: {
  id: string;
  fur: string;
  rx?: number;
  ry?: number;
  cy?: number;
}) {
  return (
    <g>
      <ellipse cx="50" cy={cy} rx={rx} ry={ry} fill={`url(#${id}-fur)`} />
      <ellipse cx="50" cy={cy} rx={rx} ry={ry} fill={`url(#${id}-shade)`} />
      <ellipse
        cx="38"
        cy={cy - ry * 0.55}
        rx={rx * 0.38}
        ry={ry * 0.18}
        fill="#fff"
        opacity=".28"
        transform={`rotate(-20 38 ${cy - ry * 0.55})`}
      />
      <ellipse
        cx="50"
        cy={cy}
        rx={rx}
        ry={ry}
        fill="none"
        stroke={dark(fur, 0.35)}
        strokeOpacity=".35"
        strokeWidth="1.2"
      />
    </g>
  );
}

function art(avatar: AvatarId, id: string): ReactNode {
  const { fur } = SPEC[avatar];
  const furDark = dark(fur, 0.3);
  switch (avatar) {
    case 'fox':
      return (
        <>
          <path d="M22 44 L24 12 L47 32 Z" fill={furDark} />
          <path d="M78 44 L76 12 L53 32 Z" fill={furDark} />
          <path d="M28 38 L29 22 L41 32 Z" fill="#fecdd3" />
          <path d="M72 38 L71 22 L59 32 Z" fill="#fecdd3" />
          <path d="M24 12 L33 18 L26 24 Z M76 12 L67 18 L74 24 Z" fill="#431407" opacity=".7" />
          <Head id={id} fur={fur} />
          <path d="M19 60 Q33 52 50 66 Q67 52 81 60 Q76 86 50 89 Q24 86 19 60Z" fill="#fff7ed" />
          <path
            d="M19 60 Q33 52 50 66 Q67 52 81 60"
            fill="none"
            stroke={furDark}
            strokeOpacity=".25"
          />
          <Eye cx={37} cy={55} />
          <Eye cx={63} cy={55} />
          <Cheeks y={68} dx={22} />
          <Nose y={67} />
          <Mouth y={71} />
        </>
      );
    case 'owl':
      return (
        <>
          <path d="M25 40 L20 12 L45 30 Z" fill={furDark} />
          <path d="M75 40 L80 12 L55 30 Z" fill={furDark} />
          <Head id={id} fur={fur} />
          <ellipse cx="50" cy="82" rx="18" ry="9" fill={light(fur, 0.55)} />
          <path
            d="M42 80 q3 3 6 0 M52 80 q3 3 6 0 M47 85 q3 3 6 0"
            fill="none"
            stroke={fur}
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <circle
            cx="37"
            cy="56"
            r="13"
            fill="#fef3c7"
            stroke={furDark}
            strokeOpacity=".4"
            strokeWidth="1.5"
          />
          <circle
            cx="63"
            cy="56"
            r="13"
            fill="#fef3c7"
            stroke={furDark}
            strokeOpacity=".4"
            strokeWidth="1.5"
          />
          <Eye cx={37} cy={56} r={8.4} iris="#92400e" />
          <Eye cx={63} cy={56} r={8.4} iris="#92400e" />
          <path
            d="M45 66 L55 66 L50 76 Z"
            fill="#fb923c"
            stroke="#c2410c"
            strokeOpacity=".5"
            strokeLinejoin="round"
          />
          <Cheeks y={71} dx={25} />
        </>
      );
    case 'bear':
      return (
        <>
          <circle cx="26" cy="32" r="10" fill={furDark} />
          <circle cx="74" cy="32" r="10" fill={furDark} />
          <circle cx="26" cy="32" r="5.2" fill="#e7b98a" />
          <circle cx="74" cy="32" r="5.2" fill="#e7b98a" />
          <Head id={id} fur={fur} />
          <ellipse cx="50" cy="68" rx="14" ry="11" fill="#f3d3a8" />
          <Eye cx={38} cy={54} r={6.6} />
          <Eye cx={62} cy={54} r={6.6} />
          <Cheeks y={64} dx={25} />
          <Nose y={63} rx={5} ry={3.6} />
          <Mouth y={68} />
        </>
      );
    case 'bunny':
      return (
        <>
          <g transform="rotate(-8 36 24)">
            <ellipse
              cx="36"
              cy="24"
              rx="8"
              ry="19"
              fill={fur}
              stroke={furDark}
              strokeOpacity=".3"
            />
            <ellipse cx="36" cy="25" rx="4" ry="13" fill="#fb7185" opacity=".45" />
          </g>
          <g transform="rotate(8 64 24)">
            <ellipse
              cx="64"
              cy="24"
              rx="8"
              ry="19"
              fill={fur}
              stroke={furDark}
              strokeOpacity=".3"
            />
            <ellipse cx="64" cy="25" rx="4" ry="13" fill="#fb7185" opacity=".45" />
          </g>
          <Head id={id} fur={fur} />
          <ellipse cx="50" cy="69" rx="12" ry="9" fill="#fff" />
          <Eye cx={38} cy={55} />
          <Eye cx={62} cy={55} />
          <Cheeks y={66} dx={25} />
          <Nose y={64} fill="#f43f5e" rx={3.4} ry={2.6} />
          <Mouth y={67} />
          <rect x="47.4" y="70" width="5.2" height="5.6" rx="1.4" fill="#fff" stroke="#cbd5e1" />
        </>
      );
    case 'cat':
      return (
        <>
          <path d="M22 46 L22 12 L46 31 Z" fill={furDark} />
          <path d="M78 46 L78 12 L54 31 Z" fill={furDark} />
          <path d="M27 38 L27 21 L40 31 Z" fill="#fbcfe8" />
          <path d="M73 38 L73 21 L60 31 Z" fill="#fbcfe8" />
          <Head id={id} fur={fur} />
          <path
            d="M50 28 L50 38 M42 30 L44 38 M58 30 L56 38"
            stroke={furDark}
            strokeWidth="2.4"
            strokeLinecap="round"
            opacity=".7"
          />
          <ellipse cx="50" cy="69" rx="12" ry="9" fill="#f1f5f9" />
          <Eye cx={38} cy={54} iris="#84cc16" slit />
          <Eye cx={62} cy={54} iris="#84cc16" slit />
          <path
            d="M20 62 L33 64 M20 69 L33 68 M80 62 L67 64 M80 69 L67 68"
            stroke="#fff"
            strokeWidth="1.3"
            strokeLinecap="round"
            opacity=".9"
          />
          <Cheeks y={65} dx={26} />
          <Nose y={64} fill="#f472b6" rx={3.6} ry={2.6} />
          <Mouth y={67} />
        </>
      );
    case 'frog':
      return (
        <>
          <Head id={id} fur={fur} rx={34} ry={28} cy={62} />
          <circle
            cx="33"
            cy="36"
            r="12"
            fill={`url(#${id}-fur)`}
            stroke={furDark}
            strokeOpacity=".35"
            strokeWidth="1.2"
          />
          <circle
            cx="67"
            cy="36"
            r="12"
            fill={`url(#${id}-fur)`}
            stroke={furDark}
            strokeOpacity=".35"
            strokeWidth="1.2"
          />
          <Eye cx={33} cy={36} r={8} />
          <Eye cx={67} cy={36} r={8} />
          <circle cx="40" cy="66" r="3" fill={furDark} opacity=".25" />
          <circle cx="62" cy="70" r="2.4" fill={furDark} opacity=".25" />
          <circle cx="56" cy="56" r="1.8" fill={furDark} opacity=".25" />
          <circle cx="45.5" cy="58" r="1.1" fill={furDark} />
          <circle cx="54.5" cy="58" r="1.1" fill={furDark} />
          <path
            d="M30 68 Q50 88 70 68"
            fill="none"
            stroke={INK}
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <Cheeks y={71} dx={27} />
        </>
      );
    case 'panda':
      return (
        <>
          <circle cx="27" cy="31" r="10.5" fill="#1f2937" />
          <circle cx="73" cy="31" r="10.5" fill="#1f2937" />
          <Head id={id} fur={fur} />
          <ellipse cx="38" cy="56" rx="8.6" ry="10.5" fill="#1f2937" transform="rotate(22 38 56)" />
          <ellipse
            cx="62"
            cy="56"
            rx="8.6"
            ry="10.5"
            fill="#1f2937"
            transform="rotate(-22 62 56)"
          />
          <circle cx="38.5" cy="55.5" r="4.6" fill="#fff" />
          <circle cx="61.5" cy="55.5" r="4.6" fill="#fff" />
          <circle cx="39" cy="56" r="2.8" fill="#0f172a" />
          <circle cx="61" cy="56" r="2.8" fill="#0f172a" />
          <circle cx="40" cy="55" r="1" fill="#fff" />
          <circle cx="62" cy="55" r="1" fill="#fff" />
          <Cheeks y={69} dx={24} />
          <Nose y={67} rx={4.6} ry={3.2} fill="#1f2937" />
          <Mouth y={71} />
        </>
      );
    case 'lion': {
      const mane = dark(fur, 0.35);
      const dots = Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return (
          <circle
            key={i}
            cx={50 + 31 * Math.cos(a)}
            cy={55 + 31 * Math.sin(a)}
            r="10"
            fill={mane}
          />
        );
      });
      return (
        <>
          {dots}
          <circle cx="50" cy="55" r="33" fill={dark(fur, 0.2)} />
          <circle cx="29" cy="32" r="6" fill={light(fur, 0.1)} />
          <circle cx="71" cy="32" r="6" fill={light(fur, 0.1)} />
          <Head id={id} fur={light(fur, 0.35)} rx={25} ry={25} cy={57} />
          <ellipse cx="50" cy="68" rx="12" ry="9" fill="#fef3c7" />
          <Eye cx={40} cy={54} r={6.4} />
          <Eye cx={60} cy={54} r={6.4} />
          <Cheeks y={65} dx={21} />
          <path
            d="M45 62 L55 62 L50 68 Z"
            fill="#7c2d12"
            strokeLinejoin="round"
            stroke="#7c2d12"
            strokeWidth="1.5"
          />
          <Mouth y={69} />
        </>
      );
    }
  }
}

export function Avatar({ id, size = 72 }: { id: AvatarId; size?: number }) {
  const uid = useId().replace(/:/g, '');
  const { bg, fur } = SPEC[id];
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id={`${uid}-bg`} cx="35%" cy="28%" r="90%">
          <stop offset="0" stopColor={light(bg, 0.65)} />
          <stop offset="1" stopColor={bg} />
        </radialGradient>
        <radialGradient id={`${uid}-fur`} cx="34%" cy="26%" r="85%">
          <stop offset="0" stopColor={light(fur, 0.38)} />
          <stop offset="0.55" stopColor={fur} />
          <stop offset="1" stopColor={dark(fur, 0.22)} />
        </radialGradient>
        <linearGradient id={`${uid}-shade`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.6" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.14" />
        </linearGradient>
        <clipPath id={`${uid}-clip`}>
          <circle cx="50" cy="50" r="50" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${uid}-clip)`}>
        <circle cx="50" cy="50" r="50" fill={`url(#${uid}-bg)`} />
        <circle cx="82" cy="18" r="3" fill="#fff" opacity=".7" />
        <circle cx="14" cy="26" r="2" fill="#fff" opacity=".6" />
        <ellipse cx="50" cy="92" rx="26" ry="5" fill="#000" opacity=".12" />
        {art(id, uid)}
      </g>
      <circle cx="50" cy="50" r="49" fill="none" stroke="#fff" strokeOpacity=".7" strokeWidth="2" />
    </svg>
  );
}
