'use client';

interface BreathOverlayProps {
  onClose: () => void;
}

export default function BreathOverlay({ onClose }: BreathOverlayProps) {
  return (
    <div className="breath-overlay" onClick={onClose}>
      <p style={{
        fontFamily: 'var(--font-nunito), sans-serif',
        fontSize: 13,
        letterSpacing: '0.08em',
        color: 'rgba(255,255,255,0.45)',
        textTransform: 'lowercase',
        fontWeight: 400,
      }}>
        take a breath with me
      </p>

      {/* Gradient wave line */}
      <div style={{ width: 180, height: 26, position: 'relative' }}>
        <svg width="180" height="26" viewBox="0 0 180 26" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="waveGrad" x1="0" y1="0" x2="180" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="rgba(210,160,200,0.55)" />
              <stop offset="40%" stopColor="rgba(160,190,160,0.65)" />
              <stop offset="75%" stopColor="rgba(220,195,165,0.60)" />
              <stop offset="100%" stopColor="rgba(210,160,200,0.40)" />
            </linearGradient>
            <filter id="waveBlur">
              <feGaussianBlur stdDeviation="1.5" />
            </filter>
          </defs>
          <path
            d="M 0 2 C 26 -1 53 5 80 2 C 107 -1 134 5 160 2 L 160 5 C 134 8 107 2 80 5 C 53 8 26 2 0 5 Z"
            fill="url(#waveGrad)"
            filter="url(#waveBlur)"
            transform="translate(10, 10)"
          />
        </svg>
      </div>

      <p style={{
        fontFamily: 'var(--font-nunito), sans-serif',
        fontSize: 12,
        color: 'rgba(255,255,255,0.28)',
        fontWeight: 300,
        marginTop: 8,
      }}>
        tap anywhere to continue
      </p>
    </div>
  );
}
