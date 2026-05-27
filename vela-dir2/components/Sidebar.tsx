'use client';
import { useState, useEffect, useCallback } from 'react';
import VelaHeader from './VelaHeader';
import SwipeableThreadCard from './SwipeableThreadCard';
import {
  loadMemory,
  setUserName,
  deleteSession,
  formatSince,
  formatSessionDate,
  getTonightSession,
  isSessionTonight,
  type VelaMemory,
  type Session,
} from '@/lib/memory';

interface SidebarProps {
  strokeIndex: number;
  tonightNote: string;
  onClearTonightNote?: () => void;
}

export default function Sidebar({ strokeIndex, tonightNote, onClearTonightNote }: SidebarProps) {
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
  }, [tonightNote, refreshMemory]);

  function handleNameSave() {
    if (!nameInput.trim()) return;
    setUserName(nameInput.trim());
    setMemory(prev => ({ ...prev, userName: nameInput.trim() }));
    setEditingName(false);
  }

  function handleDeleteSession(id: string) {
    const removed = memory.sessions.find(s => s.id === id);
    deleteSession(id);
    refreshMemory();
    if (expandedId === id) setExpandedId(null);
    if (removed && isSessionTonight(removed.date)) {
      onClearTonightNote?.();
    }
  }

  const latest: Session | undefined = memory.sessions[0];
  const older: Session[] = memory.sessions.slice(1);
  const tonightSession = getTonightSession(memory.sessions);
  const tonightDisplay = tonightNote.trim() || tonightSession?.note || '';
  const tonightType = tonightSession?.type;

  return (
    <aside className="sidebar-panel">
      <VelaHeader strokeIndex={strokeIndex} variant="sidebar" showTagline />

      <div className="divider-gradient" />

      <div className="sidebar-profile">
        <div className="sidebar-avatar">
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
                className="sidebar-name-input"
              />
              <button type="button" onClick={handleNameSave} className="sidebar-name-save">
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
        <p className="sidebar-section-label">past threads</p>

        {memory.sessions.length === 0 ? (
          <p className="sidebar-empty">What you share with Vela will be held here.</p>
        ) : (
          <>
            {latest && (
              <button
                type="button"
                onClick={() => setExpandedId(expandedId === latest.id ? null : latest.id)}
                className="sidebar-session-card sidebar-session-latest"
              >
                <p className="sidebar-session-badge">most recent</p>
                <p className="sidebar-session-date">{formatSessionDate(latest.date)}</p>
                {latest.type && <p className="sidebar-session-type">{latest.type}</p>}
                <p
                  className="sidebar-session-note"
                  style={{ WebkitLineClamp: expandedId === latest.id ? undefined : 3 }}
                >
                  {latest.note}
                </p>
              </button>
            )}

            {older.length > 0 && (
              <p className="sidebar-older-label">earlier</p>
            )}

            {older.map(session => (
              <SwipeableThreadCard
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

      <div className="divider-gradient" />

      <div className="sidebar-tonight">
        <p className="sidebar-section-label">tonight</p>
        {tonightDisplay ? (
          <>
            {tonightType && <p className="sidebar-session-type">{tonightType}</p>}
            <p className="sidebar-tonight-note">{tonightDisplay}</p>
          </>
        ) : (
          <p className="sidebar-tonight-empty">Nothing held yet tonight.</p>
        )}
      </div>
    </aside>
  );
}
