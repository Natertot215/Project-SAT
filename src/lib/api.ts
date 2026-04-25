import { supabase, QUESTION_COLUMNS } from "./supabase";
import { assignSkills } from "./skills";
import { isRWSkill, RW_SKILLS, MATH_SKILLS } from "../data/taxonomy";
import { getRecentForSkill, pushRecentForSkill } from "./storage";
import type {
  Difficulty,
  DifficultyChoice,
  Question,
  SessionType,
  Skill,
} from "../types";

const ALL_DIFFICULTIES: Difficulty[] = ["easy", "med", "hard"];

export interface FetchQuestionsArgs {
  sessionType: SessionType;
  n: number;
  skills: Skill[];
  difficulty: DifficultyChoice;
  modulesSections: Array<{ start: number; count: number; sec: "rw" | "math" | "mixed" }>;
}

export interface FetchedSession {
  questions: Question[];
  questionSkills: Skill[];
}

/**
 * Distribute a count across easy/med/hard. Remainder favors easier buckets so
 * mixed sets skew slightly easier. Returns counts in the same order: [easy, med, hard].
 */
export function splitMixedCount(n: number): Record<Difficulty, number> {
  const base = Math.floor(n / 3);
  const rem = n - base * 3;
  return {
    easy: base + (rem > 0 ? 1 : 0),
    med: base + (rem > 1 ? 1 : 0),
    hard: base,
  };
}

/**
 * Pick a random sample of `count` from `pool`. If pool is shorter than count,
 * the result will contain repeats (each repeat is a fresh random draw).
 * Throws only if pool is empty.
 */
function sampleOrRepeat<T>(pool: T[], count: number): T[] {
  if (pool.length === 0) throw new Error("Empty question pool");
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  if (shuffled.length >= count) return shuffled.slice(0, count);
  const out = [...shuffled];
  while (out.length < count) {
    out.push(pool[Math.floor(Math.random() * pool.length)]);
  }
  return out;
}

async function fetchBucket(
  skill: Skill,
  difficulty: Difficulty,
  count: number,
): Promise<Question[]> {
  const { data, error } = await supabase
    .from("questions")
    .select(QUESTION_COLUMNS)
    .eq("skill", skill)
    .eq("difficulty", difficulty);

  if (error) throw new Error(`Supabase error fetching ${skill}/${difficulty}: ${error.message}`);
  const all = (data ?? []) as unknown as Question[];

  const recent = new Set(getRecentForSkill(skill));
  const fresh = all.filter((q) => !recent.has(q.id));
  // Prefer un-cooled-down rows; fall back to the full pool with repeats allowed
  // rather than ever returning fewer than `count`.
  const picked = fresh.length >= count ? sampleOrRepeat(fresh, count) : sampleOrRepeat(all, count);
  pushRecentForSkill(skill, picked.map((q) => q.id));
  return picked;
}

/**
 * Resolve per-slot (skill, difficulty) targets, then fetch in batches grouped
 * by (skill, difficulty) for fewer round-trips. Returns questions in slot order.
 */
export async function fetchQuestions(args: FetchQuestionsArgs): Promise<FetchedSession> {
  const { sessionType, n, skills, difficulty, modulesSections } = args;

  // 1. Assign a skill to each slot.
  let questionSkills: Skill[];
  if (sessionType === "practice") {
    questionSkills = assignSkills(skills, n);
  } else {
    // Test mode placeholder: randomized skills per module section. Real digital
    // SAT module composition is deferred — see project memory.
    questionSkills = Array(n).fill("");
    modulesSections.forEach((m) => {
      const pool = m.sec === "rw" ? RW_SKILLS : MATH_SKILLS;
      for (let i = 0; i < m.count; i++) {
        questionSkills[m.start + i] = pool[Math.floor(Math.random() * pool.length)];
      }
    });
  }

  // 2. Assign a difficulty to each slot.
  const slotDifficulties: Difficulty[] = (() => {
    if (difficulty !== "mixed") return Array(n).fill(difficulty as Difficulty);
    const counts = splitMixedCount(n);
    const list: Difficulty[] = [];
    ALL_DIFFICULTIES.forEach((d) => {
      for (let i = 0; i < counts[d]; i++) list.push(d);
    });
    // Shuffle so difficulty doesn't cluster at the start.
    return list.sort(() => Math.random() - 0.5);
  })();

  // 3. Group slots by (skill, difficulty) for batched fetches.
  const buckets = new Map<string, number[]>();
  for (let i = 0; i < n; i++) {
    const key = `${questionSkills[i]}::${slotDifficulties[i]}`;
    const arr = buckets.get(key) ?? [];
    arr.push(i);
    buckets.set(key, arr);
  }

  // 4. Fetch each bucket and place into slots.
  const questions: Question[] = new Array(n);
  await Promise.all(
    Array.from(buckets.entries()).map(async ([key, slots]) => {
      const [skill, diff] = key.split("::") as [Skill, Difficulty];
      const rows = await fetchBucket(skill, diff, slots.length);
      slots.forEach((slotIdx, i) => {
        questions[slotIdx] = rows[i];
      });
    }),
  );

  return { questions, questionSkills };
}

/**
 * Re-hydrate persisted sessions: fetch full rows for the saved question IDs,
 * preserving the original order (so answers/flags by index stay valid).
 */
export async function fetchQuestionsByIds(ids: number[]): Promise<Question[]> {
  if (ids.length === 0) return [];
  const { data, error } = await supabase
    .from("questions")
    .select(QUESTION_COLUMNS)
    .in("id", ids);
  if (error) throw new Error(`Supabase error fetching by IDs: ${error.message}`);
  const byId = new Map<number, Question>();
  ((data ?? []) as unknown as Question[]).forEach((q) => byId.set(q.id, q));
  const ordered = ids.map((id) => byId.get(id));
  if (ordered.some((q) => q == null)) {
    throw new Error("One or more saved question IDs no longer exist in the database.");
  }
  return ordered as Question[];
}

// Kept for the case where callers still want section helpers.
export { isRWSkill };
