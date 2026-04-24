import { useState } from "react";
import Shell from "../components/primitives/Shell";
import Pill from "../components/primitives/Pill";
import Btn from "../components/primitives/Btn";
import Label from "../components/primitives/Label";
import { TAXONOMY, allSkills, type TaxonomyKey } from "../data/taxonomy";
import type { SessionType } from "../types";
import styles from "./PracticeView.module.css";

interface PracticeViewProps {
  onStart: (type: SessionType, n: number, skills: string[]) => void;
}

export default function PracticeView({ onStart }: PracticeViewProps) {
  const [skills, setSkills] = useState<string[]>([]);
  const [pCount, setPCount] = useState(10);

  const toggleSkill = (s: string) =>
    setSkills(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);
  const toggleCategory = (sec: TaxonomyKey, sub: string) => {
    const cat = TAXONOMY[sec].subtypes[sub];
    if (cat.every(s => skills.includes(s))) setSkills(p => p.filter(x => !cat.includes(x)));
    else setSkills(p => [...new Set([...p, ...cat])]);
  };
  const toggleSection = (sec: TaxonomyKey) => {
    const all = allSkills(sec);
    if (all.every(s => skills.includes(s))) setSkills(p => p.filter(x => !all.includes(x)));
    else setSkills(p => [...new Set([...p, ...all])]);
  };

  const renderColumn = (sec: TaxonomyKey) => {
    const t = TAXONOMY[sec];
    const all = allSkills(sec);
    const allSel = all.every(s => skills.includes(s));
    const selectAllClasses = [styles.selectAll, allSel && styles.selectAllActive]
      .filter(Boolean).join(" ");
    return (
      <div className={styles.column}>
        <div className={styles.columnHeader}>
          <span className={styles.columnTitle}>{t.label}</span>
          <button onClick={() => toggleSection(sec)} className={selectAllClasses}>
            {allSel ? "Deselect All" : "Select All"}
          </button>
        </div>
        {Object.entries(t.subtypes).map(([sub, subSkills]) => {
          const catAll = subSkills.every(s => skills.includes(s));
          const catCount = subSkills.filter(s => skills.includes(s)).length;
          const catBtnClasses = [styles.categoryBtn, catAll && styles.categoryBtnActive]
            .filter(Boolean).join(" ");
          return (
            <div key={sub} className={styles.category}>
              <div className={styles.categoryHeader}>
                <button onClick={() => toggleCategory(sec, sub)} className={catBtnClasses}>
                  {sub}
                </button>
                <span className={styles.categoryCount}>{catCount}/{subSkills.length}</span>
              </div>
              <div className={styles.pills}>
                {subSkills.map(s => (
                  <Pill key={s} active={skills.includes(s)} onClick={() => toggleSkill(s)}>{s}</Pill>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Shell wide>
      <div className={styles.container}>
        <h1 className={styles.title}>Practice</h1>
        <p className={styles.subtitle}>Select skills from either or both sections.</p>
        <div className={styles.columns}>
          {renderColumn("math")}
          {renderColumn("rw")}
        </div>
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
