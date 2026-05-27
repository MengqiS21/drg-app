'use client';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  BREATH_ENTER_MS,
  BREATH_EXIT_MS,
  BREATH_HOLD_MS,
  BREATH_CYCLE_MS,
  BREATH_MOMENT_LABELS,
  BREATH_HOLD_CUES,
  BREATH_ENTER_SUBLINE,
  BREATH_EXIT_SUBLINE,
} from '@/lib/breathConfig';

type BreathPhase = 'enter' | 'hold' | 'exit';

interface BreathOverlayProps {
  onComplete: () => void;
}

export default function BreathOverlay({ onComplete }: BreathOverlayProps) {
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<BreathPhase>('enter');
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.body.classList.add('breath-active');
    return () => document.body.classList.remove('breath-active');
  }, [mounted]);

  useEffect(() => {
    const t1 = window.setTimeout(() => setPhase('hold'), BREATH_ENTER_MS);
    const t2 = window.setTimeout(() => setPhase('exit'), BREATH_ENTER_MS + BREATH_HOLD_MS);
    const t3 = window.setTimeout(
      () => onComplete(),
      BREATH_ENTER_MS + BREATH_HOLD_MS + BREATH_EXIT_MS
    );
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  useEffect(() => {
    if (phase !== 'hold') return;
    const id = window.setInterval(() => setCycle(c => c + 1), BREATH_CYCLE_MS);
    return () => clearInterval(id);
  }, [phase]);

  const momentLabel =
    phase === 'enter'
      ? BREATH_MOMENT_LABELS[0]
      : phase === 'exit'
        ? BREATH_MOMENT_LABELS[0]
        : BREATH_MOMENT_LABELS[Math.floor(cycle / 2) % BREATH_MOMENT_LABELS.length];

  const subline =
    phase === 'enter'
      ? BREATH_ENTER_SUBLINE
      : phase === 'exit'
        ? BREATH_EXIT_SUBLINE
        : BREATH_HOLD_CUES[cycle % BREATH_HOLD_CUES.length];

  if (!mounted) return null;

  return createPortal(
    <div
      className={`breath-overlay breath-overlay--${phase}`}
      role="dialog"
      aria-modal="true"
      aria-label="Breath space"
      aria-live="polite"
    >
      <div className="breath-space-aurora" aria-hidden>
        <div className="breath-orb breath-orb-rose" />
        <div className="breath-orb breath-orb-sage" />
        <div className="breath-orb breath-orb-gold" />
        <div className="breath-orb breath-orb-lavender" />
        <div className="breath-orb breath-orb-coral" />
        <div className="breath-orb breath-orb-teal" />
        <div className="breath-orb breath-orb-violet" />
        <div className="breath-orb breath-orb-sky" />
        <div className="breath-orb breath-orb-magenta" />
        <div className="breath-orb breath-orb-amber" />
        <div className="breath-orb breath-orb-mint" />
      </div>

      <div className="breath-space-content">
        <header className="breath-space-header">
          <h1 className="breath-space-title">Vela</h1>
          <p className="breath-space-tagline">moving at your pace</p>
        </header>

        <div className="breath-space-center">
          <p key={`label-${momentLabel}-${phase}`} className="breath-moment-label breath-line-fade">
            {momentLabel}
          </p>
          <p className="breath-invite">breathe with me</p>
          <p key={`sub-${subline}-${phase}-${cycle}`} className="breath-cycle-cue breath-line-fade">
            {subline}
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
}
