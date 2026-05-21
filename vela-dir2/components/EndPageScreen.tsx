'use client';
import { useEffect, useState } from 'react';

interface EndPageScreenProps {
  onComplete: () => void;
}

export default function EndPageScreen({ onComplete }: EndPageScreenProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const enter = requestAnimationFrame(() => setVisible(true));
    const done = setTimeout(() => {
      setVisible(false);
      setTimeout(onComplete, 700);
    }, 4200);
    return () => {
      cancelAnimationFrame(enter);
      clearTimeout(done);
    };
  }, [onComplete]);

  return (
    <div
      className={`end-page-screen ${visible ? 'end-page-visible' : ''}`}
      role="presentation"
      aria-hidden
    >
      <div className="end-page-glow end-page-glow-1" />
      <div className="end-page-glow end-page-glow-2" />
      <div className="end-page-glow end-page-glow-3" />
      <div className="end-page-ring end-page-ring-1" />
      <div className="end-page-ring end-page-ring-2" />
      <p className="end-page-word">rest</p>
    </div>
  );
}
