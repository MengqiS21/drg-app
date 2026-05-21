'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import Sidebar from './Sidebar';
import ChatScreen, { getStrokeIndex } from './ChatScreen';

const SIDEBAR_MIN = 200;
const SIDEBAR_MAX = 420;
const SIDEBAR_DEFAULT = 280;

export default function AppLayout() {
  const [strokeIndex] = useState(() => getStrokeIndex());
  const [tonightNote, setTonightNote] = useState('');
  const [triggerEnd, setTriggerEnd] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR_DEFAULT);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartWidth = useRef(SIDEBAR_DEFAULT);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging.current) return;
    const delta = e.clientX - dragStartX.current;
    setSidebarWidth(Math.min(SIDEBAR_MAX, Math.max(SIDEBAR_MIN, dragStartWidth.current + delta)));
  }, []);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);

  function handleDragStart(e: React.MouseEvent) {
    e.preventDefault();
    isDragging.current = true;
    dragStartX.current = e.clientX;
    dragStartWidth.current = sidebarWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }

  useEffect(() => () => {
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove, handleMouseUp]);

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100%', background: 'var(--bg-dark)', overflow: 'hidden' }}>
      <div style={{ width: sidebarWidth, flexShrink: 0, position: 'relative' }}>
        <Sidebar strokeIndex={strokeIndex} onEndSession={() => setTriggerEnd(true)} tonightNote={tonightNote} />

        {/* Drag handle */}
        <div onMouseDown={handleDragStart} style={{
          position: 'absolute', top: 0, right: -4,
          width: 8, height: '100%', cursor: 'col-resize', zIndex: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            width: 2, height: 40, borderRadius: 1,
            background: 'rgba(255,255,255,0.15)', opacity: 0.5, transition: 'opacity 0.2s',
          }} />
        </div>
      </div>

      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        minWidth: 0, borderLeft: '1px solid rgba(255,255,255,0.06)', position: 'relative',
      }}>
        <div style={{
          padding: '20px 28px 14px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0,
        }}>
          <p style={{ fontFamily: 'var(--font-nunito), sans-serif', fontSize: 13, color: 'var(--text-muted)' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <p style={{ fontFamily: 'var(--font-nunito), sans-serif', fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
            · moving at your pace ·
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
