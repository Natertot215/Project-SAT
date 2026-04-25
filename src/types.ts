export type Section = "rw" | "math" | "mixed";
export type SessionType = "practice" | "test";
export type Phase = "loading" | "questions" | "break" | "results" | "review";

export type Skill = string;

export type Difficulty = "easy" | "med" | "hard";
export type DifficultyChoice = Difficulty | "mixed";

export interface Module {
  label: string;
  sec: Section;
  count: number;
  start: number;
}

export interface Question {
  id: number;
  section: "rw" | "math";
  skill: Skill;
  difficulty: Difficulty;
  passage: string | null;
  stem: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
  chartData: unknown | null;
  imagePath: string | null;
}

export type AnswerMap = Record<number, number | null>;
export type FlagMap = Record<number, boolean>;
export type CrossoutMap = Record<string, boolean>;

export interface ReviewResult {
  answered: boolean;
  correct: boolean;
  picked: number | null | undefined;
  correctChoice: number;
  skill: Skill;
  isRW: boolean;
}

// Stored in localStorage. Holds question IDs only — full rows are re-fetched
// from Supabase on resume so canonical content stays in the database.
export interface PersistedSession {
  sessionType: SessionType;
  modules: Module[];
  questionIds: number[];
  questionSkills: Skill[];
  currentMod: number;
  qIdx: number;
  answers: AnswerMap;
  flags: FlagMap;
  crossouts: CrossoutMap;
}

export type SessionInit =
  | { resume: PersistedSession }
  | {
      type: SessionType;
      n: number;
      skills: Skill[];
      difficulty: DifficultyChoice;
    };

export interface HistoryEntry {
  id: number;
  date: string;
  type: string;
  skills: Skill[];
  correct: number;
  total: number;
  attempted: number;
  breakdown: boolean[];
  flagged: FlagMap;
  reviewData: ReviewResult[];
}
