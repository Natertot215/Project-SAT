import Btn from "../../components/primitives/Btn";
import ModuleDropdown from "../../components/ModuleDropdown";
import { isRWSkill } from "../../data/taxonomy";
import type {
  AnswersMap, CrossoutsMap, FlagsMap, ModuleDef, SessionType,
} from "../../types";
import styles from "./QuestionsPhase.module.css";

interface QuestionsPhaseProps {
  sessionType: SessionType;
  modules: ModuleDef[];
  currentMod: number;
  qIdx: number;
  questionSkills: (string | null)[];
  answers: AnswersMap;
  flags: FlagsMap;
  crossouts: CrossoutsMap;
  highlighting: boolean;
  confirmHome: boolean;
  answeredCount: number;
  wide: boolean;
  onConfirmHome: () => void;
  onCancelHome: () => void;
  onSaveAndExit: () => void;
  onDiscardHome: () => void;
  onSetQIdx: (i: number) => void;
  onSetCurrentMod: (i: number) => void;
  onToggleHighlight: () => void;
  onToggleFlag: () => void;
  onSetAnswer: (ci: number) => void;
  onToggleCrossout: (ci: number) => void;
  onGoBreak: () => void;
}

export default function QuestionsPhase({
  sessionType, modules, currentMod, qIdx, questionSkills,
  answers, flags, crossouts, highlighting, confirmHome, answeredCount, wide,
  onConfirmHome, onCancelHome, onSaveAndExit, onDiscardHome,
  onSetQIdx, onSetCurrentMod, onToggleHighlight, onToggleFlag,
  onSetAnswer, onToggleCrossout, onGoBreak,
}: QuestionsPhaseProps) {
  const mod = modules[currentMod] || { start: 0, count: 0, label: "", sec: "mixed" as const };
  const modLocalIdx = qIdx - mod.start;
  const qSkill = questionSkills[qIdx] || "";
  const isRW = isRWSkill(qSkill) || (sessionType === "test" && mod.sec === "rw");
  const choices = ["A", "B", "C", "D"];
  const showSkill = sessionType === "practice";

  const highlightBtnClasses = [styles.toolBtn, highlighting && styles.toolBtnActiveSel]
    .filter(Boolean).join(" ");
  const flagBtnClasses = [styles.toolBtn, styles.flagBtn, flags[qIdx] && styles.flagBtnActive]
    .filter(Boolean).join(" ");
  const gridClasses = wide ? styles.gridWide : styles.grid;
  const passageClasses = [
    styles.passage,
    wide && styles.passageWide,
    highlighting && styles.passageHighlighting,
  ].filter(Boolean).join(" ");
  const passageContentClasses = [
    styles.passageContent,
    highlighting && styles.passageContentSelectable,
  ].filter(Boolean).join(" ");

  return (
    <div className={styles.root}>
      {confirmHome && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <p className={styles.modalTitle}>Leave session?</p>
            <p className={styles.modalBody}>
              {answeredCount} question{answeredCount !== 1 ? "s" : ""} attempted.
            </p>
            <div className={styles.modalActions}>
              <Btn small onClick={onCancelHome}>Cancel</Btn>
              <Btn small onClick={onSaveAndExit}>Save & Exit</Btn>
              <Btn small danger onClick={onDiscardHome}>Discard</Btn>
            </div>
          </div>
        </div>
      )}

      <div className={styles.topBar}>
        <div className={styles.topLeft}>
          <button onClick={onConfirmHome} title="Home" className={styles.iconBtn}>⌂</button>
          {showSkill && <span className={styles.skillTag}>{qSkill || "Skill"}</span>}
          <button onClick={onGoBreak} className={styles.summaryBtn}>Summary</button>
          <ModuleDropdown
            modules={modules}
            currentMod={currentMod}
            onSelect={(mi) => { onSetCurrentMod(mi); onSetQIdx(modules[mi].start); }}
          />
        </div>
        <span className={styles.counter}>
          {modLocalIdx + 1} <span className={styles.counterDim}>/ {mod.count}</span>
        </span>
        <div className={styles.topRight}>
          <button onClick={onToggleHighlight} title="Highlight" className={highlightBtnClasses}>✎</button>
          <button onClick={onToggleFlag} className={flagBtnClasses}>
            {flags[qIdx] ? "⚑ Flagged" : "⚐ Flag"}
          </button>
        </div>
      </div>

      <div
        className={styles.navStrip}
        style={{ gridTemplateColumns: `repeat(${mod.count}, 1fr)` }}
      >
        {Array.from({ length: mod.count }, (_, i) => {
          const gi = mod.start + i;
          const cur = gi === qIdx;
          const ans = answers[gi] != null;
          const fl = flags[gi];
          const cellClasses = [
            styles.navCell,
            !cur && !fl && ans && styles.navCellAnswered,
            !cur && fl && styles.navCellFlagged,
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
        <div className={gridClasses}>
          <div>
            <div className={styles.questionBox}>
              <span className={styles.placeholderText}>Question text will appear here</span>
            </div>
            {isRW && (
              <div
                className={passageClasses}
                onMouseUp={() => {
                  if (!highlighting) return;
                  const sel = window.getSelection();
                  if (!sel || sel.isCollapsed || !sel.rangeCount) return;
                  const range = sel.getRangeAt(0);
                  const mark = document.createElement("mark");
                  try { range.surroundContents(mark); } catch { /* empty */ }
                  sel.removeAllRanges();
                }}
              >
                <div className={styles.passageLabel}>
                  Passage {highlighting && <span className={styles.passageLabelHint}>— highlighting on</span>}
                </div>
                <div className={passageContentClasses}>
                  Generated passage content. Select text while the highlight tool is active to mark important sections for reference.
                </div>
              </div>
            )}
          </div>
          <div>
            <div className={styles.choices}>
              {choices.map((letter, ci) => {
                const sel = answers[qIdx] === ci;
                const crossed = !!crossouts[`${qIdx}-${ci}`];
                const choiceClasses = [
                  styles.choice,
                  sel && styles.choiceSelected,
                  crossed && styles.choiceCrossed,
                ].filter(Boolean).join(" ");
                const letterClasses = [
                  styles.choiceLetter,
                  sel && styles.choiceLetterSelected,
                ].filter(Boolean).join(" ");
                const textClasses = [
                  styles.choiceText,
                  sel && styles.choiceTextSelected,
                ].filter(Boolean).join(" ");
                const crossoutClasses = [
                  styles.crossoutBtn,
                  crossed && styles.crossoutBtnActive,
                ].filter(Boolean).join(" ");
                return (
                  <button
                    key={ci}
                    onClick={() => { if (!crossed) onSetAnswer(ci); }}
                    className={choiceClasses}
                  >
                    <span className={letterClasses}>{letter}</span>
                    <span className={textClasses}>Answer placeholder</span>
                    <span
                      onClick={(e) => { e.stopPropagation(); onToggleCrossout(ci); }}
                      title="Cross out"
                      className={crossoutClasses}
                    >
                      ✕
                    </span>
                  </button>
                );
              })}
            </div>
            <div className={styles.navButtons}>
              <Btn small disabled={qIdx <= mod.start} onClick={() => onSetQIdx(qIdx - 1)}>← Prev</Btn>
              {modLocalIdx < mod.count - 1
                ? <Btn small onClick={() => onSetQIdx(qIdx + 1)}>Next →</Btn>
                : <Btn small onClick={onGoBreak}>Module Summary</Btn>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
