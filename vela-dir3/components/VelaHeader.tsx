'use client';

interface VelaHeaderProps {
  strokeIndex?: number;
}

/** Title only — aurora lives on .sidebar-aurora-zone in Sidebar */
export default function VelaHeader({ strokeIndex = 0 }: VelaHeaderProps) {
  return (
    <header
      className="vela-brand-bar vela-brand-bar-dark"
      data-aurora-phase={strokeIndex % 5}
    >
      <h1 className="vela-brand-title vela-brand-title-dark">Vela</h1>
    </header>
  );
}
