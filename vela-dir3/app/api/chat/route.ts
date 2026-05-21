import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { VELA_DIR3_SYSTEM_PROMPT, buildMessagesWithMemory, sanitizeVelaText } from '@/lib/velaPrompt';

const client = new Anthropic();

export type PaceSignal = 'pace_signal' | 'weight_signal' | 'intense_signal' | 'none';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  message: string;
  signal: PaceSignal;
  triggerBreath: boolean;
}

function parseVelaResponse(raw: string): ChatResponse {
  const metaMatch = raw.match(/\[META\]\s*(\{[\s\S]*?\})\s*$/);

  let signal: PaceSignal = 'none';
  let triggerBreath = false;
  let message = raw;

  if (metaMatch) {
    try {
      const meta = JSON.parse(metaMatch[1]);
      const s = meta.signal;
      if (s === 'pace_signal' || s === 'weight_signal' || s === 'intense_signal' || s === 'none') {
        signal = s;
      }
      triggerBreath = Boolean(meta.triggerBreath);
    } catch {
      // keep defaults
    }
    message = raw.slice(0, metaMatch.index).trim();
  }

  message = sanitizeVelaText(message);

  if (signal !== 'none' && !triggerBreath) {
    triggerBreath = signal === 'intense_signal';
  }

  return { message, signal, triggerBreath };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { history, memory }: { history: ChatMessage[]; memory: string | null } = body;

    if (!history || history.length === 0) {
      return NextResponse.json({ error: 'No history provided' }, { status: 400 });
    }

    const messages = buildMessagesWithMemory(history, memory);

    const response = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 600,
      system: VELA_DIR3_SYSTEM_PROMPT,
      messages,
    });

    const rawText = response.content[0].type === 'text' ? response.content[0].text : '';
    const parsed = parseVelaResponse(rawText);

    return NextResponse.json(parsed);
  } catch (err) {
    console.error('Vela API error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
