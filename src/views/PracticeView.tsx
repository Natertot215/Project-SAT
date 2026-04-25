import { useState } from "react";
import Shell from "../components/primitives/Shell";
import Pill from "../components/primitives/Pill";
import Btn from "../components/primitives/Btn";
import Label from "../components/primitives/Label";
import SkillSelector from "../components/SkillSelector";
import DifficultySelector, { DIFFICULTY_OPTIONS } from "../components/DifficultySelector";
import useWideAspect from "../hooks/useWideAspect";
import type { DifficultyChoice, SessionType, Skill } from "../types";

interface PracticeViewProps {
  onStart: (
    type: SessionType,
    n: number,
    skills: Skill[],
    difficulty: DifficultyChoice,
  ) => void;
}

const COUNT_OPTIONS = [10, 20, 30, 40, 50, 60] as const;

const INLINE_LABEL_CLS =
  "text-[12px] font-semibold text-tx3 uppercase tracking-[.08em] whitespace-nowrap";

export default function PracticeView({ onStart }: PracticeViewProps) {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [pCount, setPCount] = useState<number>(10);
  const [difficulty, setDifficulty] = useState<DifficultyChoice>("mixed");
  // Switch to inline single-row toolbar when both the aspect AND the absolute
  // width allow it. Without the width floor, narrow 16:9 windows (e.g. 1280×720)
  // pass the aspect test but the inline buttons compress until labels truncate.
  const inline = useWideAspect(14.5 / 9, 1500);

  const startBtn = (
    <Btn
      small
      onClick={() => onStart("practice", pCount, skills, difficulty)}
      disabled={skills.length === 0}
    >
      Start Practice ({skills.length} skill{skills.length !== 1 ? "s" : ""})
    </Btn>
  );

  return (
    <Shell wide>
      <div className="mx-auto">
        <h1 className="text-[length:var(--scale-h1-text)] font-bold mb-[var(--scale-h1-mb)]">Practice</h1>
        <p className="text-tx3 text-[length:var(--scale-p-text)] mb-[var(--scale-section-gap)]">
          Select skills from either or both sections.
        </p>
        <div className="border-t border-bdr pt-[var(--scale-section-gap)]">
          <SkillSelector skills={skills} setSkills={setSkills} />
        </div>

        {inline ? (
          <div className="border-t border-bdr pt-[var(--scale-section-gap)] grid items-center gap-4 grid-cols-[auto_minmax(0,6fr)_auto_auto_minmax(0,4fr)_auto_auto]">
            <span className={INLINE_LABEL_CLS}>Questions</span>
            <div className="grid grid-cols-6 gap-1.5 min-w-0">
              {COUNT_OPTIONS.map((n) => (
                <Pill
                  key={n}
                  fullWidth
                  large
                  active={pCount === n}
                  onClick={() => setPCount(n)}
                >
                  {n}
                </Pill>
              ))}
            </div>
            <div className="h-7 w-px bg-bdr" aria-hidden />
            <span className={INLINE_LABEL_CLS}>Difficulty</span>
            <div className="grid grid-cols-4 gap-1.5 min-w-0">
              {DIFFICULTY_OPTIONS.map((opt) => (
                <Pill
                  key={opt.value}
                  fullWidth
                  large
                  active={difficulty === opt.value}
                  onClick={() => setDifficulty(opt.value)}
                >
                  {opt.label}
                </Pill>
              ))}
            </div>
            <div className="h-7 w-px bg-bdr" aria-hidden />
            {startBtn}
          </div>
        ) : (
          <div className="border-t border-bdr pt-[var(--scale-section-gap)] flex flex-col gap-[var(--scale-toolbar-gap)]">
            <div>
              <Label>Questions</Label>
              <div className="grid grid-cols-6 gap-1.5">
                {COUNT_OPTIONS.map((n) => (
                  <Pill
                    key={n}
                    fullWidth
                    large
                    active={pCount === n}
                    onClick={() => setPCount(n)}
                  >
                    {n}
                  </Pill>
                ))}
              </div>
            </div>
            <div>
              <Label>Difficulty</Label>
              <DifficultySelector
                value={difficulty}
                onChange={setDifficulty}
                large
              />
            </div>
            <div className="flex justify-end">{startBtn}</div>
          </div>
        )}
      </div>
    </Shell>
  );
}
