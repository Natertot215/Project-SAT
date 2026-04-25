import { useState } from "react";
import Shell from "../components/primitives/Shell";
import Pill from "../components/primitives/Pill";
import Btn from "../components/primitives/Btn";
import SkillSelector from "../components/SkillSelector";
import type { SessionType, Skill } from "../types";

interface TestViewProps {
  onStart: (type: SessionType, n: number, skills: Skill[]) => void;
}

type TestLength = "full" | "half";

const INLINE_LABEL_CLS =
  "text-[12px] font-semibold text-tx3 uppercase tracking-[.08em] whitespace-nowrap";

export default function TestView({ onStart }: TestViewProps) {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [length, setLength] = useState<TestLength>("full");
  const n = length === "full" ? 98 : 49;

  return (
    <Shell wide>
      <div className="mx-auto">
        <h1 className="text-[28px] font-bold mb-1.5">Test</h1>
        <p className="text-tx3 text-base mb-8">Simulate a full or half-length SAT.</p>
        <div className="border-t border-bdr pt-8">
          <SkillSelector skills={skills} setSkills={setSkills} />
        </div>
        <div className="border-t border-bdr pt-8 flex items-center justify-between gap-4">
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
          <Btn onClick={() => onStart("test", n, skills)} disabled={skills.length === 0}>
            Start Test ({skills.length} skill{skills.length !== 1 ? "s" : ""})
          </Btn>
        </div>
      </div>
    </Shell>
  );
}
