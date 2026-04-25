import type { Dispatch, SetStateAction } from "react";
import Pill from "./primitives/Pill";
import { TAXONOMY, allSkills } from "../data/taxonomy";
import type { Skill } from "../types";

type Sec = "rw" | "math";

interface ColumnProps {
  sec: Sec;
  skills: Skill[];
  onToggleSkill: (s: Skill) => void;
  onToggleCategory: (sec: Sec, sub: string) => void;
  onToggleSection: (sec: Sec) => void;
}

function SkillColumn({ sec, skills, onToggleSkill, onToggleCategory, onToggleSection }: ColumnProps) {
  const t = TAXONOMY[sec];
  const all = allSkills(sec);
  const allSel = all.every((s) => skills.includes(s));

  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-[var(--scale-section-header-mb)]">
        <span className="text-[length:var(--scale-section-header-text)] font-bold text-tx">
          {t.label}
        </span>
        <button
          onClick={() => onToggleSection(sec)}
          aria-label={`${allSel ? "Deselect" : "Select"} all ${t.label} skills`}
          className={`rounded-[var(--scale-selectall-rounded)] px-[var(--scale-selectall-px)] py-[var(--scale-selectall-py)] text-[length:var(--scale-selectall-text)] font-semibold cursor-pointer transition-all duration-[120ms] border hover:scale-[1.02] ${
            allSel
              ? "bg-sel-dim text-sel border-tx2 hover:border-tx"
              : "bg-transparent text-tx3 border-bdr hover:bg-sel-dim hover:border-bdr2 hover:text-tx2"
          }`}
        >
          {allSel ? "Deselect All" : "Select All"}
        </button>
      </div>
      {Object.entries(t.subtypes).map(([sub, subSkills]) => {
        const catAll = subSkills.every((s) => skills.includes(s));
        const catCount = subSkills.filter((s) => skills.includes(s)).length;
        return (
          <div key={sub} className="mb-[var(--scale-subtype-mb)] last:mb-0">
            <div className="flex items-center gap-2 mb-[var(--scale-subtype-title-mb)]">
              <button
                onClick={() => onToggleCategory(sec, sub)}
                aria-label={`Toggle category ${sub}`}
                className={`bg-transparent border-0 cursor-pointer p-0 text-[length:var(--scale-subtype-title-text)] font-semibold transition-colors duration-[120ms] hover:text-tx ${
                  catAll ? "text-tx" : "text-tx2"
                }`}
              >
                {sub}
              </button>
              <span className="text-[length:var(--scale-subtype-count-text)] text-tx3">
                {catCount}/{subSkills.length}
              </span>
            </div>
            <div className="flex flex-wrap gap-[var(--scale-pillgrid-gap)]">
              {subSkills.map((s) => (
                <Pill
                  key={s}
                  responsive
                  active={skills.includes(s)}
                  onClick={() => onToggleSkill(s)}
                >
                  {s}
                </Pill>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface SkillSelectorProps {
  skills: Skill[];
  setSkills: Dispatch<SetStateAction<Skill[]>>;
}

export default function SkillSelector({ skills, setSkills }: SkillSelectorProps) {
  const toggleSkill = (s: Skill) =>
    setSkills((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));

  const toggleCategory = (sec: Sec, sub: string) => {
    const cat = TAXONOMY[sec].subtypes[sub];
    if (cat.every((s) => skills.includes(s))) {
      setSkills((p) => p.filter((x) => !cat.includes(x)));
    } else {
      setSkills((p) => [...new Set([...p, ...cat])]);
    }
  };

  const toggleSection = (sec: Sec) => {
    const all = allSkills(sec);
    if (all.every((s) => skills.includes(s))) {
      setSkills((p) => p.filter((x) => !all.includes(x)));
    } else {
      setSkills((p) => [...new Set([...p, ...all])]);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-[var(--scale-skillsel-cols-gap)] mb-[var(--scale-section-gap)]">
      <SkillColumn
        sec="math"
        skills={skills}
        onToggleSkill={toggleSkill}
        onToggleCategory={toggleCategory}
        onToggleSection={toggleSection}
      />
      <SkillColumn
        sec="rw"
        skills={skills}
        onToggleSkill={toggleSkill}
        onToggleCategory={toggleCategory}
        onToggleSection={toggleSection}
      />
    </div>
  );
}
