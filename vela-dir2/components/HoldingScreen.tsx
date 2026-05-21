'use client';
import { useEffect } from 'react';

interface HoldingScreenProps {
  threadType: string;   // "a feeling", "a moment" etc.
  threadNote: string;   // the generated content
  userName: string;
  onDismiss: () => void;
}

export default function HoldingScreen({ threadType, threadNote, userName, onDismiss }: HoldingScreenProps) {
  // Auto-dismiss after 6 seconds
  useEffect(() => {
    const t = setTimeout(onDismiss, 6000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div
      onClick={onDismiss}
      style={{
        position: 'absolute', inset: 0,
        background: 'var(--warm-white)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center',
        padding: '52px 36px 52px',
        zIndex: 45,
        cursor: 'pointer',
      }}
    >
      {/* Vela header */}
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <p style={{
          fontFamily: 'var(--font-nunito), sans-serif',
          fontSize: 20, fontWeight: 600,
          color: 'var(--text-primary)',
        }}>
          Vela
        </p>
        <p style={{
          fontFamily: 'var(--font-nunito), sans-serif',
          fontSize: 12, color: 'var(--text-muted)',
          letterSpacing: '0.04em',
        }}>
          holding for you
        </p>
      </div>

      <div className="divider-gradient" style={{ width: '100%', margin: '16px 0' }} />

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Main message */}
      <p style={{
        fontFamily: 'var(--font-nunito), sans-serif',
        fontSize: 17, color: 'var(--text-secondary)',
        textAlign: 'center', lineHeight: 1.6,
        marginBottom: 28,
      }}>
        I&rsquo;ll hold this until you&rsquo;re ready.
      </p>

      {/* Thread card */}
      <div style={{
        width: '100%',
        background: 'rgba(84,126,84,0.07)',
        border: '1px solid rgba(84,126,84,0.18)',
        borderLeft: '3px solid var(--sage)',
        borderRadius: '2px 12px 12px 2px',
        padding: '14px 18px',
        marginBottom: 32,
      }}>
        <p style={{
          fontFamily: 'var(--font-nunito), sans-serif',
          fontSize: 11, fontWeight: 700,
          color: 'var(--sage)', letterSpacing: '0.04em',
          marginBottom: 6, textTransform: 'lowercase',
        }}>
          {threadType}
        </p>
        <p style={{
          fontFamily: 'var(--font-nunito), sans-serif',
          fontSize: 15, fontWeight: 600,
          color: 'var(--text-primary)', lineHeight: 1.45,
          marginBottom: 6,
        }}>
          {threadNote}
        </p>
        <p style={{
          fontFamily: 'var(--font-nunito), sans-serif',
          fontSize: 11, color: 'var(--text-muted)',
        }}>
          from tonight
        </p>
      </div>

      {/* Goodnight */}
      <p style={{
        fontFamily: 'var(--font-nunito), sans-serif',
        fontSize: 17, color: 'var(--text-secondary)',
        textAlign: 'center',
      }}>
        Goodnight{userName ? `, ${userName}` : ''}.
      </p>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      <p style={{
        fontFamily: 'var(--font-nunito), sans-serif',
        fontSize: 11, color: 'var(--text-muted)',
        letterSpacing: '0.04em',
      }}>
        tap to continue
      </p>
    </div>
  );
}
