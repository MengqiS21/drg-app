import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { VELA_DIR2_SYSTEM_PROMPT, buildMessagesWithMemory, sanitizeVelaText } from '@/lib/velaPrompt';

const client = new Anthropic();

export type ExitSignal = 'quiet_signal' | 'explicit_signal' | 'gentle_forced_exit' | 'none';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  message: string;
  signal: ExitSignal;
  offerHold: boolean;
}

function parseVelaResponse(raw: string): ChatResponse {
  const metaMatch = raw.match(/\[META\]\s*(\{[\s\S]*?\})\s*$/);

  let signal: ExitSignal = 'none';
  let offerHold = false;
  let message = raw;

  if (metaMatch) {
    try {
      const meta = JSON.parse(metaMatch[1]);
      const s = meta.signal;
      if (s === 'quiet_signal' || s === 'explicit_signal' || s === 'gentle_forced_exit' || s === 'none') {
        signal = s;
      }
      offerHold = Boolean(meta.offerHold);
    } catch {
      // keep defaults
    }
    message = raw.slice(0, metaMatch.index).trim();
  }

  message = sanitizeVelaText(message);

  if (signal === 'explicit_signal' || signal === 'gentle_forced_exit') {
    offerHold = true;
  }

  return { message, signal, offerHold };
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
      system: VELA_DIR2_SYSTEM_PROMPT,
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
