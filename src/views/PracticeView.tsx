import { useState } from "react";
import Shell from "../components/primitives/Shell";
import Pill from "../components/primitives/Pill";
import Btn from "../components/primitives/Btn";
import Label from "../components/primitives/Label";
import SkillPicker from "../components/SkillPicker";
import type { SessionType } from "../types";
import styles from "./formLayout.module.css";

interface PracticeViewProps {
  onStart: (type: SessionType, n: number, skills: string[]) => void;
}

export default function PracticeView({ onStart }: PracticeViewProps) {
  const [skills, setSkills] = useState<string[]>([]);
  const [pCount, setPCount] = useState(10);

  return (
    <Shell wide>
      <div className={styles.container}>
        <h1 className={styles.title}>Practice</h1>
        <p className={styles.subtitle}>Select skills from either or both sections.</p>
        <SkillPicker skills={skills} onChange={setSkills} />
        <div className={styles.footer}>
          <div className={styles.footerLeft}>
            <Label>Questions</Label>
            <div className={styles.footerOptions}>
              {[10, 15, 20, 25, 30].map(n => (
                <Pill key={n} active={pCount === n} onClick={() => setPCount(n)}>{n}</Pill>
              ))}
            </div>
          </div>
          <Btn onClick={() => onStart("practice", pCount, skills)} disabled={skills.length === 0}>
            Start Practice ({skills.length} skill{skills.length !== 1 ? "s" : ""})
          </Btn>
        </div>
      </div>
    </Shell>
  );
}
