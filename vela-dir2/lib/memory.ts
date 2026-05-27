export interface Session {
  id: string;
  date: string;
  note: string;
  type?: string; // "a moment" | "a feeling" | "a question" | "something left open"
}

export interface VelaMemory {
  userName: string;
  since: string;
  sessions: Session[];
}

const MEMORY_KEY = 'vela_memory_v2';

export function loadMemory(): VelaMemory {
  if (typeof window === 'undefined') return defaultMemory();
  try {
    const raw = localStorage.getItem(MEMORY_KEY);
    if (!raw) return defaultMemory();
    return JSON.parse(raw) as VelaMemory;
  } catch {
    return defaultMemory();
  }
}

function defaultMemory(): VelaMemory {
  return { userName: '', since: new Date().toISOString(), sessions: [] };
}

export function saveSession(note: string, type?: string): void {
  if (typeof window === 'undefined') return;
  const memory = loadMemory();
  memory.sessions = [
    { id: Date.now().toString(), date: new Date().toISOString(), note, type },
    ...memory.sessions,
  ].slice(0, 20);
  localStorage.setItem(MEMORY_KEY, JSON.stringify(memory));
}

export function deleteSession(id: string): void {
  if (typeof window === 'undefined') return;
  const memory = loadMemory();
  memory.sessions = memory.sessions.filter(s => s.id !== id);
  localStorage.setItem(MEMORY_KEY, JSON.stringify(memory));
}

export function setUserName(name: string): void {
  if (typeof window === 'undefined') return;
  const memory = loadMemory();
  memory.userName = name;
  if (!memory.since) memory.since = new Date().toISOString();
  localStorage.setItem(MEMORY_KEY, JSON.stringify(memory));
}

export function buildMemoryContext(memory: VelaMemory): string | null {
  if (memory.sessions.length === 0) return null;
  return memory.sessions.slice(0, 5).map(s => {
    const d = new Date(s.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    const kind = s.type ? ` (${s.type})` : '';
    return `${d}${kind}: ${s.note}`;
  }).join('\n');
}

export function formatSince(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function formatSessionDate(isoDate: string): string {
  const d = new Date(isoDate);
  const diff = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (diff === 0) return 'today';
  if (diff === 1) return 'yesterday';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/** Same local calendar day as the reference time (default: now). */
export function isSessionTonight(isoDate: string, ref: Date = new Date()): boolean {
  const d = new Date(isoDate);
  return (
    d.getFullYear() === ref.getFullYear() &&
    d.getMonth() === ref.getMonth() &&
    d.getDate() === ref.getDate()
  );
}

/** Newest session held today, if any (sessions are stored newest-first). */
export function getTonightSession(sessions: Session[]): Session | undefined {
  return sessions.find(s => isSessionTonight(s.date));
}
