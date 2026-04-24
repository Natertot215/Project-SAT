import Pill from "./primitives/Pill";
import { TAXONOMY, allSkills, type TaxonomyKey } from "../data/taxonomy";
import styles from "./SkillPicker.module.css";

interface SkillPickerProps {
  skills: string[];
  onChange: (skills: string[]) => void;
}

export default function SkillPicker({ skills, onChange }: SkillPickerProps) {
  const toggleSkill = (s: string) =>
    onChange(skills.includes(s) ? skills.filter(x => x !== s) : [...skills, s]);

  const toggleCategory = (sec: TaxonomyKey, sub: string) => {
    const cat = TAXONOMY[sec].subtypes[sub];
    if (cat.every(s => skills.includes(s))) onChange(skills.filter(x => !cat.includes(x)));
    else onChange([...new Set([...skills, ...cat])]);
  };

  const toggleSection = (sec: TaxonomyKey) => {
    const all = allSkills(sec);
    if (all.every(s => skills.includes(s))) onChange(skills.filter(x => !all.includes(x)));
    else onChange([...new Set([...skills, ...all])]);
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
    <div className={styles.columns}>
      {renderColumn("math")}
      {renderColumn("rw")}
    </div>
  );
}
