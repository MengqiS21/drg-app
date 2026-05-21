'use client';
import { useState } from 'react';

interface WriteItDownProps {
  summary: string;
  onApprove: (text: string) => void;
  onContinue: () => void;
}

export default function WriteItDown({ summary, onApprove, onContinue }: WriteItDownProps) {
  const [text, setText] = useState(summary);
  const [approved, setApproved] = useState(false);

  function handleApprove() {
    setApproved(true);
    onApprove(text);
    setTimeout(() => onContinue(), 1200);
  }

  return (
    <div className="write-screen">
      {/* Header */}
      <div style={{ marginBottom: 8 }}>
        <p style={{
          fontFamily: 'var(--font-nunito), sans-serif',
          fontSize: 11,
          color: 'var(--text-muted)',
          letterSpacing: '0.06em',
          textTransform: 'lowercase',
          marginBottom: 6,
        }}>
          vela has summarized this for you
        </p>
        <h2 style={{
          fontFamily: 'var(--font-nunito), sans-serif',
          fontSize: 18,
          fontWeight: 600,
          color: 'var(--text-primary)',
          lineHeight: 1.3,
        }}>
          Here&rsquo;s what I&rsquo;d hold from tonight.
        </h2>
      </div>

      <div className="divider-gradient" style={{ margin: '16px 0' }} />

      {/* Editable text box */}
      <div style={{
        flex: 1,
        background: 'var(--warm-cream)',
        borderRadius: 12,
        border: '1px solid var(--warm-tan)',
        padding: '16px',
        position: 'relative',
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
        {/* Edit hint pill */}
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
            ✎ edit
          </span>
        </div>
      </div>

      {/* Approve button */}
      <button
        onClick={handleApprove}
        disabled={approved}
        style={{
          marginTop: 24,
          width: '100%',
          height: 48,
          borderRadius: 24,
          background: approved ? 'var(--sage-light)' : 'var(--sage)',
          color: '#fff',
          fontFamily: 'var(--font-nunito), sans-serif',
          fontSize: 15,
          fontWeight: 600,
          border: 'none',
          cursor: approved ? 'default' : 'pointer',
          transition: 'background 0.3s',
          letterSpacing: '0.01em',
        }}
      >
        {approved ? 'saved' : 'approve and leave'}
      </button>
    </div>
  );
}
