'use client';
import { useState, useEffect, useCallback } from 'react';
import VelaHeader from './VelaHeader';
import SwipeableSessionCard from './SwipeableSessionCard';
import {
  loadMemory,
  setUserName,
  deleteSession,
  formatSince,
  formatSessionDate,
  type VelaMemory,
} from '@/lib/memory';

interface SidebarProps {
  strokeIndex: number;
  sessionTick?: number;
}

export default function Sidebar({ strokeIndex, sessionTick = 0 }: SidebarProps) {
  const [memory, setMemory] = useState<VelaMemory>({ userName: '', since: '', sessions: [] });
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const refreshMemory = useCallback(() => {
    setMemory(loadMemory());
  }, []);

  useEffect(() => {
    const m = loadMemory();
    setMemory(m);
    if (!m.userName) setEditingName(true);
    else setNameInput(m.userName);
  }, []);

  useEffect(() => {
    refreshMemory();
  }, [sessionTick, refreshMemory]);

  function handleNameSave() {
    if (!nameInput.trim()) return;
    setUserName(nameInput.trim());
    setMemory(prev => ({ ...prev, userName: nameInput.trim() }));
    setEditingName(false);
  }

  function handleDeleteSession(id: string) {
    deleteSession(id);
    refreshMemory();
    if (expandedId === id) setExpandedId(null);
  }

  const latest = memory.sessions[0];
  const older = memory.sessions.slice(1);

  return (
    <aside className="sidebar-panel sidebar-panel-dark">
      <div className="sidebar-aurora-zone" data-aurora-phase={strokeIndex % 5}>
        <div className="vela-aurora-layer" aria-hidden>
          <div className="vela-aurora-orb vela-aurora-orb-center" />
          <div className="vela-aurora-orb vela-aurora-orb-a" />
          <div className="vela-aurora-orb vela-aurora-orb-b" />
          <div className="vela-aurora-orb vela-aurora-orb-c" />
          <div className="vela-aurora-shimmer" />
        </div>
        <VelaHeader strokeIndex={strokeIndex} />
        <p className="sidebar-tagline-dark">moving at your pace</p>
        <div className="sidebar-aurora-divider" aria-hidden />
      </div>

      <div className="sidebar-profile">
        <div className="sidebar-avatar sidebar-avatar-dark">
          <span>{memory.userName ? memory.userName[0].toUpperCase() : '·'}</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          {editingName ? (
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <input
                autoFocus
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleNameSave()}
                placeholder="your name"
                className="sidebar-name-input sidebar-name-input-dark"
              />
              <button type="button" onClick={handleNameSave} className="sidebar-name-save sidebar-name-save-dark">
                save
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="sidebar-display-name">{memory.userName || 'Guest'}</span>
              <button
                type="button"
                onClick={() => { setNameInput(memory.userName); setEditingName(true); }}
                className="sidebar-edit-name"
                aria-label="Edit name"
              >
                ✎
              </button>
            </div>
          )}
          {memory.since && (
            <p className="sidebar-since">with Vela since {formatSince(memory.since)}</p>
          )}
        </div>
      </div>

      <div className="divider-gradient" />

      <div className="sidebar-sessions chat-scroll">
        <p className="sidebar-section-label">session summaries</p>
        {memory.sessions.length === 0 ? (
          <p className="sidebar-empty">After a breath pause, a short summary of your chat appears here.</p>
        ) : (
          <>
            {latest && (
              <button
                type="button"
                onClick={() => setExpandedId(expandedId === latest.id ? null : latest.id)}
                className="sidebar-session-card sidebar-session-card-dark sidebar-session-latest"
              >
                <p className="sidebar-session-badge">most recent</p>
                <p className="sidebar-session-date sidebar-session-date-dark">{formatSessionDate(latest.date)}</p>
                <p
                  className="sidebar-session-note"
                  style={{ WebkitLineClamp: expandedId === latest.id ? undefined : 3 }}
                >
                  {latest.note}
                </p>
              </button>
            )}

            {older.length > 0 && <p className="sidebar-older-label">earlier</p>}

            {older.map(session => (
              <SwipeableSessionCard
                key={session.id}
                session={session}
                expanded={expandedId === session.id}
                onToggleExpand={() =>
                  setExpandedId(expandedId === session.id ? null : session.id)
                }
                onDelete={handleDeleteSession}
              />
            ))}
          </>
        )}
      </div>
    </aside>
  );
}
