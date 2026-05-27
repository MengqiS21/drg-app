'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import SignalMarker, { type PaceDisplaySignal } from './SignalMarker';
import BreathOverlay from './BreathOverlay';
import { loadMemory, buildMemoryContext, saveSession } from '@/lib/memory';
import { sanitizeVelaText } from '@/lib/velaPrompt';
import type { ChatResponse } from '@/app/api/chat/route';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  detectedSignal?: PaceDisplaySignal;
}

const STROKE_KEY = 'vela_d3_stroke_index';
const MIN_TYPING_MS = 550;

/** Client-only: call inside useEffect so SSR/hydration stay on phase 0. */
export function consumeStrokeIndex(): number {
  if (typeof window === 'undefined') return 0;
  const n = parseInt(localStorage.getItem(STROKE_KEY) ?? '0', 10);
  localStorage.setItem(STROKE_KEY, String((n + 1) % 5));
  return n;
}

type UIState = 'chat' | 'breath';

interface ChatScreenProps {
  onSessionsUpdated?: () => void;
}

function buildSessionSummary(messages: Message[], hadBreath: boolean): string {
  const userLines = messages
    .filter(m => m.role === 'user' && m.content.trim())
    .map(m => m.content.trim());
  const prefix = hadBreath ? 'Breath pause · ' : '';
  if (userLines.length === 0) return `${prefix}A quiet moment with Vela.`;
  const last = userLines[userLines.length - 1];
  if (userLines.length >= 2) {
    const prev = userLines[userLines.length - 2];
    const combined = `${prefix}${prev} · ${last}`;
    return combined.length > 160 ? `${combined.slice(0, 157)}...` : combined;
  }
  const line = `${prefix}${last}`;
  return line.length > 160 ? `${line.slice(0, 157)}...` : line;
}

export default function ChatScreen({ onSessionsUpdated }: ChatScreenProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [uiState, setUiState] = useState<UIState>('chat');
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesRef = useRef<Message[]>([]);
  const breathPendingRef = useRef(false);

  messagesRef.current = messages;

  const scrollChatToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    });
  }, []);

  useEffect(() => {
    const memory = loadMemory();
    setMessages([{
      id: 'opening',
      role: 'assistant',
      content: memory.sessions.length > 0 ? "It is good to have you back." : "I am here. Take your time.",
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
      const history = nextMessages.filter(m => m.id !== 'opening' && m.id !== 'after-breath').map(m => ({
        role: m.role,
        content: m.content,
      }));
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

      const signal =
        data.signal !== 'none' ? (data.signal as PaceDisplaySignal) : undefined;

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
          },
        ];
      });

      if (data.triggerBreath) {
        breathPendingRef.current = true;
        setTimeout(() => setUiState('breath'), 600);
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

  const handleBreathComplete = useCallback(() => {
    const hadBreath = breathPendingRef.current;
    breathPendingRef.current = false;

    const summary = buildSessionSummary(messagesRef.current, hadBreath);
    saveSession(summary);
    onSessionsUpdated?.();

    setUiState('chat');
    setMessages(prev => {
      const breathId = 'breath-session';
      const withBreath =
        hadBreath && !prev.some(m => m.id === breathId)
          ? [
              ...prev,
              {
                id: breathId,
                role: 'assistant' as const,
                content: '· a moment of breath · We paused together for a few breaths.',
              },
            ]
          : prev;

      const hasReturn = withBreath.some(m => m.id === 'after-breath');
      if (hasReturn) return withBreath;
      return [
        ...withBreath,
        {
          id: 'after-breath',
          role: 'assistant' as const,
          content: 'Whenever you are ready, we can continue.',
        },
      ];
    });
  }, [onSessionsUpdated]);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div ref={scrollRef} className="chat-scroll" style={{ flex: 1, minHeight: 0, padding: '32px 0 8px' }}>
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
              <div className={msg.role === 'user' ? 'bubble-user' : 'bubble-vela'}>{msg.content}</div>
            </div>
            {msg.role === 'user' && msg.detectedSignal && (
              <SignalMarker type={msg.detectedSignal} />
            )}
          </div>
        ))}

        {loading && uiState === 'chat' && (
          <div className="chat-typing-row fade-in" aria-live="polite">
            <div
              className="fade-in"
              style={{ display: 'flex', justifyContent: 'flex-start', padding: '4px 28px' }}
            >
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
          placeholder="Say something…"
          rows={1}
          disabled={loading || uiState !== 'chat'}
        />
        <button className="send-btn" onClick={sendMessage} disabled={!input.trim() || loading || uiState !== 'chat'} aria-label="Send">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M2 9L16 2L9 16L8 10L2 9Z" fill="white" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {uiState === 'breath' && <BreathOverlay onComplete={handleBreathComplete} />}
    </div>
  );
}
