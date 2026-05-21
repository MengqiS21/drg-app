'use client';

export type DisplaySignal = 'quiet_signal' | 'explicit_signal' | 'gentle_forced_exit';

interface SignalMarkerProps {
  type: DisplaySignal;
}

const LABELS: Record<DisplaySignal, string> = {
  quiet_signal: 'quiet signal',
  explicit_signal: 'explicit signal',
  gentle_forced_exit: 'gentle exit',
};

export default function SignalMarker({ type }: SignalMarkerProps) {
  return (
    <div className={`signal-marker ${type === 'explicit_signal' ? 'explicit' : ''} ${type === 'gentle_forced_exit' ? 'forced' : ''}`}>
      <div className="signal-accent-bar" />
      <span className="signal-target-icon" aria-hidden>◎</span>
      <span className="signal-label">{LABELS[type]}</span>
    </div>
  );
}
