'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import Sidebar from './Sidebar';
import ChatScreen, { consumeStrokeIndex } from './ChatScreen';

const SIDEBAR_MIN = 200;
const SIDEBAR_MAX = 420;
const SIDEBAR_DEFAULT = 280;

export default function AppLayout() {
  const [strokeIndex, setStrokeIndex] = useState(0);
  const [sessionTick, setSessionTick] = useState(0);
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

  useEffect(() => {
    setStrokeIndex(consumeStrokeIndex());
  }, []);

  return (
    <div className="app-shell app-shell-dark">
      <div style={{ width: sidebarWidth, flexShrink: 0, position: 'relative' }}>
        <Sidebar strokeIndex={strokeIndex} sessionTick={sessionTick} />
        <div onMouseDown={handleDragStart} className="sidebar-resize-handle" role="separator" aria-orientation="vertical" />
      </div>

      <div className="chat-column chat-column-dark">
        <div className="chat-column-header">
          <p className="chat-column-date">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <p className="chat-column-tagline">moving at your pace</p>
        </div>
        <div className="chat-column-main">
          <ChatScreen onSessionsUpdated={() => setSessionTick(t => t + 1)} />
        </div>
      </div>
    </div>
  );
}
