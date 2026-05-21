'use client';

const STROKES = [
  'M 58 18 C 70 12 84 10 98 14 C 110 18 120 13 133 13',
  'M 55 16 C 68 9 85 12 100 16 C 113 14 125 8 138 11',
  'M 60 20 C 72 14 88 11 103 15 C 115 19 127 12 140 14',
  'M 56 17 C 69 10 86 13 101 17 C 114 15 126 9 139 12',
  'M 62 19 C 74 13 90 10 105 14 C 117 18 129 11 142 13',
];

interface VelaHeaderProps {
  strokeIndex?: number;
  size?: 'default' | 'sidebar';
}

export default function VelaHeader({ strokeIndex = 0, size = 'default' }: VelaHeaderProps) {
  const stroke = STROKES[strokeIndex % STROKES.length];
  const isSidebar = size === 'sidebar';
  const gradId = `d3auroraGrad-${strokeIndex}-${isSidebar ? 's' : 'd'}`;
  const filtId = `d3inkBlur-${strokeIndex}-${isSidebar ? 's' : 'd'}`;

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {/* Aurora stroke — purple/rose palette for Dir3 */}
      <svg
        width="180"
        height="36"
        viewBox="0 0 180 36"
        style={{ position: 'absolute', top: -8, left: -10, pointerEvents: 'none' }}
      >
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(188,140,200,0)" />
            <stop offset="25%" stopColor="rgba(188,140,200,0.65)">
              <animate
                attributeName="stop-color"
                values="rgba(188,140,200,0.65);rgba(130,165,120,0.6);rgba(200,160,100,0.55);rgba(150,130,200,0.65);rgba(188,140,200,0.65)"
                dur="6s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="65%" stopColor="rgba(130,165,120,0.5)">
              <animate
                attributeName="stop-color"
                values="rgba(130,165,120,0.5);rgba(200,160,100,0.5);rgba(188,140,200,0.45);rgba(130,165,120,0.5)"
                dur="6s"
                begin="2s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="100%" stopColor="rgba(188,140,200,0)" />
          </linearGradient>
          <filter id={filtId}>
            <feGaussianBlur stdDeviation="1" />
          </filter>
        </defs>
        <path
          d={stroke}
          stroke={`url(#${gradId})`}
          strokeWidth={isSidebar ? '2.8' : '2.4'}
          fill="none"
          strokeLinecap="round"
          filter={`url(#${filtId})`}
        />
      </svg>

      <h1 style={{
        fontFamily: 'var(--font-nunito), sans-serif',
        fontSize: isSidebar ? 26 : 22,
        fontWeight: 600,
        color: 'var(--text-primary)',
        letterSpacing: '-0.01em',
        position: 'relative',
        zIndex: 1,
      }}>
        vela
      </h1>
    </div>
  );
}
