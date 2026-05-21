'use client';
import { useState, useEffect } from 'react';
import VelaHeader from './VelaHeader';
import { loadMemory, setUserName, formatSince, formatSessionDate, type VelaMemory } from '@/lib/memory';

interface SidebarProps {
  strokeIndex: number;
  tonightNote: string;
}

export default function Sidebar({ strokeIndex, tonightNote }: SidebarProps) {
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
          memory.sessions.map(session => (
            <button
              key={session.id}
              type="button"
              onClick={() => setExpandedId(expandedId === session.id ? null : session.id)}
              className="sidebar-session-card"
            >
              <p className="sidebar-session-date">{formatSessionDate(session.date)}</p>
              {session.type && (
                <p className="sidebar-session-type">{session.type}</p>
              )}
              <p
                className="sidebar-session-note"
                style={{
                  WebkitLineClamp: expandedId === session.id ? undefined : 3,
                }}
              >
                {session.note}
              </p>
            </button>
          ))
        )}
      </div>

      <div className="divider-gradient" />

      <div className="sidebar-tonight">
        <p className="sidebar-section-label">tonight</p>
        {tonightNote ? (
          <p className="sidebar-tonight-note">{tonightNote}</p>
        ) : (
          <p className="sidebar-tonight-empty">Nothing held yet tonight.</p>
        )}
      </div>
    </aside>
  );
}
