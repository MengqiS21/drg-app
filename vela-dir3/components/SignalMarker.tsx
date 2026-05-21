'use client';

interface SignalMarkerProps {
  type: 'quiet_signal' | 'explicit_signal' | 'none';
}

export default function SignalMarker({ type }: SignalMarkerProps) {
  if (type === 'none') return null;
  return (
    <div className="signal-marker">
      <div className="signal-accent-bar" />
      <span className="signal-label">pace signal</span>
    </div>
  );
}
