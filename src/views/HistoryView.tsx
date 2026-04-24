import { useState } from "react";
import Shell from "../components/primitives/Shell";
import Back from "../components/primitives/Back";
import Btn from "../components/primitives/Btn";
import Label from "../components/primitives/Label";
import { getGridCols } from "../lib/grid";
import type { HistoryEntry, ReviewItem } from "../types";
import styles from "./HistoryView.module.css";

interface ReviewFromHistoryProps {
  session: HistoryEntry;
  idx: number;
  onNav: (i: number) => void;
  onBack: () => void;
}

function ReviewFromHistory({ session: s, idx: ri, onNav, onBack }: ReviewFromHistoryProps) {
  const rd: ReviewItem[] = s.reviewData || [];
  const r = (rd[ri] || {}) as Partial<ReviewItem>;
  const choices = ["A", "B", "C", "D"];
  const badgeClasses = [
    styles.reviewBadge,
    r.correct && styles.reviewBadgeOk,
    !r.correct && r.answered && styles.reviewBadgeBad,
  ].filter(Boolean).join(" ");

  return (
    <div className={styles.reviewRoot}>
      <div className={styles.reviewTop}>
        <Back onClick={onBack} label="Session" />
        <span className={styles.reviewCounter}>
          Review: {ri + 1} <span className={styles.reviewCounterDim}>/ {rd.length}</span>
        </span>
        <div className={styles.reviewStatus}>
          <span className={badgeClasses}>
            {r.correct ? "✓ Correct" : r.answered ? "✗ Wrong" : "Skipped"}
          </span>
        </div>
      </div>

      <div
        className={styles.navStrip}
        style={{ gridTemplateColumns: `repeat(${rd.length}, 1fr)` }}
      >
        {rd.map((rr, i) => {
          const cur = i === ri;
          const cellClasses = [
            styles.navCell,
            rr.correct && styles.navCellOk,
            !rr.correct && rr.answered && styles.navCellBad,
            cur && styles.navCellCurrent,
          ].filter(Boolean).join(" ");
          return (
            <button key={i} onClick={() => onNav(i)} className={cellClasses}>
              {i + 1}
            </button>
          );
        })}
      </div>

      <div className={styles.body}>
        <div className={styles.sectionLabel}>{r.skill || "Skill"}</div>
        <div className={styles.questionBox}>
          <span className={styles.placeholderText}>Question text placeholder</span>
        </div>
        {r.isRW && (
          <div className={styles.passage}>
            <div className={styles.passageLabel}>Passage</div>
            <div className={styles.passageContent}>Passage content</div>
          </div>
        )}
        <div className={styles.choices}>
          {choices.map((letter, ci) => {
            const wasYours = r.picked === ci;
            const isCorrect = r.correctChoice === ci;
            const wrong = wasYours && !isCorrect;
            const label = isCorrect ? " ✓" : wrong ? " ✗" : "";
            const boxClasses = [
              styles.choice,
              isCorrect && styles.choiceCorrect,
              wrong && styles.choiceWrong,
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
          <p className={styles.explanationText}>Explanation placeholder.</p>
        </div>
        <div className={styles.navButtons}>
          <Btn small disabled={ri === 0} onClick={() => onNav(ri - 1)}>← Prev</Btn>
          {ri < rd.length - 1
            ? <Btn small onClick={() => onNav(ri + 1)}>Next →</Btn>
            : <Btn small onClick={onBack}>Done</Btn>}
        </div>
      </div>
    </div>
  );
}

interface SessionDetailProps {
  session: HistoryEntry;
  onBack: () => void;
  onDelete: () => void;
  onReview: () => void;
}

function SessionDetail({ session: s, onBack, onDelete, onReview }: SessionDetailProps) {
  const pct = s.attempted > 0 ? Math.round((s.correct / s.attempted) * 100) : 0;
  const hasReview = s.reviewData && s.reviewData.length > 0;
  return (
    <Shell wide>
      <div className={styles.detailContainer}>
        <Back onClick={onBack} label="History" />
        <div className={styles.detailHeader}>
          <div>
            <h1 className={styles.detailTitle}>{s.type}</h1>
            <p className={styles.detailMeta}>{s.date} · {s.attempted} attempted</p>
          </div>
          <div className={styles.detailScore}>
            <div className={styles.detailScorePct}>{pct}%</div>
            <div className={styles.detailScoreFrac}>{s.correct}/{s.attempted}</div>
          </div>
        </div>
        <div className={styles.breakdown}>
          <Label>Breakdown</Label>
          <div
            className={styles.breakdownGrid}
            style={{ gridTemplateColumns: `repeat(${getGridCols(s.total)}, 1fr)` }}
          >
            {s.breakdown.map((correct, i) => {
              const fl = s.flagged && s.flagged[i];
              const cellClasses = [
                styles.breakdownCell,
                fl && styles.breakdownWarn,
                !fl && correct && styles.breakdownOk,
                !fl && !correct && styles.breakdownBad,
              ].filter(Boolean).join(" ");
              return <div key={i} className={cellClasses}>{i + 1}</div>;
            })}
          </div>
        </div>
        <div className={styles.detailActions}>
          {hasReview && <Btn small onClick={onReview}>Review Questions</Btn>}
          <Btn danger small onClick={onDelete}>Delete</Btn>
        </div>
      </div>
    </Shell>
  );
}

interface HistoryViewProps {
  history: HistoryEntry[];
  onDelete: (id: number) => void;
}

export default function HistoryView({ history, onDelete }: HistoryViewProps) {
  const [viewing, setViewing] = useState<HistoryEntry | null>(null);
  const [review, setReview] = useState<{ session: HistoryEntry; idx: number } | null>(null);

  if (review) {
    return (
      <ReviewFromHistory
        session={review.session}
        idx={review.idx}
        onNav={(i) => setReview({ session: review.session, idx: i })}
        onBack={() => setReview(null)}
      />
    );
  }

  if (viewing) {
    return (
      <SessionDetail
        session={viewing}
        onBack={() => setViewing(null)}
        onDelete={() => { onDelete(viewing.id); setViewing(null); }}
        onReview={() => setReview({ session: viewing, idx: 0 })}
      />
    );
  }

  return (
    <Shell>
      <div className={styles.container}>
        <h1 className={styles.title}>History</h1>
        <p className={styles.subtitle}>Past sessions and scores.</p>
        {history.length === 0 && <p className={styles.empty}>No sessions yet.</p>}
        <div className={styles.list}>
          {history.map((h) => (
            <div key={h.id} className={styles.row}>
              <button onClick={() => setViewing(h)} className={styles.rowMain}>
                <span className={styles.rowDate}>{h.date}</span>
                <span className={styles.rowType}>{h.type}</span>
                <span className={styles.rowScore}>{h.correct}/{h.attempted}</span>
              </button>
              <button onClick={() => onDelete(h.id)} title="Delete" className={styles.rowDelete}>×</button>
            </div>
          ))}
        </div>
      </div>
    </Shell>
  );
}
