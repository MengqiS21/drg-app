'use client';

/** Legacy dark blobs — prefer breath-space-aurora in BreathOverlay */
export default function AuroraBackground() {
  return (
    <div className="aurora-container aurora-container--dark">
      <div className="aurora-blob aurora-blob-1" />
      <div className="aurora-blob aurora-blob-2" />
      <div className="aurora-blob aurora-blob-3" />
      <div className="aurora-blob aurora-blob-4" />
    </div>
  );
}
