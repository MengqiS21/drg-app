'use client';
import { useState } from 'react';

const OPTIONS = [
  { id: 'moment',   label: 'a moment',   hint: 'mark where we stopped' },
  { id: 'feeling',  label: 'a feeling',  hint: 'what this left with you' },
  { id: 'question', label: 'a question', hint: 'something not yet ready to ask' },
  { id: 'open',     label: 'something left open', hint: 'a thought still sitting with you' },
];

interface ThreadSelectionProps {
  onContinue: (selected: string) => void;
  onSkip: () => void;
}

export default function ThreadSelection({ onContinue, onSkip }: ThreadSelectionProps) {
  const [selected, setSelected] = useState<string>('');

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'var(--warm-white)',
      display: 'flex', flexDirection: 'column',
      padding: '60px 36px 40px',
      zIndex: 40,
    }}>
      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <h2 style={{
          fontFamily: 'var(--font-nunito), sans-serif',
          fontSize: 28, fontWeight: 700,
          color: 'var(--text-primary)', lineHeight: 1.2, marginBottom: 10,
        }}>
          Before you go.
        </h2>
        <p style={{
          fontFamily: 'var(--font-nunito), sans-serif',
          fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.5,
        }}>
          What should I hold for you?
        </p>
      </div>

      {/* Single-select options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
        {OPTIONS.map(opt => {
          const isSelected = selected === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => setSelected(opt.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 16,
                padding: '16px 20px', borderRadius: 16,
                border: isSelected
                  ? '2px solid var(--sage)'
                  : '1.5px solid var(--warm-tan)',
                background: isSelected ? 'rgba(84,126,84,0.08)' : 'var(--warm-cream)',
                cursor: 'pointer', textAlign: 'left',
                transition: 'all 0.18s ease',
              }}
            >
              {/* Radio circle */}
              <div style={{
                width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                border: isSelected ? '2px solid var(--sage)' : '1.5px solid var(--warm-stone)',
                background: isSelected ? 'var(--sage)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.18s ease',
              }}>
                {isSelected && (
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'white' }} />
                )}
              </div>
              <div>
                <p style={{
                  fontFamily: 'var(--font-nunito), sans-serif',
                  fontSize: 16, fontWeight: 600,
                  color: isSelected ? 'var(--sage)' : 'var(--text-primary)',
                  transition: 'color 0.18s',
                }}>
                  {opt.label}
                </p>
                <p style={{
                  fontFamily: 'var(--font-nunito), sans-serif',
                  fontSize: 12, color: 'var(--text-muted)', marginTop: 2,
                }}>
                  {opt.hint}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 32 }}>
        <button
          onClick={() => selected && onContinue(OPTIONS.find(o => o.id === selected)!.label)}
          disabled={!selected}
          style={{
            height: 52, borderRadius: 26,
            background: selected ? 'var(--sage)' : 'var(--warm-tan)',
            color: selected ? '#fff' : 'var(--text-muted)',
            fontFamily: 'var(--font-nunito), sans-serif',
            fontSize: 15, fontWeight: 600, letterSpacing: '0.01em',
            border: 'none', cursor: selected ? 'pointer' : 'default',
            transition: 'all 0.2s',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          write it down
          {selected && <span style={{ fontSize: 16 }}>→</span>}
        </button>
        <button onClick={onSkip} style={{
          height: 40, background: 'transparent', border: 'none',
          color: 'var(--text-muted)', fontFamily: 'var(--font-nunito), sans-serif',
          fontSize: 13, cursor: 'pointer',
        }}>
          leave without saving
        </button>
      </div>
    </div>
  );
}
