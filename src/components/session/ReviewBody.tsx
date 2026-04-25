import Btn from "../primitives/Btn";
import type { CrossoutMap, Module, Question, ReviewResult } from "../../types";

interface ReviewBodyProps {
  wide: boolean;
  choices: string[];
  r: Partial<ReviewResult>;
  qIdx: number;
  mod: Module;
  question: Question | undefined;
  isLastMod: boolean;
  currentMod: number;
  crossouts: CrossoutMap;
  onSetQIdx: (i: number) => void;
  onSetCurrentMod: (mi: number) => void;
  onHome: () => void;
}

export default function ReviewBody({
  wide,
  choices,
  r,
  qIdx,
  mod,
  question,
  isLastMod,
  currentMod,
  crossouts,
  onSetQIdx,
  onSetCurrentMod,
  onHome,
}: ReviewBodyProps) {
  const modLocalIdx = qIdx - mod.start;
  const stemBlock = (
    <div className="px-5 py-4 bg-sf rounded-lg border border-bdr">
      <div className="text-[11px] text-tx3 uppercase tracking-[.07em] mb-3 font-semibold">
        Question
      </div>
      <div className="text-tx2 text-[15px] whitespace-pre-wrap">
        {question?.stem ?? ""}
      </div>
    </div>
  );

  const passageText = question?.passage ?? null;
  const showPassage = passageText != null && passageText.length > 0;
  const passageBlock = showPassage ? (
    <div className="bg-sf border border-bdr rounded-lg p-6">
      <div className="text-[11px] text-tx3 uppercase tracking-[.07em] mb-3 font-semibold">
        Content
      </div>
      <div className="min-h-[80px] text-tx2 text-[15px] leading-[1.7] whitespace-pre-wrap p-1">
        {passageText}
      </div>
    </div>
  ) : null;

  const choicesBlock = (
    <div className="flex flex-col gap-2">
      {choices.map((letter, ci) => {
        const wasYours = r.picked === ci;
        const isCorrect = r.correctChoice === ci;
        const wasCrossed = crossouts[`${qIdx}-${ci}`];
        const choiceText = question?.choices?.[ci] ?? "";
        let wrapCls = "border-bdr bg-transparent text-tx2";
        let badgeCls = "bg-sf text-tx3 border-bdr2";
        let label = "";
        if (isCorrect) {
          wrapCls = "border-ok bg-ok-dim text-ok";
          badgeCls = "bg-ok-dim text-ok border-transparent";
          label = " ✓";
        }
        if (wasYours && !isCorrect) {
          wrapCls = "border-bad bg-bad-dim text-bad";
          badgeCls = "bg-bad-dim text-bad border-transparent";
          label = " ✗";
        }
        const fade = wasCrossed && !isCorrect && !wasYours;

        return (
          <div
            key={ci}
            className={`flex items-center gap-[14px] px-4 py-[14px] rounded-lg border-[1.5px] ${wrapCls} ${
              fade ? "opacity-40 line-through" : ""
            }`}
          >
            <span
              className={`w-7 h-7 rounded-md flex items-center justify-center text-[13px] font-semibold flex-shrink-0 border ${badgeCls}`}
            >
              {letter}
            </span>
            <span className="text-[15px] flex-1">
              {choiceText}
              {label}
            </span>
            {wasYours && !isCorrect && (
              <span className="text-[11px] font-semibold">Your answer</span>
            )}
          </div>
        );
      })}
    </div>
  );

  const explanationBlock = (
    <div className="mt-4 px-[18px] py-[14px] bg-sf rounded-lg border border-bdr">
      <div className="text-[11px] text-tx3 uppercase tracking-[.07em] mb-2 font-semibold">
        Explanation
      </div>
      <p className="text-tx2 text-[15px] leading-[1.6] m-0 whitespace-pre-wrap">
        {question?.explanation ?? ""}
      </p>
    </div>
  );

  const navBlock = (
    <div className="flex justify-between mt-6">
      <Btn small disabled={qIdx <= mod.start} onClick={() => onSetQIdx(qIdx - 1)}>
        ← Prev
      </Btn>
      {modLocalIdx < mod.count - 1 ? (
        <Btn small onClick={() => onSetQIdx(qIdx + 1)}>
          Next →
        </Btn>
      ) : isLastMod ? (
        <Btn small onClick={onHome}>
          Done
        </Btn>
      ) : (
        <Btn small onClick={() => onSetCurrentMod(currentMod + 1)}>
          Next Module →
        </Btn>
      )}
    </div>
  );

  if (wide) {
    return (
      <div className="flex-1 grid grid-cols-[minmax(0,3fr)_minmax(0,1fr)] gap-6">
        <div className="flex flex-col gap-4 min-w-0">
          {stemBlock}
          {passageBlock}
        </div>
        <div className="flex flex-col min-w-0">
          {choicesBlock}
          {explanationBlock}
          {navBlock}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col gap-4">
      {stemBlock}
      {passageBlock}
      {/* Spacer pushes answers/explanation/nav to the bottom; min-h preserves a small gap when content is short. */}
      <div className="flex-1 min-h-6" />
      <div>
        {choicesBlock}
        {explanationBlock}
        {navBlock}
      </div>
    </div>
  );
}
