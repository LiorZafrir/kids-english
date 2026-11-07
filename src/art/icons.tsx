interface IconProps {
  size?: number;
}

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2.4,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

export function Speaker({ size = 28, muted = false }: IconProps & { muted?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z" {...base} fill="currentColor" />
      {muted ? (
        <path d="M16 9.5l5 5M21 9.5l-5 5" {...base} />
      ) : (
        <path d="M15.5 9a4 4 0 010 6M18 6.5a7.5 7.5 0 010 11" {...base} />
      )}
    </svg>
  );
}

export function Check({ size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M5 12.5l4.5 4.5L19 7.5" {...base} strokeWidth={3.4} />
    </svg>
  );
}

export function Lock({ size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect x="5" y="10.5" width="14" height="9.5" rx="2.5" fill="currentColor" />
      <path d="M8.5 10.5V8a3.5 3.5 0 017 0v2.5" {...base} />
    </svg>
  );
}

/** Points left, the "forward" direction in an RTL layout. */
export function ArrowForward({ size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M19 12H5M11 6l-6 6 6 6" {...base} strokeWidth={3} />
    </svg>
  );
}

export function Heart({ size = 26, full = true }: IconProps & { full?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M12 21s-8-5.2-8-11a4.6 4.6 0 018-3 4.6 4.6 0 018 3c0 5.800-8 11-8 11z"
        fill={full ? '#ef4444' : 'none'}
        stroke="#991b1b"
        strokeWidth="1.8"
        strokeLinejoin="round"
        opacity={full ? 1 : 0.35}
      />
    </svg>
  );
}

export function Sword({ size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M5 19l9-9M14 10l5-5V3h-2l-5 5M4 20l2-2M8 16l-2 4 2-2" {...base} />
    </svg>
  );
}
