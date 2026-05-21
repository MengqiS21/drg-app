'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import SignalMarker from './SignalMarker';
import ThreadSelection from './ThreadSelection';
import HoldingScreen from './HoldingScreen';
import { loadMemory, saveSession, buildMemoryContext, type Session } from '@/lib/memory';
import type { ChatResponse } from '@/app/api/chat/route';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  signal?: 'quiet_signal' | 'explicit_signal' | 'none';
  showThreadPill?: boolean; // shown below explicit_signal messages
}

const STROKE_KEY = 'vela_stroke_index';

export function getStrokeIndex(): number {
  if (typeof window === 'undefined') return 0;
  const n = parseInt(localStorage.getItem(STROKE_KEY) ?? '0', 10);
  localStorage.setItem(STROKE_KEY, String((n + 1) % 5));
  return n;
}

type UIState = 'chat' | 'threadSelect' | 'generating' | 'holding';

interface ChatScreenProps {
  onTonightNoteChange?: (note: string) => void;
  onEndSession?: () => void;
  triggerEndSession?: boolean;
  onEndSessionHandled?: () => void;
}

export default function ChatScreen({
  onTonightNoteChange,
  onEndSession,
  triggerEndSession,
  onEndSessionHandled,
}: ChatScreenProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [uiState, setUiState] = useState<UIState>('chat');
  const [holdingData, setHoldingData] = useState<{ type: string; note: string } | null>(null);
  const [lastThread, setLastThread] = useState<Session | null>(null);
  const [userName, setUserNameLocal] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const memory = loadMemory();
    setUserNameLocal(memory.userName || '');
    // Load last saved thread to show at top
    if (memory.sessions.length > 0) {
      setLastThread(memory.sessions[0]);
    }
    setMessages([{
      id: 'opening', role: 'assistant',
      content: memory.sessions.length > 0
        ? "It's good to have you back."
        : "Hello. I'm Vela. I'm here whenever you're ready.",
    }]);
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  useEffect(() => {
    if (triggerEndSession) {
      setUiState('threadSelect');
      onEndSessionHandled?.();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerEndSession]);

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
      const isExplicit = data.signal === 'explicit_signal';
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(), role: 'assistant',
        content: data.message, signal: data.signal,
        showThreadPill: isExplicit,
      }]);
    } catch {
      setMessages(prev => [...prev, { id: 'err', role: 'assistant', content: "I'm here — something went quiet. Try again?" }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  function handleTextareaChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  }

  async function handleThreadContinue(selectedType: string) {
    setUiState('generating');
    setLoading(true);
    try {
      const relevant = messages.filter(m => m.id !== 'opening');
      const res = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: [
            ...relevant.map(m => ({ role: m.role, content: m.content })),
            {
              role: 'user',
              content: `Capture ${selectedType} from our conversation tonight in one precise, evocative sentence — as if naming it gently. No preamble, no quotation marks, no explanation. Just the sentence itself. No [META] tag.`,
            },
          ],
          memory: null,
        }),
      });
      const data: ChatResponse = await res.json();
      const note = data.message.trim();
      saveSession(note, selectedType);
      setLastThread({ id: Date.now().toString(), date: new Date().toISOString(), note, type: selectedType });
      setHoldingData({ type: selectedType, note });
      onTonightNoteChange?.(note);
      setUiState('holding');
    } catch {
      setUiState('chat');
    } finally {
      setLoading(false);
    }
  }

  function handleHoldingDismiss() {
    setUiState('chat');
    setMessages([{
      id: 'return', role: 'assistant',
      content: "Take care of yourself. I'll be here.",
    }]);
    onEndSession?.();
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, position: 'relative' }}>
      <div ref={scrollRef} className="chat-scroll" style={{ flex: 1, padding: '24px 0 8px' }}>

        {/* Last session thread shown at top on return */}
        {lastThread && messages[0]?.id === 'opening' && messages[0]?.content.includes('back') && (
          <div style={{ padding: '0 28px 20px' }}>
            <div style={{
              background: 'rgba(84,126,84,0.07)',
              border: '1px solid rgba(84,126,84,0.18)',
              borderLeft: '3px solid var(--sage)',
              borderRadius: '2px 12px 12px 2px',
              padding: '12px 16px',
            }}>
              <p style={{
                fontFamily: 'var(--font-nunito), sans-serif',
                fontSize: 10, fontWeight: 700, color: 'var(--sage)',
                letterSpacing: '0.05em', marginBottom: 4, textTransform: 'lowercase',
              }}>
                {lastThread.type ?? 'from last time'}
              </p>
              <p style={{
                fontFamily: 'var(--font-nunito), sans-serif',
                fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5,
              }}>
                {lastThread.note}
              </p>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={msg.id}>
            {msg.role === 'assistant' && msg.signal && msg.signal !== 'none' && (
              <SignalMarker type={msg.signal} />
            )}
            <div className="fade-in" style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              padding: '4px 28px',
              marginBottom: i < messages.length - 1 ? 4 : 0,
            }}>
              <div className={msg.role === 'user' ? 'bubble-user' : 'bubble-vela'}>
                {msg.content}
              </div>
            </div>

            {/* Thread invitation pill after explicit_signal */}
            {msg.showThreadPill && uiState === 'chat' && (
              <div style={{ padding: '8px 28px 4px', display: 'flex' }}>
                <button
                  onClick={() => setUiState('threadSelect')}
                  style={{
                    fontFamily: 'var(--font-nunito), sans-serif',
                    fontSize: 12, fontWeight: 600,
                    color: 'var(--sage)',
                    background: 'rgba(84,126,84,0.08)',
                    border: '1px solid rgba(84,126,84,0.22)',
                    borderRadius: 20,
                    padding: '5px 14px',
                    cursor: 'pointer',
                    letterSpacing: '0.02em',
                    display: 'flex', alignItems: 'center', gap: 6,
                    transition: 'background 0.18s',
                  }}
                >
                  <span>leave a thread</span>
                  <span style={{ fontSize: 13 }}>→</span>
                </button>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', padding: '8px 28px' }}>
            <div className="bubble-vela" style={{ display: 'flex', gap: 5, padding: '12px 16px', alignItems: 'center' }}>
              <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="input-bar">
        <textarea
          ref={textareaRef} className="input-field" value={input}
          onChange={handleTextareaChange} onKeyDown={handleKeyDown}
          placeholder="say something…" rows={1}
          disabled={loading || uiState !== 'chat'}
        />
        <button className="send-btn" onClick={sendMessage} disabled={!input.trim() || loading} aria-label="Send">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M2 9L16 2L9 16L8 10L2 9Z" fill="white" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Overlays */}
      {(uiState === 'threadSelect' || uiState === 'generating') && (
        <ThreadSelection
          onContinue={handleThreadContinue}
          onSkip={handleHoldingDismiss}
        />
      )}
      {uiState === 'holding' && holdingData && (
        <HoldingScreen
          threadType={holdingData.type}
          threadNote={holdingData.note}
          userName={userName}
          onDismiss={handleHoldingDismiss}
        />
      )}
    </div>
  );
}
