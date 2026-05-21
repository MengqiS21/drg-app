'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import SignalMarker from './SignalMarker';
import BreathOverlay from './BreathOverlay';
import WriteItDown from './WriteItDown';
import { loadMemory, saveSession, buildMemoryContext } from '@/lib/memory';
import type { ChatResponse } from '@/app/api/chat/route';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  signal?: 'quiet_signal' | 'explicit_signal' | 'none';
  showBreathPill?: boolean;
}

const STROKE_KEY = 'vela_d3_stroke_index';

export function getStrokeIndex(): number {
  if (typeof window === 'undefined') return 0;
  const n = parseInt(localStorage.getItem(STROKE_KEY) ?? '0', 10);
  localStorage.setItem(STROKE_KEY, String((n + 1) % 5));
  return n;
}

type UIState = 'chat' | 'breath' | 'generating' | 'writeItDown';

interface ChatScreenProps {
  onTonightNoteChange?: (note: string) => void;
  triggerEndSession?: boolean;
  onEndSessionHandled?: () => void;
}

export default function ChatScreen({ onTonightNoteChange, triggerEndSession, onEndSessionHandled }: ChatScreenProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [uiState, setUiState] = useState<UIState>('chat');
  const [sessionSummary, setSessionSummary] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const memory = loadMemory();
    setMessages([{
      id: 'opening', role: 'assistant',
      content: memory.sessions.length > 0 ? "It's good to have you back." : "I'm here. Take your time.",
    }]);
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  useEffect(() => {
    if (triggerEndSession) { goToWriteItDown(); onEndSessionHandled?.(); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerEndSession]);

  async function goToWriteItDown() {
    const relevant = messages.filter(m => m.id !== 'opening');
    if (relevant.length < 2) return;
    setUiState('generating');
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: [
            ...relevant.map(m => ({ role: m.role, content: m.content })),
            {
              role: 'user',
              content: 'Write a brief memory note (2-4 sentences) of tonight, as Vela. No [META] tag.',
            },
          ],
          memory: null,
        }),
      });
      const data: ChatResponse = await res.json();
      setSessionSummary(data.message);
      onTonightNoteChange?.(data.message);
      setUiState('writeItDown');
    } catch {
      setSessionSummary('We sat together tonight.');
      setUiState('writeItDown');
    } finally {
      setLoading(false);
    }
  }

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    try {
      const memory = loadMemory();
      const history = nextMessages.filter(m => m.id !== 'opening').map(m => ({ role: m.role, content: m.content }));
      const res = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history, memory: buildMemoryContext(memory) }),
      });
      const data: ChatResponse = await res.json();
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(), role: 'assistant',
        content: data.message, signal: data.signal,
        showBreathPill: !!data.offerBreath,
      }]);
    } catch {
      setMessages(prev => [...prev, { id: 'err', role: 'assistant', content: "Something went quiet. Try again?" }]);
    } finally { setLoading(false); }
  }, [input, loading, messages]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  function handleTextareaChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  }

  function handleLeave() {
    setUiState('chat');
    saveSession(sessionSummary);
    setMessages([{ id: 'return', role: 'assistant', content: "Take care. I'll be here." }]);
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, position: 'relative' }}>
      <div ref={scrollRef} className="chat-scroll" style={{ flex: 1, padding: '32px 0 8px' }}>
        {messages.map((msg, i) => (
          <div key={msg.id}>
            {msg.role === 'assistant' && msg.signal && msg.signal !== 'none' && <SignalMarker type={msg.signal} />}
            <div className="fade-in" style={{
              display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              padding: '4px 28px', marginBottom: i < messages.length - 1 ? 4 : 0,
            }}>
              <div className={msg.role === 'user' ? 'bubble-user' : 'bubble-vela'}>{msg.content}</div>
            </div>

            {/* Breath invitation pill after offerBreath messages */}
            {msg.showBreathPill && uiState === 'chat' && (
              <div style={{ padding: '8px 28px 4px', display: 'flex' }}>
                <button
                  onClick={() => setUiState('breath')}
                  style={{
                    fontFamily: 'var(--font-nunito), sans-serif',
                    fontSize: 12, fontWeight: 600,
                    color: 'var(--rose)',
                    background: 'rgba(188,140,200,0.1)',
                    border: '1px solid rgba(188,140,200,0.28)',
                    borderRadius: 20,
                    padding: '5px 14px',
                    cursor: 'pointer',
                    letterSpacing: '0.02em',
                    display: 'flex', alignItems: 'center', gap: 6,
                    transition: 'background 0.18s',
                  }}
                >
                  <span>take a breath with me</span>
                  <span style={{ fontSize: 13 }}>→</span>
                </button>
              </div>
            )}
          </div>
        ))}

        {(loading || uiState === 'generating') && (
          <div style={{ display: 'flex', padding: '8px 28px' }}>
            <div className="bubble-vela" style={{ display: 'flex', gap: 5, padding: '12px 16px', alignItems: 'center' }}>
              <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
            </div>
          </div>
        )}
      </div>

      <div className="input-bar">
        <textarea ref={textareaRef} className="input-field" value={input}
          onChange={handleTextareaChange} onKeyDown={handleKeyDown}
          placeholder="say something…" rows={1} disabled={loading || uiState !== 'chat'} />
        <button className="send-btn" onClick={sendMessage} disabled={!input.trim() || loading} aria-label="Send">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M2 9L16 2L9 16L8 10L2 9Z" fill="white" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {uiState === 'breath' && <BreathOverlay onClose={() => setUiState('chat')} />}
      {uiState === 'writeItDown' && (
        <WriteItDown
          summary={sessionSummary}
          onApprove={note => { saveSession(note); onTonightNoteChange?.(note); }}
          onContinue={handleLeave}
        />
      )}
    </div>
  );
}
