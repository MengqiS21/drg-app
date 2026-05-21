'use client';
import { useState } from 'react';
import Sidebar from './Sidebar';
import ChatScreen, { getStrokeIndex } from './ChatScreen';

export default function AppLayout() {
  const [strokeIndex] = useState(() => getStrokeIndex());
  const [tonightNote, setTonightNote] = useState('');
  const [triggerEnd, setTriggerEnd] = useState(false);

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      width: '100%',
      background: 'var(--warm-white)',
      overflow: 'hidden',
    }}>
      <Sidebar
        strokeIndex={strokeIndex}
        onEndSession={() => setTriggerEnd(true)}
        tonightNote={tonightNote}
      />

      {/* Chat column */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        borderLeft: '1px solid var(--warm-tan)',
        position: 'relative',
      }}>
        {/* Top bar with date */}
        <div style={{
          padding: '20px 28px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--warm-tan)',
          flexShrink: 0,
        }}>
          <p style={{
            fontFamily: 'var(--font-nunito), sans-serif',
            fontSize: 13,
            color: 'var(--text-muted)',
            fontWeight: 400,
          }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <p style={{
            fontFamily: 'var(--font-nunito), sans-serif',
            fontSize: 11,
            color: 'var(--text-muted)',
            letterSpacing: '0.06em',
          }}>
            always here
          </p>
        </div>

        <ChatScreen
          onTonightNoteChange={setTonightNote}
          triggerEndSession={triggerEnd}
          onEndSessionHandled={() => setTriggerEnd(false)}
        />
      </div>
    </div>
  );
}
