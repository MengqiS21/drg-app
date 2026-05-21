'use client';
import { useState, useEffect } from 'react';
import VelaHeader from './VelaHeader';
import { loadMemory, setUserName, formatSince, formatSessionDate, type VelaMemory } from '@/lib/memory';

interface SidebarProps {
  strokeIndex: number;
  onEndSession: () => void;
  tonightNote: string;
}

export default function Sidebar({ strokeIndex, onEndSession, tonightNote }: SidebarProps) {
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
    <aside style={{
      width: '100%',
      height: '100vh',
      background: 'var(--warm-cream)',
      borderRight: '1px solid var(--warm-tan)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Vela name with aurora stroke */}
      <VelaHeader strokeIndex={strokeIndex} size="sidebar" />
      <div className="divider-gradient" />

      {/* Profile section */}
      <div style={{ padding: '20px 24px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Avatar circle */}
          <div style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--sage-muted), rgba(180,160,140,0.3))',
            border: '1px solid var(--sage-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <span style={{ fontSize: 16, color: 'var(--sage)', fontFamily: 'var(--font-nunito)' }}>
              {memory.userName ? memory.userName[0].toUpperCase() : '·'}
            </span>
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
                  style={{
                    fontFamily: 'var(--font-nunito), sans-serif',
                    fontSize: 14,
                    color: 'var(--text-primary)',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid var(--sage-border)',
                    outline: 'none',
                    width: '100%',
                    padding: '2px 0',
                  }}
                />
                <button
                  onClick={handleNameSave}
                  style={{
                    fontSize: 11,
                    color: 'var(--sage)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-nunito)',
                    flexShrink: 0,
                  }}
                >
                  save
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{
                  fontFamily: 'var(--font-nunito), sans-serif',
                  fontSize: 14,
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {memory.userName}
                </span>
                <button
                  onClick={() => { setNameInput(memory.userName); setEditingName(true); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--text-muted)', fontSize: 10 }}
                >
                  ✎
                </button>
              </div>
            )}
            {memory.since && (
              <p style={{
                fontFamily: 'var(--font-nunito), sans-serif',
                fontSize: 11,
                color: 'var(--text-muted)',
                marginTop: 2,
              }}>
                with Vela since {formatSince(memory.since)}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="divider-gradient" />

      {/* Past sessions */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }} className="chat-scroll">
        <p style={{
          fontFamily: 'var(--font-nunito), sans-serif',
          fontSize: 10,
          color: 'var(--text-muted)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom: 10,
        }}>
          past sessions
        </p>

        {memory.sessions.length === 0 ? (
          <p style={{
            fontFamily: 'var(--font-nunito), sans-serif',
            fontSize: 13,
            color: 'var(--text-muted)',
            lineHeight: 1.5,
            fontStyle: 'italic',
          }}>
            what you share with Vela will be held here
          </p>
        ) : (
          memory.sessions.map(session => (
            <div
              key={session.id}
              onClick={() => setExpandedId(expandedId === session.id ? null : session.id)}
              style={{
                marginBottom: 8,
                background: 'var(--warm-white)',
                borderRadius: 10,
                padding: '10px 12px',
                cursor: 'pointer',
                border: '1px solid var(--warm-tan)',
                transition: 'border-color 0.2s',
              }}
            >
              <p style={{
                fontFamily: 'var(--font-nunito), sans-serif',
                fontSize: 10,
                color: 'var(--sage)',
                fontWeight: 600,
                letterSpacing: '0.04em',
                marginBottom: 4,
              }}>
                {formatSessionDate(session.date)}
              </p>
              <p style={{
                fontFamily: 'var(--font-nunito), sans-serif',
                fontSize: 12,
                color: 'var(--text-secondary)',
                lineHeight: 1.5,
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: expandedId === session.id ? undefined : 2,
                WebkitBoxOrient: 'vertical' as const,
              }}>
                {session.note}
              </p>
            </div>
          ))
        )}
      </div>

      <div className="divider-gradient" />

      {/* Tonight's note — live preview */}
      <div style={{ padding: '14px 24px 24px' }}>
        <p style={{
          fontFamily: 'var(--font-nunito), sans-serif',
          fontSize: 10,
          color: 'var(--text-muted)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom: 8,
        }}>
          tonight
        </p>
        {tonightNote ? (
          <p style={{
            fontFamily: 'var(--font-nunito), sans-serif',
            fontSize: 12,
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            fontStyle: 'italic',
          }}>
            {tonightNote}
          </p>
        ) : (
          <p style={{
            fontFamily: 'var(--font-nunito), sans-serif',
            fontSize: 12,
            color: 'var(--text-muted)',
            lineHeight: 1.5,
          }}>
            —
          </p>
        )}
        <button
          onClick={onEndSession}
          style={{
            marginTop: 14,
            width: '100%',
            padding: '9px 0',
            borderRadius: 20,
            background: 'transparent',
            border: '1px solid var(--sage-border)',
            color: 'var(--sage)',
            fontFamily: 'var(--font-nunito), sans-serif',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            letterSpacing: '0.02em',
            transition: 'background 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--sage-muted)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          end session
        </button>
      </div>
    </aside>
  );
}
