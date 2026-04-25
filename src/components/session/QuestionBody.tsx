import Btn from "../primitives/Btn";
import type { AnswerMap, CrossoutMap, Module, Question } from "../../types";

interface QuestionBodyProps {
  wide: boolean;
  isRW: boolean;
  highlighting: boolean;
  choices: string[];
  qIdx: number;
  mod: Module;
  question: Question | undefined;
  answers: AnswerMap;
  crossouts: CrossoutMap;
  onSetAnswer: (ci: number) => void;
  onToggleCrossout: (ci: number) => void;
  onSetQIdx: (i: number) => void;
  onGoBreak: () => void;
}

export default function QuestionBody({
  wide,
  isRW,
  highlighting,
  choices,
  qIdx,
  mod,
  question,
  answers,
  crossouts,
  onSetAnswer,
  onToggleCrossout,
  onSetQIdx,
  onGoBreak,
}: QuestionBodyProps) {
  const modLocalIdx = qIdx - mod.start;
  const skillLabel = question?.skill ?? "";
  const stemBlock = (
    <div className="px-5 py-4 bg-sf rounded-lg border border-bdr">
      <div className="flex items-center justify-between mb-3 gap-2">
        <div className="text-[11px] text-tx3 uppercase tracking-[.07em] font-semibold">
          Question
        </div>
        <div className="relative group flex-shrink-0">
          <button
            type="button"
            aria-label="Question type info"
            className="w-6 h-6 rounded-md border border-bdr bg-sf2 text-tx3 text-[12px] font-semibold italic flex items-center justify-center cursor-default transition-none hover:border-bdr2 hover:text-tx2"
          >
            i
          </button>
          {skillLabel && (
            <div
              role="tooltip"
              className="absolute top-1/2 right-full mr-2 -translate-y-1/2 hidden group-hover:block bg-sf2 border border-bdr rounded-md px-3 py-[5px] text-xs text-tx2 whitespace-nowrap pointer-events-none"
            >
              {skillLabel}
            </div>
          )}
        </div>
      </div>
      <div className="text-tx2 text-[15px] whitespace-pre-wrap">
        {question?.stem ?? ""}
      </div>
    </div>
  );

  const passageText = question?.passage ?? null;
  const showPassage = passageText != null && passageText.length > 0;
  const passageBlock = showPassage ? (
    <div
      className={`${isRW && highlighting ? "hl-passage border-warn cursor-text" : "border-bdr cursor-default"} bg-sf border rounded-lg p-6 transition-colors duration-150`}
      onMouseUp={() => {
        if (!isRW || !highlighting) return;
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed || !sel.rangeCount) return;
        const range = sel.getRangeAt(0);
        const mark = document.createElement("mark");
        try {
          range.surroundContents(mark);
        } catch {
          /* selection spans non-text boundaries — ignore */
        }
        sel.removeAllRanges();
      }}
    >
      <div className="text-[11px] text-tx3 uppercase tracking-[.07em] mb-3 font-semibold">
        Content{" "}
        {isRW && highlighting && (
          <span className="text-warn font-normal">— highlighting on</span>
        )}
      </div>
      <div
        className={`min-h-[100px] text-tx2 text-[15px] leading-[1.7] p-1 whitespace-pre-wrap ${
          isRW && highlighting ? "select-text" : ""
        }`}
      >
        {passageText}
      </div>
    </div>
  ) : null;

  const choicesBlock = (
    <div className="flex flex-col gap-2">
      {choices.map((letter, ci) => {
        const sel = answers[qIdx] === ci;
        const crossed = crossouts[`${qIdx}-${ci}`];
        const choiceText = question?.choices?.[ci] ?? "";
        // Crossed-out choices: dimmed + strike-through (applied only to the
        // text span so the line starts at the choice text and ends symmetrically
        // before the X — flex gap-[14px] gives equal spacing on both sides).
        // No transitions and no hover affordance (they're not interactable).
        const palette = sel ? "border-tx2 bg-sel-dim" : "border-bdr bg-transparent";
        const interactive = crossed
          ? "cursor-default opacity-60"
          : "cursor-pointer transition-all duration-100 hover:border-bdr2";
        return (
          <button
            key={ci}
            onClick={() => {
              if (!crossed) onSetAnswer(ci);
            }}
            aria-pressed={sel}
            aria-label={`Choice ${letter}${sel ? " (selected)" : ""}${crossed ? " (crossed out)" : ""}`}
            className={`flex items-center gap-[14px] px-4 py-[14px] rounded-lg text-left border ${palette} ${interactive}`}
          >
            <span
              className={`w-7 h-7 rounded-md flex items-center justify-center text-[13px] font-semibold flex-shrink-0 border ${
                sel
                  ? "border-transparent bg-sel-dim text-sel"
                  : "border-bdr2 bg-sf text-tx3"
              }`}
            >
              {letter}
            </span>
            <span
              className={`relative text-[15px] flex-1 ${sel ? "text-sel" : "text-tx2"}`}
            >
              {choiceText}
              {crossed && (
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute left-0 right-0 top-1/2 -translate-y-1/2 h-px bg-current"
                />
              )}
            </span>
            <span
              onClick={(e) => {
                e.stopPropagation();
                onToggleCrossout(ci);
              }}
              role="button"
              aria-label={crossed ? `Uncross out ${letter}` : `Cross out ${letter}`}
              className={`w-6 h-6 rounded flex items-center justify-center text-[11px] font-bold flex-shrink-0 cursor-pointer transition-all duration-[120ms] hover:scale-[1.05] border ${
                crossed ? "border-tx3 bg-sf2 text-tx2" : "border-bdr2 bg-transparent text-tx3 hover:border-bdr hover:text-tx2"
              }`}
            >
              ✕
            </span>
          </button>
        );
      })}
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
      ) : (
        <Btn small onClick={onGoBreak}>
          Module Summary
        </Btn>
      )}
    </div>
  );

  if (wide) {
    return (
      <div className="flex-1 grid grid-cols-[minmax(0,3fr)_minmax(0,1fr)] gap-6 px-pad pb-7 w-full">
        <div className="flex flex-col gap-4 min-w-0">
          {stemBlock}
          {passageBlock}
        </div>
        <div className="flex flex-col min-w-0">
          {choicesBlock}
          {navBlock}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col gap-4 px-pad pb-7 w-full">
      {stemBlock}
      {passageBlock}
      {/* Spacer pushes answers to the bottom; min-h preserves a small gap when content is short. */}
      <div className="flex-1 min-h-6" />
      <div>
        {choicesBlock}
        {navBlock}
      </div>
    </div>
  );
}
