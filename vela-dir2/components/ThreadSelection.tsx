'use client';
import { useState } from 'react';

const OPTIONS = [
  { id: 'moment',   label: 'a moment',              hint: 'something that happened' },
  { id: 'feeling',  label: 'a feeling',              hint: 'something you felt' },
  { id: 'memory',   label: 'a memory',               hint: 'something you were reminded of' },
  { id: 'question', label: 'something left open',    hint: 'a thought still sitting with you' },
];

interface ThreadSelectionProps {
  onContinue: (selected: string[]) => void;
  onSkip: () => void;
}

export default function ThreadSelection({ onContinue, onSkip }: ThreadSelectionProps) {
  const [selected, setSelected] = useState<string[]>([]);

  function toggle(id: string) {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'var(--warm-white)',
      display: 'flex', flexDirection: 'column',
      padding: '52px 40px 36px',
      zIndex: 40,
    }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <p style={{
          fontFamily: 'var(--font-nunito), sans-serif',
          fontSize: 11, color: 'var(--text-muted)',
          letterSpacing: '0.08em', textTransform: 'lowercase',
          marginBottom: 10,
        }}>
          before you go
        </p>
        <h2 style={{
          fontFamily: 'var(--font-nunito), sans-serif',
          fontSize: 22, fontWeight: 600,
          color: 'var(--text-primary)', lineHeight: 1.3,
        }}>
          what would you like<br />to hold from tonight?
        </h2>
        <p style={{
          fontFamily: 'var(--font-nunito), sans-serif',
          fontSize: 13, color: 'var(--text-secondary)',
          lineHeight: 1.6, marginTop: 10,
        }}>
          Vela will keep this for your next return.
        </p>
      </div>

      <div className="divider-gradient" style={{ margin: '0 0 28px' }} />

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        {OPTIONS.map(opt => {
          const isSelected = selected.includes(opt.id);
          return (
            <button
              key={opt.id}
              onClick={() => toggle(opt.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 18px',
                borderRadius: 12,
                border: isSelected
                  ? '1.5px solid var(--sage)'
                  : '1.5px solid var(--warm-tan)',
                background: isSelected ? 'var(--sage-muted)' : 'var(--warm-cream)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.18s ease',
              }}
            >
              {/* Checkbox circle */}
              <div style={{
                width: 20, height: 20, borderRadius: '50%',
                border: isSelected ? '2px solid var(--sage)' : '1.5px solid var(--warm-stone)',
                background: isSelected ? 'var(--sage)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, transition: 'all 0.18s ease',
              }}>
                {isSelected && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <div>
                <p style={{
                  fontFamily: 'var(--font-nunito), sans-serif',
                  fontSize: 15, fontWeight: 600,
                  color: isSelected ? 'var(--sage)' : 'var(--text-primary)',
                  transition: 'color 0.18s',
                }}>
                  {opt.label}
                </p>
                <p style={{
                  fontFamily: 'var(--font-nunito), sans-serif',
                  fontSize: 12, color: 'var(--text-muted)',
                  marginTop: 1,
                }}>
                  {opt.hint}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 28 }}>
        <button
          onClick={() => onContinue(selected)}
          disabled={selected.length === 0}
          style={{
            height: 48, borderRadius: 24,
            background: selected.length > 0 ? 'var(--sage)' : 'var(--warm-tan)',
            color: selected.length > 0 ? '#fff' : 'var(--text-muted)',
            fontFamily: 'var(--font-nunito), sans-serif',
            fontSize: 15, fontWeight: 600,
            border: 'none', cursor: selected.length > 0 ? 'pointer' : 'default',
            transition: 'all 0.2s',
            letterSpacing: '0.01em',
          }}
        >
          continue
        </button>
        <button
          onClick={onSkip}
          style={{
            height: 40, borderRadius: 20,
            background: 'transparent', border: 'none',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-nunito), sans-serif',
            fontSize: 13, cursor: 'pointer',
          }}
        >
          leave without saving
        </button>
      </div>
    </div>
  );
}
