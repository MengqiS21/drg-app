'use client';
import { useEffect, useState } from 'react';
import VelaHeader from './VelaHeader';

interface HoldingScreenProps {
  threadType: string;
  threadNote: string;
  userName: string;
  strokeIndex: number;
  onDismiss: () => void;
}

export default function HoldingScreen({
  threadType,
  threadNote,
  userName,
  strokeIndex,
  onDismiss,
}: HoldingScreenProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const enter = requestAnimationFrame(() => setVisible(true));
    const dismissTimer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 500);
    }, 5000);
    return () => {
      cancelAnimationFrame(enter);
      clearTimeout(dismissTimer);
    };
  }, [onDismiss]);

  return (
    <div
      className={`holding-screen ${visible ? 'holding-screen-visible' : ''}`}
      onClick={() => {
        setVisible(false);
        setTimeout(onDismiss, 400);
      }}
      role="presentation"
    >
      <div className="holding-screen-inner">
        <VelaHeader strokeIndex={strokeIndex} variant="holding" showTagline />

        <div className="holding-spacer" />

        <p className="holding-lead">I will hold this until you are ready.</p>

        <div className="thread-held-card holding-card">
          <p className="thread-held-type">{threadType}</p>
          <p className="thread-held-note">{threadNote}</p>
          <p className="thread-held-meta">from tonight</p>
        </div>

        <p className="holding-goodnight">
          Goodnight{userName ? `, ${userName}` : ''}.
        </p>

        <div className="holding-spacer" />

        <p className="holding-hint">tap to continue</p>
      </div>
    </div>
  );
}
