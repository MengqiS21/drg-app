'use client';

interface SignalMarkerProps {
  type: 'quiet_signal' | 'explicit_signal';
}

export default function SignalMarker({ type }: SignalMarkerProps) {
  const label = type === 'quiet_signal' ? 'quiet signal' : 'explicit signal';
  return (
    <div className={`signal-marker ${type === 'explicit_signal' ? 'explicit' : ''}`}>
      <div className="signal-accent-bar" />
      <span className="signal-label">{label}</span>
    </div>
  );
}
