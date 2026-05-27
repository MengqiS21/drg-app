'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import SignalMarker, { type DisplaySignal } from './SignalMarker';
import ThreadSelection from './ThreadSelection';
import HoldingScreen from './HoldingScreen';
import WriteItDown from './WriteItDown';
import EndPageScreen from './EndPageScreen';
import { loadMemory, saveSession, buildMemoryContext, type Session } from '@/lib/memory';
import { sanitizeVelaText } from '@/lib/velaPrompt';
import type { ChatResponse } from '@/app/api/chat/route';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  detectedSignal?: DisplaySignal;
  offerHold?: boolean;
}

const STROKE_KEY = 'vela_stroke_index';
const MIN_TYPING_MS = 550;

/** Client-only: call inside useEffect so SSR/hydration stay on phase 0. */
export function consumeStrokeIndex(): number {
  if (typeof window === 'undefined') return 0;
  const n = parseInt(localStorage.getItem(STROKE_KEY) ?? '0', 10);
  localStorage.setItem(STROKE_KEY, String((n + 1) % 5));
  return n;
}

type UIState = 'chat' | 'threadSelect' | 'generating' | 'writeItDown' | 'endPage' | 'holding';

interface ChatScreenProps {
  strokeIndex: number;
  onTonightNoteChange?: (note: string) => void;
}

export default function ChatScreen({ strokeIndex, onTonightNoteChange }: ChatScreenProps) {
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

  const scrollChatToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    });
  }, []);

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
    scrollChatToBottom();
  }, [messages, loading, uiState, scrollChatToBottom]);

  useEffect(() => {
    if (loading && uiState === 'chat') scrollChatToBottom();
  }, [loading, uiState, scrollChatToBottom]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading || uiState !== 'chat') return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    const typingStartedAt = Date.now();
    setLoading(true);
    scrollChatToBottom();
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

      const typingElapsed = Date.now() - typingStartedAt;
      if (typingElapsed < MIN_TYPING_MS) {
        await new Promise(resolve => setTimeout(resolve, MIN_TYPING_MS - typingElapsed));
      }

      const signal = data.signal !== 'none' ? data.signal : undefined;

      const cleanMessage = sanitizeVelaText(data.message);

      setMessages(prev => {
        const updated = prev.map(m =>
          m.id === userMsg.id ? { ...m, detectedSignal: signal } : m
        );
        return [
          ...updated,
          {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: cleanMessage,
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
  }, [input, loading, messages, uiState, scrollChatToBottom]);

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
    if (uiState !== 'chat') return;
    setUiState('threadSelect');
    setQuietHoldPending(false);
    setExitMode(true);
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
      const note = sanitizeVelaText(data.message.trim());
      setDraftNote(note || 'Something from tonight.');
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
    setUiState('endPage');
  }

  function handleEndPageComplete() {
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
      <div
        ref={scrollRef}
        className={`chat-scroll ${exitMode || quietHoldPending ? 'chat-scroll-hold-pad' : ''}`}
        style={{ flex: 1, minHeight: 0, padding: '24px 0 8px' }}
      >

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

        {messages.map((msg, index) => {
          const prev = index > 0 ? messages[index - 1] : null;
          const followsSignal = msg.role === 'assistant' && prev?.role === 'user' && !!prev.detectedSignal;

          return (
            <div key={msg.id}>
              <div
                className={`fade-in chat-message-row ${
                  msg.role === 'user' ? 'chat-message-row-user' : 'chat-message-row-assistant'
                } ${followsSignal ? 'chat-message-row-after-signal' : ''}`}
              >
                <div className={msg.role === 'user' ? 'bubble-user' : 'bubble-vela'}>
                  <span className="bubble-text">{msg.content}</span>
                  {msg.role === 'assistant' && msg.offerHold && uiState === 'chat' && (
                    <button
                      type="button"
                      className="hold-cta-btn hold-cta-btn--in-bubble"
                      onClick={openHoldFlow}
                      onPointerDown={e => e.stopPropagation()}
                    >
                      Leave a thread for later
                    </button>
                  )}
                </div>
              </div>

              {msg.role === 'user' && msg.detectedSignal && (
                <SignalMarker type={msg.detectedSignal} />
              )}
            </div>
          );
        })}

        {quietHoldPending && !exitMode && uiState === 'chat' && (
          <div className="chat-hold-row fade-in">
            <button
              type="button"
              className="hold-cta-btn hold-cta-quiet"
              onClick={openHoldFlow}
              onPointerDown={e => e.stopPropagation()}
            >
              Leave a thread for later
            </button>
          </div>
        )}

        {loading && uiState === 'chat' && (
          <div className="chat-typing-row fade-in" aria-live="polite" aria-label="Vela is thinking">
            <div className="chat-message-row chat-message-row-assistant">
              <div className="bubble-vela typing-bubble">
                <span className="typing-indicator">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </span>
              </div>
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

      {uiState === 'writeItDown' && draftNote && (
        <WriteItDown
          key={draftNote}
          summary={draftNote}
          threadType={pendingThreadType}
          onApprove={handleApproveAndLeave}
        />
      )}

      {uiState === 'endPage' && <EndPageScreen onComplete={handleEndPageComplete} />}

      {uiState === 'holding' && holdingData && (
        <HoldingScreen
          threadType={holdingData.type}
          threadNote={holdingData.note}
          userName={userName}
          strokeIndex={strokeIndex}
          onDismiss={handleHoldingDismiss}
        />
      )}
    </div>
  );
}
