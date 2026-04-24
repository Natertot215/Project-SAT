// Thin persistence wrapper. Today: localStorage. Later: swap implementation
// for Supabase without changing call sites.

const PREFIX = "sat:";

export function get<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw == null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function set(key: string, value: unknown): void {
  try {
    if (value === null || value === undefined) localStorage.removeItem(PREFIX + key);
    else localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // ignore quota/permission errors for now
  }
}

export function remove(key: string): void {
  try { localStorage.removeItem(PREFIX + key); } catch { /* empty */ }
}
