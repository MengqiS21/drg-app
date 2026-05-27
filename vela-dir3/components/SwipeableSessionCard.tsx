'use client';
import { useRef, useState, useCallback } from 'react';
import TrashIcon from './icons/TrashIcon';
import { formatSessionDate, type Session } from '@/lib/memory';

const REVEAL_WIDTH = 52;
const OPEN_THRESHOLD = 28;

interface SwipeableSessionCardProps {
  session: Session;
  expanded: boolean;
  onToggleExpand: () => void;
  onDelete: (id: string) => void;
}

export default function SwipeableSessionCard({
  session,
  expanded,
  onToggleExpand,
  onDelete,
}: SwipeableSessionCardProps) {
  const [offset, setOffset] = useState(0);
  const [open, setOpen] = useState(false);
  const dragRef = useRef({ startX: 0, startOffset: 0, dragging: false, moved: false });

  const snap = useCallback((value: number) => {
    const shouldOpen = value < -OPEN_THRESHOLD;
    setOpen(shouldOpen);
    setOffset(shouldOpen ? -REVEAL_WIDTH : 0);
  }, []);

  function onPointerDown(e: React.PointerEvent) {
    if ((e.target as HTMLElement).closest('.thread-delete-btn')) return;
    dragRef.current = {
      startX: e.clientX,
      startOffset: open ? -REVEAL_WIDTH : 0,
      dragging: true,
      moved: false,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragRef.current.dragging) return;
    const delta = e.clientX - dragRef.current.startX;
    if (Math.abs(delta) > 4) dragRef.current.moved = true;
    const next = Math.min(0, Math.max(-REVEAL_WIDTH, dragRef.current.startOffset + delta));
    setOffset(next);
  }

  function onPointerUp(e: React.PointerEvent) {
    if (!dragRef.current.dragging) return;
    dragRef.current.dragging = false;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
    const delta = e.clientX - dragRef.current.startX;
    const finalOffset = Math.min(
      0,
      Math.max(-REVEAL_WIDTH, dragRef.current.startOffset + delta)
    );
    snap(finalOffset);
  }

  function handleDelete() {
    onDelete(session.id);
    setOpen(false);
    setOffset(0);
  }

  return (
    <div className={`swipe-thread-wrap${open ? ' swipe-thread-wrap--open' : ''}`}>
      <div className="swipe-thread-actions" aria-hidden={!open}>
        <button
          type="button"
          className="thread-delete-btn"
          onClick={handleDelete}
          aria-label="Delete session summary"
          tabIndex={open ? 0 : -1}
        >
          <TrashIcon size={15} />
        </button>
      </div>
      <div
        className="swipe-thread-track"
        style={{ transform: `translateX(${offset}px)` }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <button
          type="button"
          className="sidebar-session-card sidebar-session-card-dark swipe-thread-card"
          onClick={() => {
            if (!dragRef.current.moved) onToggleExpand();
            dragRef.current.moved = false;
          }}
        >
          <p className="sidebar-session-date sidebar-session-date-dark">{formatSessionDate(session.date)}</p>
          <p
            className="sidebar-session-note"
            style={{ WebkitLineClamp: expanded ? undefined : 3 }}
          >
            {session.note}
          </p>
        </button>
      </div>
    </div>
  );
}
