import { useState } from "react";
import Shell from "../components/primitives/Shell";
import Pill from "../components/primitives/Pill";
import Btn from "../components/primitives/Btn";
import Label from "../components/primitives/Label";
import SkillPicker from "../components/SkillPicker";
import type { SessionType } from "../types";
import styles from "./formLayout.module.css";

interface TestViewProps {
  onStart: (type: SessionType, n: number, skills: string[]) => void;
}

export default function TestView({ onStart }: TestViewProps) {
  const [skills, setSkills] = useState<string[]>([]);
  const [length, setLength] = useState<"full" | "half">("full");
  const n = length === "full" ? 98 : 49;

  return (
    <Shell wide>
      <div className={styles.container}>
        <h1 className={styles.title}>Test</h1>
        <p className={styles.subtitle}>Simulate a full or half-length SAT.</p>
        <SkillPicker skills={skills} onChange={setSkills} />
        <div className={styles.footer}>
          <div className={styles.footerLeft}>
            <Label>Length</Label>
            <div className={styles.footerOptions}>
              <Pill active={length === "full"} onClick={() => setLength("full")}>Full Length</Pill>
              <Pill active={length === "half"} onClick={() => setLength("half")}>Half Length</Pill>
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
