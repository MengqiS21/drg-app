'use client';

export type PaceDisplaySignal = 'pace_signal' | 'weight_signal' | 'intense_signal';

interface SignalMarkerProps {
  type: PaceDisplaySignal;
}

const LABELS: Record<PaceDisplaySignal, string> = {
  pace_signal: 'pace signal',
  weight_signal: 'weight signal',
  intense_signal: 'intense signal',
};

export default function SignalMarker({ type }: SignalMarkerProps) {
  return (
    <div className={`signal-marker signal-${type}`}>
      <div className="signal-accent-bar" />
      <span className="signal-target-icon" aria-hidden>◎</span>
      <span className="signal-label">{LABELS[type]}</span>
    </div>
  );
}
