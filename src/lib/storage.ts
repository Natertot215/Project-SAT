import type { PersistedSession } from "../types";

const PREFIX = "sat:";
const RECENT_PREFIX = "recentBySkill:";
const RECENT_CAP = 200;

export function get<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw == null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function set<T>(key: string, value: T | null | undefined): void {
  try {
    if (value === null || value === undefined) {
      localStorage.removeItem(PREFIX + key);
    } else {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    }
  } catch {
    // ignore quota/permission errors for now
  }
}

export function remove(key: string): void {
  try {
    localStorage.removeItem(PREFIX + key);
  } catch {
    /* noop */
  }
}

export function isValidPersistedSession(s: unknown): s is PersistedSession {
  if (!s || typeof s !== "object") return false;
  const v = s as Partial<PersistedSession>;
  return (
    (v.sessionType === "practice" || v.sessionType === "test") &&
    Array.isArray(v.modules) &&
    v.modules.length > 0 &&
    Array.isArray(v.questionIds) &&
    v.questionIds.length > 0 &&
    v.questionIds.every((n) => typeof n === "number") &&
    Array.isArray(v.questionSkills) &&
    typeof v.currentMod === "number" &&
    typeof v.qIdx === "number" &&
    v.answers != null &&
    typeof v.answers === "object" &&
    v.flags != null &&
    typeof v.flags === "object" &&
    v.crossouts != null &&
    typeof v.crossouts === "object"
  );
}

// Per-skill cooldown buffer: FIFO of recently-served question IDs, used by
// fetchQuestions to avoid back-to-back repeats. Soft cap at RECENT_CAP per skill.
export function getRecentForSkill(skill: string): number[] {
  return get<number[]>(RECENT_PREFIX + skill, []);
}

export function pushRecentForSkill(skill: string, ids: number[]): void {
  if (ids.length === 0) return;
  const current = getRecentForSkill(skill);
  const merged = [...current, ...ids];
  const trimmed = merged.length > RECENT_CAP ? merged.slice(merged.length - RECENT_CAP) : merged;
  set(RECENT_PREFIX + skill, trimmed);
}
