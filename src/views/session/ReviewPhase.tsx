import { memo } from "react";
import ModuleDropdown from "../../components/ModuleDropdown";
import ReviewBody from "../../components/session/ReviewBody";
import { isRWQuestion } from "../../data/taxonomy";
import type { CrossoutMap, FlagMap, Module, ReviewResult, SessionType, Skill } from "../../types";

interface ReviewPhaseProps {
  sessionType: SessionType;
  modules: Module[];
  currentMod: number;
  qIdx: number;
  questionSkills: Skill[];
  results: ReviewResult[];
  flags: FlagMap;
  crossouts: CrossoutMap;
  wide: boolean;
  onHome: () => void;
  onSetQIdx: (i: number) => void;
  onSetCurrentMod: (mi: number) => void;
}

function ReviewPhase({
  sessionType,
  modules,
  currentMod,
  qIdx,
  questionSkills,
  results,
  flags,
  crossouts,
  wide,
  onHome,
  onSetQIdx,
  onSetCurrentMod,
}: ReviewPhaseProps) {
  const mod = modules[currentMod] || { start: 0, count: 0, label: "", sec: "mixed" };
  const modLocalIdx = qIdx - mod.start;
  const isLastMod = currentMod === modules.length - 1;
  const r = results[qIdx] || ({} as Partial<ReviewResult>);
  const choices = ["A", "B", "C", "D"];
  const qSkill = questionSkills[qIdx] || "";
  const isRW = isRWQuestion(qSkill, sessionType, mod.sec);

  const statusLabel = r.correct ? "✓ Correct" : r.answered ? "✗ Wrong" : "Skipped";
  const statusClass = r.correct
    ? "bg-ok-dim text-ok"
    : r.answered
      ? "bg-bad-dim text-bad"
      : "bg-sf2 text-tx3";

  return (
    <div className="min-h-screen bg-bg text-tx flex flex-col">
      <div className="pt-5 px-pad pb-2 grid grid-cols-[1fr_auto_1fr] items-center flex-shrink-0">
        <div className="flex gap-2 items-center">
          <button
            onClick={onHome}
            aria-label="Home"
            className="bg-sf2 border border-bdr rounded-md text-tx3 text-xs cursor-pointer px-2.5 py-[5px] w-9 flex items-center justify-center transition-all duration-[120ms]"
          >
            ⌂
          </button>
          <ModuleDropdown
            modules={modules}
            currentMod={currentMod}
            onSelect={(mi) => {
              onSetCurrentMod(mi);
              onSetQIdx(modules[mi].start);
            }}
          />
        </div>
        <span className="text-[13px] font-semibold text-center">
          Review: {modLocalIdx + 1} <span className="text-tx3 font-normal">/ {mod.count}</span>
        </span>
        <div className="flex justify-end">
          <span className={`px-3 py-[5px] rounded-md text-xs font-semibold ${statusClass}`}>
            {statusLabel}
          </span>
        </div>
      </div>

      <div
        className="px-pad pb-4 grid gap-[6px] flex-shrink-0"
        style={{ gridTemplateColumns: `repeat(${mod.count}, 1fr)` }}
      >
        {Array.from({ length: mod.count }, (_, i) => {
          const gi = mod.start + i;
          const cur = gi === qIdx;
          const rr = results[gi] || ({} as Partial<ReviewResult>);
          const fl = flags[gi];
          let cls = "border-bdr text-tx3";
          if (fl) cls = "border-warn text-warn";
          else if (rr.correct) cls = "border-ok text-ok";
          else if (rr.answered) cls = "border-bad text-bad";

          return (
            <button
              key={i}
              onClick={() => onSetQIdx(gi)}
              aria-label={`Review question ${i + 1}${cur ? " (current)" : ""}`}
              className={`h-9 rounded-[5px] text-[11px] font-semibold border-[1.5px] cursor-pointer flex items-center justify-center transition-all duration-[120ms] ${
                cur ? "bg-sf3 border-tx2 text-tx" : `bg-transparent ${cls}`
              }`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      <div className="flex-1 flex flex-col px-pad pb-7 w-full">
        <div className="text-[11px] text-tx2 font-semibold uppercase tracking-[.07em] mb-2">
          {qSkill || "Skill"}
        </div>
        <ReviewBody
          wide={wide}
          isRW={isRW}
          choices={choices}
          r={r}
          qIdx={qIdx}
          mod={mod}
          isLastMod={isLastMod}
          currentMod={currentMod}
          crossouts={crossouts}
          onSetQIdx={onSetQIdx}
          onSetCurrentMod={onSetCurrentMod}
          onHome={onHome}
        />
      </div>
    </div>
  );
}

export default memo(ReviewPhase);
