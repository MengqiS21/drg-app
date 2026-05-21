'use client';
import AuroraBackground from './AuroraBackground';

interface BreathOverlayProps {
  onClose: () => void;
}

export default function BreathOverlay({ onClose }: BreathOverlayProps) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'absolute',
        inset: 0,
        background: 'var(--bg-dark)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        gap: 20,
        cursor: 'pointer',
      }}
    >
      {/* Aurora blobs fill the entire screen */}
      <AuroraBackground />

      {/* Content above aurora */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
        <p style={{
          fontFamily: 'var(--font-nunito), sans-serif',
          fontSize: 15,
          letterSpacing: '0.1em',
          color: 'rgba(232,228,220,0.55)',
          textTransform: 'lowercase',
          fontWeight: 300,
        }}>
          take a breath with me
        </p>

        {/* Animated gradient wave */}
        <svg width="200" height="28" viewBox="0 0 200 28" fill="none">
          <defs>
            <linearGradient id="breathWave" x1="0" y1="0" x2="200" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="rgba(188,140,200,0)">
                <animate attributeName="stop-color"
                  values="rgba(188,140,200,0);rgba(188,140,200,0);rgba(188,140,200,0)"
                  dur="5s" repeatCount="indefinite" />
              </stop>
              <stop offset="30%" stopColor="rgba(188,140,200,0.5)">
                <animate attributeName="stop-color"
                  values="rgba(188,140,200,0.5);rgba(130,165,120,0.5);rgba(200,160,100,0.45);rgba(188,140,200,0.5)"
                  dur="5s" repeatCount="indefinite" />
              </stop>
              <stop offset="65%" stopColor="rgba(130,165,120,0.45)">
                <animate attributeName="stop-color"
                  values="rgba(130,165,120,0.45);rgba(200,160,100,0.4);rgba(188,140,200,0.45);rgba(130,165,120,0.45)"
                  dur="5s" begin="1.5s" repeatCount="indefinite" />
              </stop>
              <stop offset="100%" stopColor="rgba(188,140,200,0)" />
            </linearGradient>
            <filter id="waveGlow">
              <feGaussianBlur stdDeviation="2" />
            </filter>
          </defs>
          {/* Ribbon wave path */}
          <path
            d="M 0 2 C 30 -2 60 6 90 2 C 120 -2 150 6 180 2 L 180 6 C 150 10 120 2 90 6 C 60 10 30 2 0 6 Z"
            fill="url(#breathWave)"
            filter="url(#waveGlow)"
            transform="translate(10, 10)"
          />
        </svg>

        <p style={{
          fontFamily: 'var(--font-nunito), sans-serif',
          fontSize: 11,
          color: 'rgba(232,228,220,0.22)',
          fontWeight: 300,
          letterSpacing: '0.04em',
          marginTop: 4,
        }}>
          tap anywhere to continue
        </p>
      </div>
    </div>
  );
}
