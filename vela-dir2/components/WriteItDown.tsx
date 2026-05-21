'use client';
import { useState } from 'react';

interface WriteItDownProps {
  summary: string;
  onApprove: (text: string) => void;
  onContinue: () => void;
}

export default function WriteItDown({ summary, onApprove }: WriteItDownProps) {
  const [text, setText] = useState(summary);
  const [approved, setApproved] = useState(false);

  function handleApprove() {
    if (approved) return;
    setApproved(true);
    onApprove(text.trim());
  }

  return (
    <div className="write-screen">
      <div style={{ marginBottom: 8 }}>
        <p style={{
          fontFamily: 'var(--font-nunito), sans-serif',
          fontSize: 11,
          color: 'var(--text-muted)',
          letterSpacing: '0.06em',
          textTransform: 'lowercase',
          marginBottom: 6,
        }}>
          vela summarized this for you
        </p>
        <h2 style={{
          fontFamily: 'var(--font-nunito), sans-serif',
          fontSize: 18,
          fontWeight: 600,
          color: 'var(--text-primary)',
          lineHeight: 1.3,
        }}>
          Here is what I would hold from tonight.
        </h2>
      </div>

      <div className="divider-gradient" style={{ margin: '16px 0' }} />

      <div style={{
        flex: 1,
        background: 'var(--warm-cream)',
        borderRadius: 12,
        border: '1px solid var(--warm-tan)',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontFamily: 'var(--font-nunito), sans-serif',
            fontSize: 14,
            lineHeight: 1.65,
            color: 'var(--text-primary)',
            resize: 'none',
            width: '100%',
            minHeight: 180,
          }}
        />
        <div style={{
          alignSelf: 'flex-end',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          background: 'rgba(84,126,84,0.08)',
          border: '1px solid rgba(84,126,84,0.2)',
          borderRadius: 20,
          padding: '3px 10px',
          marginTop: 8,
        }}>
          <span style={{ fontSize: 11, color: 'var(--sage)', fontFamily: 'var(--font-nunito), sans-serif', fontWeight: 500 }}>
            edit
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleApprove}
        disabled={approved || !text.trim()}
        className="hold-cta-btn"
        style={{ marginTop: 24, width: '100%' }}
      >
        {approved ? 'Saved' : 'Approve and leave'}
      </button>
    </div>
  );
}
