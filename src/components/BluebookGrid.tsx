import { getGridCols } from "../lib/grid";
import type { AnswersMap, FlagsMap, ModuleDef } from "../types";
import styles from "./BluebookGrid.module.css";

interface BluebookGridProps {
  mod: ModuleDef;
  answers: AnswersMap;
  flags: FlagsMap;
  qIdx: number;
  onClickQ: (gi: number) => void;
  forceCols?: number;
}

export default function BluebookGrid({
  mod, answers, flags, qIdx, onClickQ, forceCols,
}: BluebookGridProps) {
  const cols = forceCols || getGridCols(mod.count);
  return (
    <div
      className={styles.grid}
      style={{ gridTemplateColumns: `repeat(${cols}, 44px)` }}
    >
      {Array.from({ length: mod.count }, (_, i) => {
        const gi = mod.start + i;
        const ans = answers[gi] != null;
        const fl = flags[gi];
        const cur = gi === qIdx;
        const classes = [
          styles.cell,
          !ans && !fl && !cur && styles.cellUnanswered,
          fl && styles.cellFlagged,
          cur && styles.cellCurrent,
        ].filter(Boolean).join(" ");
        return (
          <button key={i} onClick={() => onClickQ(gi)} className={classes}>
            {i + 1}
          </button>
        );
      })}
    </div>
  );
}
