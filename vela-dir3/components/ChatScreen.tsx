'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import SignalMarker, { type PaceDisplaySignal } from './SignalMarker';
import BreathOverlay from './BreathOverlay';
import { loadMemory, buildMemoryContext } from '@/lib/memory';
import type { ChatResponse } from '@/app/api/chat/route';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  detectedSignal?: PaceDisplaySignal;
}

const STROKE_KEY = 'vela_d3_stroke_index';

export function getStrokeIndex(): number {
  if (typeof window === 'undefined') return 0;
  const n = parseInt(localStorage.getItem(STROKE_KEY) ?? '0', 10);
  localStorage.setItem(STROKE_KEY, String((n + 1) % 5));
  return n;
}

type UIState = 'chat' | 'breath';

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [uiState, setUiState] = useState<UIState>('chat');
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const breathShownRef = useRef(false);

  useEffect(() => {
    const memory = loadMemory();
    setMessages([{
      id: 'opening',
      role: 'assistant',
      content: memory.sessions.length > 0 ? "It is good to have you back." : "I am here. Take your time.",
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

      const signal =
        data.signal !== 'none' ? (data.signal as PaceDisplaySignal) : undefined;

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
          },
        ];
      });

      if (data.triggerBreath && !breathShownRef.current) {
        breathShownRef.current = true;
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

  function handleBreathClose() {
    setUiState('chat');
    setMessages(prev => {
      const hasReturn = prev.some(m => m.id === 'after-breath');
      if (hasReturn) return prev;
      return [
        ...prev,
        {
          id: 'after-breath',
          role: 'assistant',
          content: "Whenever you are ready, we can continue.",
        },
      ];
    });
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, position: 'relative' }}>
      <div ref={scrollRef} className="chat-scroll" style={{ flex: 1, padding: '32px 0 8px' }}>
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

      {uiState === 'breath' && <BreathOverlay onClose={handleBreathClose} />}
    </div>
  );
}
