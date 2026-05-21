'use client';

const STROKES = [
  'M 8 28 C 45 14 95 8 140 18 C 175 24 210 12 248 20',
  'M 6 26 C 42 12 98 10 145 20 C 178 26 215 14 252 22',
  'M 10 30 C 48 16 100 12 138 22 C 172 28 208 16 250 24',
  'M 7 27 C 44 13 92 9 142 19 C 176 25 212 13 254 21',
  'M 9 29 C 46 15 96 11 136 21 C 170 27 206 15 248 23',
];

interface VelaHeaderProps {
  strokeIndex?: number;
  variant?: 'sidebar' | 'holding' | 'compact';
}

export default function VelaHeader({ strokeIndex = 0, variant = 'sidebar' }: VelaHeaderProps) {
  const stroke = STROKES[strokeIndex % STROKES.length];
  const uid = `vela-aurora-${strokeIndex}-${variant}`;
  const isHolding = variant === 'holding';

  return (
    <header className={`vela-brand-bar ${isHolding ? 'vela-brand-bar-holding' : ''}`}>
      <svg
        className="vela-brand-aurora"
        viewBox="0 0 260 48"
        preserveAspectRatio="none"
        aria-hidden
      >
        <defs>
          <linearGradient id={uid} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(84,126,84,0)" />
            <stop offset="18%" stopColor="rgba(107,145,88,0.55)" />
            <stop offset="45%" stopColor="rgba(140,162,80,0.7)" />
            <stop offset="72%" stopColor="rgba(107,145,88,0.5)" />
            <stop offset="100%" stopColor="rgba(84,126,84,0)" />
          </linearGradient>
          <linearGradient id={`${uid}-glow`} x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="rgba(84,126,84,0)" />
            <stop offset="50%" stopColor="rgba(84,126,84,0.12)" />
            <stop offset="100%" stopColor="rgba(84,126,84,0)" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="260" height="48" fill={`url(#${uid}-glow)`} />
        <path
          d={stroke}
          stroke={`url(#${uid})`}
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          className="aurora-stroke-path"
        />
        <path
          d={stroke}
          stroke={`url(#${uid})`}
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          opacity="0.25"
          className="aurora-stroke-glow"
        />
      </svg>
      <h1 className="vela-brand-title">Vela</h1>
    </header>
  );
}
