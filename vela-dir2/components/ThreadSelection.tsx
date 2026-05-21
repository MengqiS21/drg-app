'use client';
import { useState } from 'react';

const OPTIONS = [
  { id: 'moment', label: 'a moment', hint: 'mark where we stopped' },
  { id: 'feeling', label: 'a feeling', hint: 'what this left with you' },
  { id: 'question', label: 'a question', hint: 'something not yet ready to ask' },
  { id: 'open', label: 'something left open', hint: 'a thought still sitting with you' },
];

interface ThreadSelectionProps {
  onContinue: (selected: string) => void;
  onSkip: () => void;
  loading?: boolean;
}

export default function ThreadSelection({ onContinue, onSkip, loading }: ThreadSelectionProps) {
  const [selected, setSelected] = useState<string>('');

  return (
    <div className="thread-select-screen">
      <div style={{ marginBottom: 36 }}>
        <h2 className="thread-select-title">Before you go.</h2>
        <p className="thread-select-sub">What should I hold for you?</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
        {OPTIONS.map(opt => {
          const isSelected = selected === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setSelected(opt.id)}
              disabled={loading}
              className={`thread-option ${isSelected ? 'thread-option-selected' : ''}`}
            >
              <div className={`thread-option-radio ${isSelected ? 'selected' : ''}`}>
                {isSelected && <div className="thread-option-radio-dot" />}
              </div>
              <div>
                <p className="thread-option-label">{opt.label}</p>
                <p className="thread-option-hint">{opt.hint}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 32 }}>
        <button
          type="button"
          onClick={() => selected && onContinue(OPTIONS.find(o => o.id === selected)!.label)}
          disabled={!selected || loading}
          className="hold-cta-btn hold-cta-btn--block"
          style={{ opacity: !selected || loading ? 0.55 : 1 }}
        >
          {loading ? 'Writing it down…' : 'Write it down'}
        </button>
        <button type="button" onClick={onSkip} disabled={loading} className="thread-skip-btn">
          Leave without saving
        </button>
      </div>
    </div>
  );
}
