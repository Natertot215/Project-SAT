import { useState } from "react";
import Shell from "../components/primitives/Shell";
import Pill from "../components/primitives/Pill";
import Btn from "../components/primitives/Btn";
import Label from "../components/primitives/Label";
import SkillSelector from "../components/SkillSelector";
import DifficultySelector from "../components/DifficultySelector";
import type { DifficultyChoice, SessionType, Skill } from "../types";

interface TestViewProps {
  onStart: (
    type: SessionType,
    n: number,
    skills: Skill[],
    difficulty: DifficultyChoice,
  ) => void;
}

type TestLength = "full" | "half";

const INLINE_LABEL_CLS =
  "text-[12px] font-semibold text-tx3 uppercase tracking-[.08em] whitespace-nowrap";

export default function TestView({ onStart }: TestViewProps) {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [length, setLength] = useState<TestLength>("full");
  const [difficulty, setDifficulty] = useState<DifficultyChoice>("mixed");
  const n = length === "full" ? 98 : 49;

  return (
    <Shell wide>
      <div className="mx-auto">
        <h1 className="text-[length:var(--scale-h1-text)] font-bold mb-[var(--scale-h1-mb)]">Test</h1>
        <p className="text-tx3 text-[length:var(--scale-p-text)] mb-[var(--scale-section-gap)]">
          Simulate a full or half-length SAT.
        </p>
        <div className="border-t border-bdr pt-[var(--scale-section-gap)]">
          <SkillSelector skills={skills} setSkills={setSkills} />
        </div>
        <div className="border-t border-bdr pt-[var(--scale-section-gap)] flex flex-col gap-[var(--scale-toolbar-gap)]">
          <div className="flex items-center gap-4">
            <span className={INLINE_LABEL_CLS}>Length</span>
            <div className="flex gap-1.5">
              <Pill large active={length === "full"} onClick={() => setLength("full")}>
                Full Length
              </Pill>
              <Pill large active={length === "half"} onClick={() => setLength("half")}>
                Half Length
              </Pill>
            </div>
          </div>
          <div>
            <Label>Difficulty</Label>
            <DifficultySelector value={difficulty} onChange={setDifficulty} large />
          </div>
          <div className="flex justify-end">
            <Btn
              onClick={() => onStart("test", n, skills, difficulty)}
              disabled={skills.length === 0}
            >
              Start Test ({skills.length} skill{skills.length !== 1 ? "s" : ""})
            </Btn>
          </div>
        </div>
      </div>
    </Shell>
  );
}
