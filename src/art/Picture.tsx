import { useId, type ReactNode } from 'react';
import type { PictureId } from '@/content/phonics/types';

/** Original word pictures, drawn in code. 100x100 viewBox, soft shading, no outlines. */

interface Ctx {
  /** Radial gradient url for the given colors, unique per instance. */
  g: (name: string, light: string, dark: string, cx?: number, cy?: number) => string;
}

type Draw = (c: Ctx) => ReactNode;

const DRAW: Record<PictureId, Draw> = {
  sun: (c) => (
    <>
      {Array.from({ length: 10 }, (_, i) => (
        <rect
          key={i}
          x="47"
          y="6"
          width="6"
          height="15"
          rx="3"
          fill="#fb923c"
          transform={`rotate(${i * 36} 50 50)`}
        />
      ))}
      <circle cx="50" cy="50" r="27" fill={c.g('s', '#fef08a', '#f59e0b', 0.35, 0.3)} />
      <circle cx="41" cy="46" r="3.2" fill="#7c2d12" />
      <circle cx="59" cy="46" r="3.2" fill="#7c2d12" />
      <path
        d="M41 58q9 8 18 0"
        fill="none"
        stroke="#7c2d12"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <ellipse cx="35" cy="55" rx="4.5" ry="3" fill="#f97316" opacity=".45" />
      <ellipse cx="65" cy="55" rx="4.5" ry="3" fill="#f97316" opacity=".45" />
    </>
  ),
  apple: (c) => (
    <>
      <ellipse cx="50" cy="90" rx="26" ry="4" fill="#1e1b4b" opacity=".15" />
      <path
        d="M50 28c-8-8-30-5-30 22 0 22 14 40 30 36 16 4 30-14 30-36 0-27-22-30-30-22z"
        fill={c.g('a', '#fb7185', '#be123c', 0.35, 0.3)}
      />
      <path
        d="M50 28c0-8 2-14 8-18"
        fill="none"
        stroke="#78350f"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path d="M56 22c4-10 16-12 22-8-2 9-12 14-22 8z" fill={c.g('al', '#86efac', '#16a34a')} />
      <ellipse
        cx="34"
        cy="46"
        rx="5"
        ry="10"
        fill="#fff"
        opacity=".35"
        transform="rotate(15 34 46)"
      />
    </>
  ),
  top: (c) => (
    <>
      <ellipse cx="50" cy="92" rx="14" ry="3.5" fill="#1e1b4b" opacity=".15" />
      <rect x="45" y="8" width="10" height="14" rx="4" fill="#92400e" />
      <ellipse cx="50" cy="26" rx="30" ry="9" fill="#2563eb" />
      <path
        d="M20 26c4 26 20 46 30 62 10-16 26-36 30-62-8 8-52 8-60 0z"
        fill={c.g('t', '#fde047', '#ea580c', 0.4, 0.3)}
      />
      <path d="M26 42q24 12 48 0" fill="none" stroke="#dc2626" strokeWidth="7" opacity=".9" />
      <path d="M33 58q17 9 34 0" fill="none" stroke="#2563eb" strokeWidth="6" opacity=".9" />
      <ellipse cx="38" cy="28" rx="9" ry="2.5" fill="#fff" opacity=".4" />
    </>
  ),
  pig: (c) => (
    <>
      <path d="M22 28l8 18-18 2z" fill="#f472b6" />
      <path d="M78 28l-8 18 18 2z" fill="#f472b6" />
      <circle cx="50" cy="54" r="34" fill={c.g('p', '#fbcfe8', '#ec4899', 0.35, 0.3)} />
      <ellipse cx="50" cy="64" rx="15" ry="11" fill="#f9a8d4" />
      <ellipse
        cx="50"
        cy="64"
        rx="15"
        ry="11"
        fill="none"
        stroke="#db2777"
        strokeWidth="2"
        opacity=".4"
      />
      <ellipse cx="44" cy="64" rx="2.6" ry="4" fill="#9d174d" />
      <ellipse cx="56" cy="64" rx="2.6" ry="4" fill="#9d174d" />
      <circle cx="37" cy="46" r="4" fill="#4a044e" />
      <circle cx="63" cy="46" r="4" fill="#4a044e" />
      <circle cx="38.3" cy="44.7" r="1.3" fill="#fff" />
      <circle cx="64.3" cy="44.7" r="1.3" fill="#fff" />
    </>
  ),
  igloo: (c) => (
    <>
      <ellipse cx="50" cy="82" rx="42" ry="8" fill="#bae6fd" />
      <path d="M12 82a38 38 0 0176 0z" fill={c.g('i', '#ffffff', '#a5d8ff', 0.35, 0.25)} />
      <path
        d="M17 66h66M24 50h52M37 38h26M50 28v10M30 66v-16M50 66v-16M70 66v-16M43 50v-12M57 50v-12"
        fill="none"
        stroke="#7dd3fc"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M38 82V70a12 12 0 0124 0v12z" fill="#1e3a8a" />
      <path d="M44 82V72a6 6 0 0112 0v10z" fill="#172554" />
    </>
  ),
  net: (c) => (
    <>
      <path d="M62 62L90 92" stroke="#92400e" strokeWidth="7" strokeLinecap="round" />
      <path d="M64 64L88 90" stroke="#b45309" strokeWidth="2" strokeLinecap="round" opacity=".6" />
      <ellipse
        cx="42"
        cy="38"
        rx="28"
        ry="26"
        fill={c.g('n', '#e0f2fe', '#7dd3fc', 0.4, 0.3)}
        opacity=".7"
      />
      <path
        d="M18 28h48M14 38h56M18 48h48M28 14v48M42 12v52M56 14v48"
        fill="none"
        stroke="#0ea5e9"
        strokeWidth="1.8"
        opacity=".7"
      />
      <ellipse cx="42" cy="38" rx="28" ry="26" fill="none" stroke="#0369a1" strokeWidth="5" />
    </>
  ),
  pin: (c) => (
    <>
      <path d="M64 36L22 86" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
      <path d="M63 38L26 82" stroke="#e2e8f0" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="68" cy="30" r="17" fill={c.g('pn', '#fca5a5', '#dc2626', 0.35, 0.3)} />
      <ellipse
        cx="62"
        cy="24"
        rx="5"
        ry="3.5"
        fill="#fff"
        opacity=".5"
        transform="rotate(-35 62 24)"
      />
    </>
  ),
  pan: (c) => (
    <>
      <ellipse cx="46" cy="86" rx="32" ry="4" fill="#1e1b4b" opacity=".15" />
      <rect x="68" y="44" width="30" height="10" rx="5" fill="#92400e" />
      <ellipse cx="42" cy="54" rx="38" ry="32" fill="#1f2937" />
      <ellipse cx="42" cy="52" rx="32" ry="26" fill={c.g('pa', '#6b7280', '#111827', 0.4, 0.3)} />
      <ellipse
        cx="30"
        cy="40"
        rx="14"
        ry="5"
        fill="#fff"
        opacity=".22"
        transform="rotate(-25 30 40)"
      />
    </>
  ),
  tap: (c) => (
    <>
      <rect x="40" y="6" width="10" height="16" rx="3" fill="#dc2626" />
      <rect x="28" y="2" width="34" height="9" rx="4.5" fill="#ef4444" />
      <path
        d="M33 22h24v18a14 14 0 0014 14h4v14H46a22 22 0 01-22-22V30a8 8 0 019-8z"
        fill={c.g('tp', '#e5e7eb', '#6b7280', 0.3, 0.2)}
      />
      <rect x="66" y="60" width="16" height="12" rx="3" fill="#9ca3af" />
      <path d="M74 80c-5 7-5 11 0 11s5-4 0-11z" fill="#38bdf8" />
      <path d="M74 92c-3 4-3 6 0 6s3-2 0-6z" fill="#7dd3fc" />
    </>
  ),
  cat: (c) => (
    <>
      <path d="M20 40L22 10l22 16z" fill="#f59e0b" />
      <path d="M80 40L78 10 56 26z" fill="#f59e0b" />
      <path d="M26 32l1-12 10 8z" fill="#fda4af" />
      <path d="M74 32l-1-12-10 8z" fill="#fda4af" />
      <circle cx="50" cy="56" r="36" fill={c.g('c', '#fed7aa', '#ea580c', 0.35, 0.3)} />
      <ellipse cx="50" cy="68" rx="13" ry="10" fill="#fff7ed" />
      <circle cx="36" cy="52" r="4.5" fill="#1c1917" />
      <circle cx="64" cy="52" r="4.5" fill="#1c1917" />
      <circle cx="37.5" cy="50.5" r="1.5" fill="#fff" />
      <circle cx="65.5" cy="50.5" r="1.5" fill="#fff" />
      <path d="M46 62h8l-4 5z" fill="#be185d" />
      <path
        d="M50 67q-4 6-9 4M50 67q4 6 9 4"
        fill="none"
        stroke="#7c2d12"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M12 60l18 3M12 70l18-3M88 60L70 63M88 70L70 67"
        stroke="#7c2d12"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </>
  ),
  egg: (c) => (
    <>
      <path d="M14 70q36 34 72 0 4 18-36 24Q10 88 14 70z" fill="#a16207" />
      <path d="M18 76q32 18 64 0" fill="none" stroke="#fde68a" strokeWidth="2" opacity=".5" />
      <path
        d="M50 10c-18 0-28 28-28 44a28 28 0 0056 0C78 38 68 10 50 10z"
        fill={c.g('e', '#ffffff', '#f5d9b0', 0.35, 0.3)}
      />
      <ellipse
        cx="40"
        cy="34"
        rx="5"
        ry="10"
        fill="#fff"
        opacity=".7"
        transform="rotate(15 40 34)"
      />
    </>
  ),
  dog: (c) => (
    <>
      <path d="M12 34q-6 30 12 40 4-24 0-36z" fill="#78350f" />
      <path d="M88 34q6 30-12 40-4-24 0-36z" fill="#78350f" />
      <circle cx="50" cy="52" r="32" fill={c.g('d', '#fcd9a8', '#b45309', 0.35, 0.3)} />
      <ellipse cx="50" cy="64" rx="18" ry="14" fill="#fff7ed" />
      <ellipse cx="50" cy="58" rx="7" ry="5" fill="#1c1917" />
      <circle cx="36" cy="46" r="4.5" fill="#1c1917" />
      <circle cx="64" cy="46" r="4.5" fill="#1c1917" />
      <circle cx="37.5" cy="44.5" r="1.5" fill="#fff" />
      <circle cx="65.5" cy="44.5" r="1.5" fill="#fff" />
      <path
        d="M50 63v5M42 68q8 6 16 0"
        fill="none"
        stroke="#1c1917"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M46 70q4 12 8 0z" fill="#f43f5e" />
    </>
  ),
  hat: (c) => (
    <>
      <ellipse cx="50" cy="84" rx="40" ry="8" fill="#1e1b4b" opacity=".15" />
      <ellipse cx="50" cy="72" rx="42" ry="12" fill="#b91c1c" />
      <path
        d="M24 70c0-34 8-52 26-52s26 18 26 52c-14 8-38 8-52 0z"
        fill={c.g('h', '#f87171', '#b91c1c', 0.35, 0.3)}
      />
      <path d="M25 62q25 9 50 0v-9q-25 9-50 0z" fill="#facc15" />
      <ellipse
        cx="38"
        cy="38"
        rx="5"
        ry="12"
        fill="#fff"
        opacity=".3"
        transform="rotate(12 38 38)"
      />
    </>
  ),
  rat: (c) => (
    <>
      <circle cx="24" cy="28" r="15" fill="#9ca3af" />
      <circle cx="24" cy="28" r="9" fill="#fda4af" />
      <circle cx="76" cy="28" r="15" fill="#9ca3af" />
      <circle cx="76" cy="28" r="9" fill="#fda4af" />
      <path
        d="M50 88c-22 0-36-22-34-42 0-14 14-24 34-24s34 10 34 24c2 20-12 42-34 42z"
        fill={c.g('r', '#e5e7eb', '#6b7280', 0.35, 0.3)}
      />
      <ellipse cx="50" cy="70" rx="9" ry="7" fill="#f9a8d4" />
      <circle cx="50" cy="66" r="4" fill="#be185d" />
      <circle cx="36" cy="50" r="4" fill="#1c1917" />
      <circle cx="64" cy="50" r="4" fill="#1c1917" />
      <circle cx="37.3" cy="48.7" r="1.3" fill="#fff" />
      <circle cx="65.3" cy="48.7" r="1.3" fill="#fff" />
      <path
        d="M40 70L16 66M40 74L16 78M60 70l24-4M60 74l24 4"
        stroke="#4b5563"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </>
  ),
  man: (c) => (
    <>
      <path d="M14 96c0-22 16-30 36-30s36 8 36 30z" fill="#2563eb" />
      <path d="M42 66l8 10 8-10z" fill="#fff" />
      <circle cx="50" cy="40" r="26" fill={c.g('m', '#fed7aa', '#e0925a', 0.35, 0.3)} />
      <path
        d="M24 38c-2-22 14-28 28-26 16 0 26 10 24 26-6-10-14-14-26-14s-20 4-26 14z"
        fill="#451a03"
      />
      <circle cx="40" cy="42" r="3.6" fill="#1c1917" />
      <circle cx="60" cy="42" r="3.6" fill="#1c1917" />
      <path
        d="M40 54q10 9 20 0"
        fill="none"
        stroke="#7c2d12"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <ellipse cx="34" cy="50" rx="4" ry="2.6" fill="#f97316" opacity=".35" />
      <ellipse cx="66" cy="50" rx="4" ry="2.6" fill="#f97316" opacity=".35" />
    </>
  ),
  hen: (c) => (
    <>
      <path
        d="M30 86l-4 10M44 88l-2 10M30 96h-8M42 98h-8"
        stroke="#f59e0b"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <ellipse cx="46" cy="62" rx="34" ry="28" fill={c.g('hn', '#fdba74', '#c2410c', 0.35, 0.3)} />
      <path d="M72 50q22-6 22 14-14 4-26-6z" fill="#9a3412" />
      <circle cx="68" cy="34" r="17" fill={c.g('hn2', '#fdba74', '#c2410c', 0.35, 0.3)} />
      <path d="M62 20q4-12 8-4 4-8 8 0 5-6 4 6z" fill="#dc2626" />
      <path d="M82 36l14 4-14 5z" fill="#facc15" />
      <path d="M78 46q-2 8 0 10 4-2 2-10z" fill="#ef4444" />
      <circle cx="72" cy="31" r="3.2" fill="#1c1917" />
      <circle cx="73" cy="30" r="1.1" fill="#fff" />
      <path
        d="M26 60q16 14 36 0"
        fill="none"
        stroke="#9a3412"
        strokeWidth="3"
        strokeLinecap="round"
        opacity=".6"
      />
    </>
  ),
  map: (c) => (
    <>
      <path
        d="M10 22l26-8 28 8 26-8v66l-26 8-28-8-26 8z"
        fill={c.g('mp', '#fef3c7', '#e8c882', 0.4, 0.3)}
      />
      <path d="M36 14v66M64 22v66" stroke="#b45309" strokeWidth="1.8" opacity=".5" />
      <path
        d="M20 66q14-24 28-10t30-22"
        fill="none"
        stroke="#dc2626"
        strokeWidth="3"
        strokeDasharray="1 7"
        strokeLinecap="round"
      />
      <path d="M72 24l12 12M84 24L72 36" stroke="#dc2626" strokeWidth="5" strokeLinecap="round" />
      <path
        d="M18 74q8-6 14 0t14 0"
        fill="none"
        stroke="#38bdf8"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </>
  ),
  ant: (c) => (
    <>
      <g stroke="#7c2d12" strokeWidth="3" strokeLinecap="round" fill="none">
        <path d="M44 58L30 74M50 60V80M56 58L70 74" />
        <path d="M44 50L22 46M56 50L78 46" />
        <path d="M24 30q-8-12-18-12M36 28q-3-14-12-20" transform="translate(8 6)" />
      </g>
      <circle cx="26" cy="46" r="16" fill={c.g('an1', '#f87171', '#b91c1c', 0.35, 0.3)} />
      <ellipse cx="50" cy="52" rx="14" ry="11" fill={c.g('an2', '#f87171', '#b91c1c', 0.35, 0.3)} />
      <ellipse cx="76" cy="54" rx="20" ry="15" fill={c.g('an3', '#f87171', '#b91c1c', 0.35, 0.3)} />
      <circle cx="20" cy="42" r="3.8" fill="#fff" />
      <circle cx="21" cy="42.5" r="2" fill="#1e1b4b" />
      <path
        d="M22 54q5 4 10 0"
        fill="none"
        stroke="#450a0a"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </>
  ),
};

export function Picture({
  id,
  size = 96,
  label,
}: {
  id: PictureId;
  size?: number;
  label?: string;
}) {
  const uid = useId();
  // Drawers request gradients by name; collect each definition once, return its url.
  const defs: ReactNode[] = [];
  const seen = new Set<string>();
  const ctx: Ctx = {
    g: (name, light, dark, cx = 0.4, cy = 0.35) => {
      if (!seen.has(name)) {
        seen.add(name);
        defs.push(
          <radialGradient key={name} id={`${uid}${name}`} cx={cx} cy={cy} r="0.8">
            <stop offset="0" stopColor={light} />
            <stop offset="1" stopColor={dark} />
          </radialGradient>,
        );
      }
      return `url(#${uid}${name})`;
    },
  };
  const art = DRAW[id](ctx);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      <defs>{defs}</defs>
      {art}
    </svg>
  );
}
