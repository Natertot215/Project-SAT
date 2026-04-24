import Shell from "../../components/primitives/Shell";
import BluebookGrid from "../../components/BluebookGrid";
import type { AnswersMap, FlagsMap, ModuleDef, Phase, SessionType } from "../../types";
import styles from "./BreakPhase.module.css";

interface BreakPhaseProps {
  sessionType: SessionType;
  modules: ModuleDef[];
  currentMod: number;
  qIdx: number;
  answers: AnswersMap;
  flags: FlagsMap;
  onSetQIdx: (i: number) => void;
  onSetPhase: (p: Phase) => void;
  onNextModule: () => void;
  onSubmit: () => void;
  onRestart: () => void;
}

export default function BreakPhase({
  sessionType, modules, currentMod, qIdx, answers, flags,
  onSetQIdx, onSetPhase, onNextModule, onSubmit, onRestart,
}: BreakPhaseProps) {
  const mod = modules[currentMod] || { start: 0, count: 0, label: "", sec: "mixed" as const };
  const isLastMod = currentMod === modules.length - 1;
  const modAnswered = Array.from({ length: mod.count }, (_, i) => answers[mod.start + i] != null)
    .filter(Boolean).length;
  const modFlagged = Array.from({ length: mod.count }, (_, i) => flags[mod.start + i])
    .filter(Boolean).length;
  const gridW = 9 * 52;

  return (
    <Shell wide>
      <div className={styles.container}>
        <h2 className={styles.title}>{mod.label}</h2>
        <p className={styles.subtitle}>Questions</p>
        <div className={styles.gridWrap}>
          <BluebookGrid
            mod={mod}
            answers={answers}
            flags={flags}
            qIdx={qIdx}
            onClickQ={(gi) => { onSetQIdx(gi); onSetPhase("questions"); }}
            forceCols={9}
          />
        </div>
        <div className={styles.stats}>
          <span className={styles.statAnswered}>{modAnswered} answered</span>
          {mod.count - modAnswered > 0 && (
            <span className={styles.statMuted}>{mod.count - modAnswered} unanswered</span>
          )}
          {modFlagged > 0 && <span className={styles.statMuted}>{modFlagged} flagged</span>}
        </div>
        <div className={styles.actions} style={{ maxWidth: gridW }}>
          <button onClick={() => onSetPhase("questions")} className={styles.action}>
            Back to Questions
          </button>
          {isLastMod || sessionType === "practice" ? (
            <button onClick={onSubmit} className={styles.action}>
              {sessionType === "practice" ? "Submit Practice" : "Submit Test"}
            </button>
          ) : (
            <button onClick={onNextModule} className={styles.action}>
              Proceed to Next Module
            </button>
          )}
        </div>
        <button onClick={onRestart} className={styles.restart}>Restart Module</button>
      </div>
    </Shell>
  );
}
