import Shell from "../../components/primitives/Shell";
import Btn from "../../components/primitives/Btn";
import Label from "../../components/primitives/Label";
import { getGridCols } from "../../lib/grid";
import type { FlagsMap, ReviewItem, SessionType } from "../../types";
import styles from "./ResultsPhase.module.css";

interface ResultsPhaseProps {
  sessionType: SessionType;
  results: ReviewItem[];
  flags: FlagsMap;
  total: number;
  onHome: () => void;
  onReview: () => void;
}

export default function ResultsPhase({
  sessionType, results, flags, total, onHome, onReview,
}: ResultsPhaseProps) {
  const correct = results.filter(r => r.correct).length;
  const attempted = results.filter(r => r.answered).length;
  const pct = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
  return (
    <Shell wide>
      <div className={styles.container}>
        <div className={styles.scoreRing}>
          <span className={styles.scoreText}>{pct}%</span>
        </div>
        <h1 className={styles.title}>
          {sessionType === "test" ? "Test" : "Practice"} Complete
        </h1>
        <p className={styles.subtitle}>
          {correct} correct out of {attempted} attempted ({total} total)
        </p>
        <div className={styles.breakdown}>
          <Label>Breakdown</Label>
          <div
            className={styles.breakdownGrid}
            style={{ gridTemplateColumns: `repeat(${getGridCols(total)}, 1fr)` }}
          >
            {results.map((r, i) => {
              const fl = flags[i];
              const cellClasses = [
                styles.breakdownCell,
                fl && styles.breakdownWarn,
                !fl && r.correct && styles.breakdownOk,
                !fl && !r.correct && r.answered && styles.breakdownBad,
              ].filter(Boolean).join(" ");
              return <div key={i} className={cellClasses}>{i + 1}</div>;
            })}
          </div>
        </div>
        <div className={styles.actions}>
          <Btn onClick={onHome}>Home</Btn>
          <Btn onClick={onReview}>Review Questions</Btn>
        </div>
      </div>
    </Shell>
  );
}
