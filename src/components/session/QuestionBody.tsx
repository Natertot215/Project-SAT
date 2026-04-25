import Btn from "../primitives/Btn";
import type { AnswerMap, CrossoutMap, Module } from "../../types";

interface QuestionBodyProps {
  wide: boolean;
  isRW: boolean;
  highlighting: boolean;
  choices: string[];
  qIdx: number;
  mod: Module;
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
  answers,
  crossouts,
  onSetAnswer,
  onToggleCrossout,
  onSetQIdx,
  onGoBreak,
}: QuestionBodyProps) {
  const modLocalIdx = qIdx - mod.start;
  const stemBlock = (
    <div className="px-5 py-4 bg-sf rounded-lg border border-bdr">
      <span className="text-tx3 text-[15px]">Question text will appear here</span>
    </div>
  );

  const passageBlock = (
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
        {isRW ? "Passage" : "Reference"}{" "}
        {isRW && highlighting && (
          <span className="text-warn font-normal">— highlighting on</span>
        )}
      </div>
      <div
        className={`min-h-[100px] text-tx2 text-[15px] leading-[1.7] p-1 ${isRW && highlighting ? "select-text" : ""}`}
      >
        {isRW
          ? "Generated passage content. Select text while the highlight tool is active to mark important sections for reference."
          : "Reference material — figures, charts, and equations will appear here when relevant."}
      </div>
    </div>
  );

  const choicesBlock = (
    <div className="flex flex-col gap-2">
      {choices.map((letter, ci) => {
        const sel = answers[qIdx] === ci;
        const crossed = crossouts[`${qIdx}-${ci}`];
        return (
          <button
            key={ci}
            onClick={() => {
              if (!crossed) onSetAnswer(ci);
            }}
            aria-pressed={sel}
            aria-label={`Choice ${letter}${sel ? " (selected)" : ""}${crossed ? " (crossed out)" : ""}`}
            className={`flex items-center gap-[14px] px-4 py-[14px] rounded-lg text-left transition-all duration-100 border ${
              sel ? "border-tx2 bg-sel-dim" : "border-bdr bg-transparent"
            } ${crossed ? "cursor-default line-through" : "cursor-pointer"} ${
              crossed && !sel ? "opacity-[.35]" : "opacity-100"
            }`}
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
            <span className={`text-[15px] flex-1 ${sel ? "text-sel" : "text-tx2"}`}>
              Answer placeholder
            </span>
            <span
              onClick={(e) => {
                e.stopPropagation();
                onToggleCrossout(ci);
              }}
              role="button"
              aria-label={crossed ? `Uncross out ${letter}` : `Cross out ${letter}`}
              className={`w-6 h-6 rounded flex items-center justify-center text-[11px] font-bold flex-shrink-0 cursor-pointer transition-all duration-[120ms] border ${
                crossed ? "border-tx3 bg-sf2 text-tx2" : "border-bdr2 bg-transparent text-tx3"
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
