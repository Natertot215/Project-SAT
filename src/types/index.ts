export type View = "home" | "practice" | "test" | "history" | "session";

export type SessionType = "practice" | "test";

export type Section = "rw" | "math" | "mixed";

export type Phase = "questions" | "break" | "results" | "review";

export interface ModuleDef {
  label: string;
  sec: Section;
  count: number;
  start: number;
}

export interface Question {
  id: number;
}

export type AnswersMap = Record<number, number | null>;
export type FlagsMap = Record<number, boolean>;
export type CrossoutsMap = Record<string, boolean>;
export type CorrectMap = Record<number, number>;

export interface ReviewItem {
  answered: boolean;
  correct: boolean;
  picked: number | null | undefined;
  correctChoice: number;
  skill: string;
  isRW: boolean;
}

export interface SessionState {
  sessionType: SessionType;
  modules: ModuleDef[];
  questions: Question[];
  questionSkills: (string | null)[];
  correctMap: CorrectMap;
  currentMod: number;
  qIdx: number;
  answers: AnswersMap;
  flags: FlagsMap;
  crossouts: CrossoutsMap;
}

export interface HistoryEntry {
  id: number;
  date: string;
  type: string;
  skills: string[];
  correct: number;
  total: number;
  attempted: number;
  breakdown: boolean[];
  flagged: FlagsMap;
  reviewData: ReviewItem[];
}

export type SessionInit =
  | { resume: SessionState }
  | { type: SessionType; n: number; skills: string[] };
