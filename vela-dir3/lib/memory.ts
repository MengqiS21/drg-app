export interface Session {
  id: string;
  date: string; // ISO date string
  note: string; // WriteItDown summary
}

export interface VelaMemory {
  userName: string;
  since: string; // ISO date string of first session
  sessions: Session[];
}

const MEMORY_KEY = 'vela_memory_d3';

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
  return {
    userName: '',
    since: new Date().toISOString(),
    sessions: [],
  };
}

export function deleteSession(id: string): void {
  if (typeof window === 'undefined') return;
  const memory = loadMemory();
  memory.sessions = memory.sessions.filter(s => s.id !== id);
  localStorage.setItem(MEMORY_KEY, JSON.stringify(memory));
}

export function saveSession(note: string): void {
  if (typeof window === 'undefined') return;
  const memory = loadMemory();
  const session: Session = {
    id: Date.now().toString(),
    date: new Date().toISOString(),
    note,
  };
  memory.sessions = [session, ...memory.sessions].slice(0, 20); // keep last 20
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
  const recent = memory.sessions.slice(0, 3);
  return recent.map(s => {
    const d = new Date(s.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    return `${d}: ${s.note}`;
  }).join('\n');
}

export function formatSince(isoDate: string): string {
  const d = new Date(isoDate);
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function formatSessionDate(isoDate: string): string {
  const d = new Date(isoDate);
  const today = new Date();
  const diff = Math.floor((today.getTime() - d.getTime()) / 86400000);
  if (diff === 0) return 'today';
  if (diff === 1) return 'yesterday';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
