import { APP } from '@/config/app';

/** Wordmark: a chunky gradient badge plus the app name. */
export function Logo({ size = 56 }: { size?: number }) {
  return (
    <div className="logo" aria-label={APP.name}>
      <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="logo-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#818cf8" />
            <stop offset="1" stopColor="#4338ca" />
          </linearGradient>
        </defs>
        <rect x="2" y="4" width="60" height="58" rx="18" fill="#312e81" />
        <rect x="2" y="2" width="60" height="58" rx="18" fill="url(#logo-g)" />
        <path
          d="M10 10 Q32 -2 54 10"
          fill="none"
          stroke="#fff"
          strokeOpacity=".35"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M15 20 L23 44 L32 28 L41 44 L49 20"
          fill="none"
          stroke="#fff"
          strokeWidth="6.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="49" cy="14" r="4" fill="#facc15" stroke="#a16207" strokeWidth="1.5" />
      </svg>
      <span className="logo__text" dir="ltr">
        {APP.name}
      </span>
    </div>
  );
}
