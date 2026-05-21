'use client';
import { useState, useEffect } from 'react';
import VelaHeader from './VelaHeader';
import { loadMemory, setUserName, formatSince, formatSessionDate, type VelaMemory } from '@/lib/memory';

interface SidebarProps {
  strokeIndex: number;
}

export default function Sidebar({ strokeIndex }: SidebarProps) {
  const [memory, setMemory] = useState<VelaMemory>({ userName: '', since: '', sessions: [] });
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const m = loadMemory();
    setMemory(m);
    if (!m.userName) setEditingName(true);
    else setNameInput(m.userName);
  }, []);

  function handleNameSave() {
    if (!nameInput.trim()) return;
    setUserName(nameInput.trim());
    setMemory(prev => ({ ...prev, userName: nameInput.trim() }));
    setEditingName(false);
  }

  return (
    <aside className="sidebar-panel sidebar-panel-dark">
      <VelaHeader strokeIndex={strokeIndex} />
      <p className="sidebar-tagline-dark">moving at your pace</p>

      <div className="divider-gradient" />

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
        <p className="sidebar-section-label">past sessions</p>
        {memory.sessions.length === 0 ? (
          <p className="sidebar-empty">Sessions will appear here.</p>
        ) : (
          memory.sessions.map(session => (
            <button
              key={session.id}
              type="button"
              onClick={() => setExpandedId(expandedId === session.id ? null : session.id)}
              className="sidebar-session-card sidebar-session-card-dark"
            >
              <p className="sidebar-session-date sidebar-session-date-dark">{formatSessionDate(session.date)}</p>
              <p
                className="sidebar-session-note"
                style={{ WebkitLineClamp: expandedId === session.id ? undefined : 3 }}
              >
                {session.note}
              </p>
            </button>
          ))
        )}
      </div>
    </aside>
  );
}
