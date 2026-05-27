'use client';

interface VelaHeaderProps {
  strokeIndex?: number;
  variant?: 'sidebar' | 'holding' | 'compact';
  showTagline?: boolean;
}

export default function VelaHeader({
  strokeIndex = 0,
  variant = 'sidebar',
  showTagline = false,
}: VelaHeaderProps) {
  const isHolding = variant === 'holding';
  const phase = strokeIndex % 5;

  return (
    <header
      className={`vela-brand-bar ${isHolding ? 'vela-brand-bar-holding' : ''}`}
      data-aurora-phase={phase}
    >
      <div className="vela-aurora-layer" aria-hidden>
        <div className="vela-aurora-orb vela-aurora-orb-center" />
        <div className="vela-aurora-orb vela-aurora-orb-a" />
        <div className="vela-aurora-orb vela-aurora-orb-b" />
        <div className="vela-aurora-orb vela-aurora-orb-c" />
        <div className="vela-aurora-shimmer" />
      </div>
      <div className="vela-brand-center">
        <h1 className="vela-brand-title">Vela</h1>
        {(showTagline || isHolding) && (
          <p className="vela-brand-tagline">
            {isHolding ? 'holding for you' : 'always here'}
          </p>
        )}
      </div>
    </header>
  );
}
