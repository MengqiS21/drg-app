'use client';
import { useEffect, useState } from 'react';

interface WriteItDownProps {
  summary: string;
  threadType: string;
  onApprove: (text: string) => void;
}

export default function WriteItDown({ summary, threadType, onApprove }: WriteItDownProps) {
  const [text, setText] = useState(summary);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setText(summary);
  }, [summary]);

  function handleApprove() {
    if (saving || !text.trim()) return;
    setSaving(true);
    onApprove(text.trim());
  }

  return (
    <div className="write-screen">
      <div className="write-screen-header">
        <p className="write-screen-eyebrow">vela summarized this for you</p>
        <h2 className="write-screen-title">Here is what I would hold from tonight.</h2>
        <p className="write-screen-hint">
          You can edit the words below before you leave.
        </p>
      </div>

      <div className="divider-gradient" style={{ margin: '12px 0 16px' }} />

      <div className="write-summary-panel">
        <p className="write-summary-type">{threadType}</p>
        <textarea
          className="write-summary-field"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Your thread will appear here…"
          autoFocus
          rows={6}
          aria-label="Edit what Vela will hold from tonight"
        />
        <p className="write-summary-edit-note">Tap the text to change it.</p>
      </div>

      <button
        type="button"
        onClick={handleApprove}
        disabled={saving || !text.trim()}
        className="hold-cta-btn hold-cta-btn--block write-approve-btn"
      >
        {saving ? 'Saving…' : 'Approve and leave'}
      </button>
    </div>
  );
}
