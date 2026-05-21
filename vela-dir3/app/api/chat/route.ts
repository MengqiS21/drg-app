import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { VELA_SYSTEM_PROMPT, buildMessagesWithMemory } from '@/lib/velaPrompt';

const client = new Anthropic();

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  message: string;
  signal: 'quiet_signal' | 'explicit_signal' | 'none';
  offerBreath: boolean;
}

function parseVelaResponse(raw: string): ChatResponse {
  const metaMatch = raw.match(/\[META\]\s*(\{[\s\S]*?\})\s*$/);

  let signal: ChatResponse['signal'] = 'none';
  let offerBreath = false;
  let message = raw;

  if (metaMatch) {
    try {
      const meta = JSON.parse(metaMatch[1]);
      signal = meta.signal ?? 'none';
      offerBreath = meta.offerBreath ?? false;
    } catch {
      // malformed meta — keep defaults
    }
    message = raw.slice(0, metaMatch.index).trim();
  }

  // Also strip [OFFER_BREATH] if Claude used the old marker
  message = message.replace(/\[OFFER_BREATH\]\s*$/, '').trim();

  return { message, signal, offerBreath };
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
      system: VELA_SYSTEM_PROMPT,
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
