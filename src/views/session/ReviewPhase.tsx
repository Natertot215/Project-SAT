import Btn from "../../components/primitives/Btn";
import ModuleDropdown from "../../components/ModuleDropdown";
import { isRWSkill } from "../../data/taxonomy";
import type {
  CrossoutsMap, FlagsMap, ModuleDef, ReviewItem, SessionType,
} from "../../types";
import styles from "./ReviewPhase.module.css";

interface ReviewPhaseProps {
  sessionType: SessionType;
  modules: ModuleDef[];
  currentMod: number;
  qIdx: number;
  questionSkills: (string | null)[];
  results: ReviewItem[];
  flags: FlagsMap;
  crossouts: CrossoutsMap;
  wide: boolean;
  onHome: () => void;
  onSetQIdx: (i: number) => void;
  onSetCurrentMod: (i: number) => void;
}

export default function ReviewPhase({
  sessionType, modules, currentMod, qIdx, questionSkills, results, flags, crossouts, wide,
  onHome, onSetQIdx, onSetCurrentMod,
}: ReviewPhaseProps) {
  const mod = modules[currentMod] || { start: 0, count: 0, label: "", sec: "mixed" as const };
  const modLocalIdx = qIdx - mod.start;
  const isLastMod = currentMod === modules.length - 1;
  const r = (results[qIdx] || {}) as Partial<ReviewItem>;
  const choices = ["A", "B", "C", "D"];
  const qSkill = questionSkills[qIdx] || "";
  const isRW = isRWSkill(qSkill) || (sessionType === "test" && mod.sec === "rw");

  const badgeClasses = [
    styles.badge,
    r.correct && styles.badgeOk,
    !r.correct && r.answered && styles.badgeBad,
  ].filter(Boolean).join(" ");

  const gridClasses = wide ? styles.gridWide : styles.grid;
  const passageClasses = [styles.passage, wide && styles.passageWide]
    .filter(Boolean).join(" ");

  return (
    <div className={styles.root}>
      <div className={styles.topBar}>
        <div className={styles.topLeft}>
          <button onClick={onHome} className={styles.iconBtn}>⌂</button>
          <ModuleDropdown
            modules={modules}
            currentMod={currentMod}
            onSelect={(mi) => { onSetCurrentMod(mi); onSetQIdx(modules[mi].start); }}
          />
        </div>
        <span className={styles.counter}>
          Review: {modLocalIdx + 1} <span className={styles.counterDim}>/ {mod.count}</span>
        </span>
        <div className={styles.status}>
          <span className={badgeClasses}>
            {r.correct ? "✓ Correct" : r.answered ? "✗ Wrong" : "Skipped"}
          </span>
        </div>
      </div>

      <div
        className={styles.navStrip}
        style={{ gridTemplateColumns: `repeat(${mod.count}, 1fr)` }}
      >
        {Array.from({ length: mod.count }, (_, i) => {
          const gi = mod.start + i;
          const cur = gi === qIdx;
          const rr = results[gi] || ({} as Partial<ReviewItem>);
          const fl = flags[gi];
          const cellClasses = [
            styles.navCell,
            fl && styles.navCellFlagged,
            !fl && rr.correct && styles.navCellOk,
            !fl && !rr.correct && rr.answered && styles.navCellBad,
            cur && styles.navCellCurrent,
          ].filter(Boolean).join(" ");
          return (
            <button key={i} onClick={() => onSetQIdx(gi)} className={cellClasses}>
              {i + 1}
            </button>
          );
        })}
      </div>

      <div className={styles.body}>
        <div className={styles.sectionLabel}>{qSkill || "Skill"}</div>
        <div className={gridClasses}>
          <div>
            <div className={styles.questionBox}>
              <span className={styles.placeholderText}>Question text placeholder</span>
            </div>
            {isRW && (
              <div className={passageClasses}>
                <div className={styles.passageLabel}>Passage</div>
                <div className={styles.passageContent}>Passage content</div>
              </div>
            )}
          </div>
          <div>
            <div className={styles.choices}>
              {choices.map((letter, ci) => {
                const wasYours = r.picked === ci;
                const isCorrect = r.correctChoice === ci;
                const wrong = wasYours && !isCorrect;
                const wasCrossed = !!crossouts[`${qIdx}-${ci}`] && !isCorrect && !wasYours;
                const label = isCorrect ? " ✓" : wrong ? " ✗" : "";
                const boxClasses = [
                  styles.choice,
                  isCorrect && styles.choiceCorrect,
                  wrong && styles.choiceWrong,
                  wasCrossed && styles.choiceCrossed,
                ].filter(Boolean).join(" ");
                const letterClasses = [
                  styles.choiceLetter,
                  isCorrect && styles.choiceLetterCorrect,
                  wrong && styles.choiceLetterWrong,
                ].filter(Boolean).join(" ");
                const textClasses = [
                  styles.choiceText,
                  isCorrect && styles.choiceTextCorrect,
                  wrong && styles.choiceTextWrong,
                ].filter(Boolean).join(" ");
                return (
                  <div key={ci} className={boxClasses}>
                    <span className={letterClasses}>{letter}</span>
                    <span className={textClasses}>Answer placeholder{label}</span>
                    {wrong && <span className={styles.yoursTag}>Your answer</span>}
                  </div>
                );
              })}
            </div>
            <div className={styles.explanation}>
              <div className={styles.explanationLabel}>Explanation</div>
              <p className={styles.explanationText}>
                Explanation placeholder — AI-generated reasoning will appear here.
              </p>
            </div>
            <div className={styles.navButtons}>
              <Btn small disabled={qIdx <= mod.start} onClick={() => onSetQIdx(qIdx - 1)}>← Prev</Btn>
              {modLocalIdx < mod.count - 1 ? (
                <Btn small onClick={() => onSetQIdx(qIdx + 1)}>Next →</Btn>
              ) : isLastMod ? (
                <Btn small onClick={onHome}>Done</Btn>
              ) : (
                <Btn small onClick={() => onSetCurrentMod(currentMod + 1)}>Next Module →</Btn>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
