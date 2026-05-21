'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import SignalMarker, { type DisplaySignal } from './SignalMarker';
import ThreadSelection from './ThreadSelection';
import HoldingScreen from './HoldingScreen';
import WriteItDown from './WriteItDown';
import { loadMemory, saveSession, buildMemoryContext, type Session } from '@/lib/memory';
import type { ChatResponse } from '@/app/api/chat/route';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  detectedSignal?: DisplaySignal;
  offerHold?: boolean;
}

const STROKE_KEY = 'vela_stroke_index';

export function getStrokeIndex(): number {
  if (typeof window === 'undefined') return 0;
  const n = parseInt(localStorage.getItem(STROKE_KEY) ?? '0', 10);
  localStorage.setItem(STROKE_KEY, String((n + 1) % 5));
  return n;
}

type UIState = 'chat' | 'threadSelect' | 'generating' | 'writeItDown' | 'holding';

interface ChatScreenProps {
  onTonightNoteChange?: (note: string) => void;
}

export default function ChatScreen({ onTonightNoteChange }: ChatScreenProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [uiState, setUiState] = useState<UIState>('chat');
  const [holdingData, setHoldingData] = useState<{ type: string; note: string } | null>(null);
  const [lastThread, setLastThread] = useState<Session | null>(null);
  const [userName, setUserNameLocal] = useState('');
  const [pendingThreadType, setPendingThreadType] = useState('');
  const [draftNote, setDraftNote] = useState('');
  const [quietHoldPending, setQuietHoldPending] = useState(false);
  const [exitMode, setExitMode] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const memory = loadMemory();
    setUserNameLocal(memory.userName || '');
    if (memory.sessions.length > 0) {
      setLastThread(memory.sessions[0]);
    }
    setMessages([{
      id: 'opening',
      role: 'assistant',
      content: memory.sessions.length > 0
        ? "It is good to have you back."
        : "Hello. I am Vela. I am here whenever you are ready.",
    }]);
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading, uiState]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading || uiState !== 'chat') return;
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
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history, memory: buildMemoryContext(memory) }),
      });
      const data: ChatResponse = await res.json();

      const signal = data.signal !== 'none' ? data.signal : undefined;

      setMessages(prev => {
        const updated = prev.map(m =>
          m.id === userMsg.id ? { ...m, detectedSignal: signal } : m
        );
        return [
          ...updated,
          {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: data.message,
            offerHold: data.offerHold,
          },
        ];
      });

      if (data.signal === 'quiet_signal') {
        setQuietHoldPending(true);
      }
      if (data.offerHold) {
        setExitMode(true);
      }
    } catch {
      setMessages(prev => [
        ...prev,
        { id: 'err', role: 'assistant', content: "Something went quiet. Try again when you are ready." },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, uiState]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function handleTextareaChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  }

  function openHoldFlow() {
    setUiState('threadSelect');
    setQuietHoldPending(false);
  }

  async function handleThreadContinue(selectedType: string) {
    setPendingThreadType(selectedType);
    setUiState('generating');
    setLoading(true);
    try {
      const relevant = messages.filter(m => m.id !== 'opening' && m.id !== 'return');
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: [
            ...relevant.map(m => ({ role: m.role, content: m.content })),
            {
              role: 'user',
              content: `Capture ${selectedType} from our conversation tonight in one precise, evocative sentence, as if naming it gently. No preamble, no quotation marks, no explanation. Just the sentence. No [META] tag. No dashes.`,
            },
          ],
          memory: null,
        }),
      });
      const data: ChatResponse = await res.json();
      setDraftNote(data.message.trim());
      setUiState('writeItDown');
    } catch {
      setUiState('chat');
    } finally {
      setLoading(false);
    }
  }

  function handleApproveAndLeave(note: string) {
    saveSession(note, pendingThreadType);
    const session: Session = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      note,
      type: pendingThreadType,
    };
    setLastThread(session);
    setHoldingData({ type: pendingThreadType, note });
    onTonightNoteChange?.(note);
    setUiState('holding');
  }

  function handleHoldingDismiss() {
    setUiState('chat');
    setExitMode(false);
    setHoldingData(null);
    setMessages([{
      id: 'return',
      role: 'assistant',
      content: "Take care of yourself. I will be here.",
    }]);
  }

  function handleSkipHold() {
    setUiState('chat');
    setExitMode(false);
    setQuietHoldPending(false);
  }

  const showThreadCard = lastThread && (messages[0]?.id === 'opening' || messages[0]?.id === 'return');

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, position: 'relative' }}>
      <div ref={scrollRef} className="chat-scroll" style={{ flex: 1, padding: '24px 0 8px' }}>

        {showThreadCard && lastThread && (
          <div style={{ padding: '0 28px 20px' }} className="fade-in">
            <p style={{
              fontFamily: 'var(--font-nunito), sans-serif',
              fontSize: 10,
              fontWeight: 600,
              color: 'var(--text-muted)',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: 8,
            }}>
              held from last time
            </p>
            <div className="thread-held-card">
              <p className="thread-held-type">{lastThread.type ?? 'a thread'}</p>
              <p className="thread-held-note">{lastThread.note}</p>
              <p className="thread-held-meta">from last session</p>
            </div>
          </div>
        )}

        {messages.map(msg => (
          <div key={msg.id}>
            <div
              className="fade-in"
              style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                padding: '4px 28px',
                marginBottom: 4,
              }}
            >
              <div className={msg.role === 'user' ? 'bubble-user' : 'bubble-vela'}>
                {msg.content}
              </div>
            </div>

            {msg.role === 'user' && msg.detectedSignal && (
              <SignalMarker type={msg.detectedSignal} />
            )}

            {msg.role === 'assistant' && msg.offerHold && uiState === 'chat' && (
              <div style={{ padding: '12px 28px 8px' }}>
                <button type="button" className="hold-cta-btn" onClick={openHoldFlow}>
                  Leave a thread for later
                </button>
              </div>
            )}
          </div>
        ))}

        {quietHoldPending && !exitMode && uiState === 'chat' && (
          <div style={{ padding: '12px 28px 8px' }} className="fade-in">
            <button type="button" className="hold-cta-btn hold-cta-quiet" onClick={openHoldFlow}>
              Leave a thread for later
            </button>
          </div>
        )}

        {loading && uiState === 'chat' && (
          <div style={{ display: 'flex', padding: '8px 28px' }}>
            <div className="bubble-vela" style={{ display: 'flex', gap: 5, padding: '12px 16px', alignItems: 'center' }}>
              <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
            </div>
          </div>
        )}
      </div>

      <div className="input-bar">
        <textarea
          ref={textareaRef}
          className="input-field"
          value={input}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          placeholder={exitMode ? 'Whenever you are ready…' : 'Say something…'}
          rows={1}
          disabled={loading || uiState !== 'chat'}
        />
        <button className="send-btn" onClick={sendMessage} disabled={!input.trim() || loading || uiState !== 'chat'} aria-label="Send">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M2 9L16 2L9 16L8 10L2 9Z" fill="white" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {(uiState === 'threadSelect' || uiState === 'generating') && (
        <ThreadSelection
          onContinue={handleThreadContinue}
          onSkip={handleSkipHold}
          loading={uiState === 'generating'}
        />
      )}

      {uiState === 'writeItDown' && (
        <WriteItDown
          summary={draftNote}
          onApprove={handleApproveAndLeave}
          onContinue={() => {}}
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
