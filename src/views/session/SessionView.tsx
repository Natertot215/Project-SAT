import { useMemo, useState } from "react";
import useBreakpoint from "../../hooks/useBreakpoint";
import { buildModules } from "../../lib/modules";
import { assignSkills } from "../../lib/skills";
import { isRWSkill, RW_SKILLS, MATH_SKILLS } from "../../data/taxonomy";
import QuestionsPhase from "./QuestionsPhase";
import BreakPhase from "./BreakPhase";
import ResultsPhase from "./ResultsPhase";
import ReviewPhase from "./ReviewPhase";
import type {
  AnswersMap, CorrectMap, CrossoutsMap, FlagsMap, HistoryEntry,
  ModuleDef, Phase, Question, ReviewItem, SessionInit, SessionState, SessionType,
} from "../../types";

interface BuiltInitialState {
  sessionType: SessionType;
  modules: ModuleDef[];
  questions: Question[];
  questionSkills: (string | null)[];
  correctMap: CorrectMap;
  currentMod: number;
  qIdx: number;
  answers: AnswersMap;
  flags: FlagsMap;
  crossouts: CrossoutsMap;
}

function buildInitialState(init: SessionInit): BuiltInitialState {
  if ("resume" in init) {
    const s = init.resume;
    return {
      sessionType: s.sessionType, modules: s.modules, questions: s.questions,
      questionSkills: s.questionSkills, correctMap: s.correctMap,
      currentMod: s.currentMod, qIdx: s.qIdx,
      answers: s.answers, flags: s.flags, crossouts: s.crossouts,
    };
  }
  const { type, n, skills } = init;
  const mods = buildModules(type, n);
  const questions: Question[] = Array.from({ length: n }, (_, i) => ({ id: i }));
  const correctMap: CorrectMap = {};
  questions.forEach((_, i) => { correctMap[i] = Math.floor(Math.random() * 4); });
  let questionSkills: (string | null)[] = [];
  if (type === "practice" && skills) {
    questionSkills = assignSkills(skills, n);
  } else {
    questions.forEach((_, i) => {
      const m = mods.find(m => i >= m.start && i < m.start + m.count);
      questionSkills.push(m?.sec === "rw"
        ? RW_SKILLS[i % RW_SKILLS.length]
        : MATH_SKILLS[i % MATH_SKILLS.length]);
    });
  }
  return {
    sessionType: type, modules: mods, questions,
    questionSkills, correctMap,
    currentMod: 0, qIdx: 0,
    answers: {}, flags: {}, crossouts: {},
  };
}

interface SessionViewProps {
  init: SessionInit;
  onHome: () => void;
  onSaveAndExit: (state: SessionState) => void;
  onSubmitTest: (entry: HistoryEntry) => void;
}

export default function SessionView({ init, onHome, onSaveAndExit, onSubmitTest }: SessionViewProps) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const initial = useMemo(() => buildInitialState(init), []);

  const [sessionType] = useState(initial.sessionType);
  const [modules] = useState(initial.modules);
  const [questions] = useState(initial.questions);
  const [questionSkills] = useState(initial.questionSkills);
  const [correctMap] = useState(initial.correctMap);
  const [currentMod, setCurrentMod] = useState(initial.currentMod);
  const [qIdx, setQIdx] = useState(initial.qIdx);
  const [answers, setAnswers] = useState<AnswersMap>(initial.answers);
  const [flags, setFlags] = useState<FlagsMap>(initial.flags);
  const [crossouts, setCrossouts] = useState<CrossoutsMap>(initial.crossouts);
  const [highlighting, setHighlighting] = useState(false);
  const [phase, setPhase] = useState<Phase>("questions");
  const [confirmHome, setConfirmHome] = useState(false);

  const wide = useBreakpoint(1000);

  const answeredCount = Object.values(answers).filter(v => v != null).length;

  const scoreSession = (): ReviewItem[] => questions.map((_, i) => ({
    answered: answers[i] != null,
    correct: answers[i] != null && answers[i] === correctMap[i],
    picked: answers[i],
    correctChoice: correctMap[i],
    skill: questionSkills[i] || "Unknown",
    isRW: isRWSkill(questionSkills[i] || ""),
  }));

  const restartModule = (mi: number) => {
    const m = modules[mi];
    const na = { ...answers }, nf = { ...flags }, nc = { ...crossouts };
    for (let i = m.start; i < m.start + m.count; i++) {
      delete na[i]; delete nf[i];
      [0, 1, 2, 3].forEach(c => delete nc[`${i}-${c}`]);
    }
    setAnswers(na); setFlags(nf); setCrossouts(nc);
    setCurrentMod(mi); setQIdx(m.start); setPhase("questions");
  };

  const handleSaveAndExit = () => {
    onSaveAndExit({
      sessionType, modules, questions, questionSkills, correctMap,
      currentMod, qIdx, answers, flags, crossouts,
    });
  };

  const handleSubmit = () => {
    const results = scoreSession();
    if (sessionType === "test") {
      const correct = results.filter(r => r.correct).length;
      const attempted = results.filter(r => r.answered).length;
      const entry: HistoryEntry = {
        id: Date.now(),
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        type: `Test — ${questions.length === 98 ? "Full" : "Half"} Length`,
        skills: [],
        correct,
        total: questions.length,
        attempted,
        breakdown: results.map(r => r.correct),
        flagged: Object.entries(flags)
          .filter(([, v]) => v)
          .reduce<FlagsMap>((o, [k, v]) => ({ ...o, [k]: v }), {}),
        reviewData: results,
      };
      onSubmitTest(entry);
    }
    setPhase("results");
  };

  if (phase === "questions") {
    return (
      <QuestionsPhase
        sessionType={sessionType} modules={modules} currentMod={currentMod} qIdx={qIdx}
        questionSkills={questionSkills}
        answers={answers} flags={flags} crossouts={crossouts}
        highlighting={highlighting} confirmHome={confirmHome} answeredCount={answeredCount} wide={wide}
        onConfirmHome={() => setConfirmHome(true)}
        onCancelHome={() => setConfirmHome(false)}
        onSaveAndExit={handleSaveAndExit}
        onDiscardHome={onHome}
        onSetQIdx={setQIdx}
        onSetCurrentMod={setCurrentMod}
        onToggleHighlight={() => setHighlighting(h => !h)}
        onToggleFlag={() => setFlags(p => ({ ...p, [qIdx]: !p[qIdx] }))}
        onSetAnswer={(ci) => setAnswers(p => ({ ...p, [qIdx]: p[qIdx] === ci ? null : ci }))}
        onToggleCrossout={(ci) => setCrossouts(p => ({ ...p, [`${qIdx}-${ci}`]: !p[`${qIdx}-${ci}`] }))}
        onGoBreak={() => setPhase("break")}
      />
    );
  }

  if (phase === "break") {
    return (
      <BreakPhase
        sessionType={sessionType} modules={modules} currentMod={currentMod} qIdx={qIdx}
        answers={answers} flags={flags}
        onSetQIdx={setQIdx}
        onSetPhase={setPhase}
        onNextModule={() => {
          const next = currentMod + 1;
          setCurrentMod(next);
          setQIdx(modules[next].start);
          setPhase("questions");
        }}
        onSubmit={handleSubmit}
        onRestart={() => restartModule(currentMod)}
      />
    );
  }

  if (phase === "results") {
    const results = scoreSession();
    return (
      <ResultsPhase
        sessionType={sessionType} results={results} flags={flags} total={questions.length}
        onHome={onHome}
        onReview={() => { setQIdx(0); setCurrentMod(0); setPhase("review"); }}
      />
    );
  }

  if (phase === "review") {
    const results = scoreSession();
    return (
      <ReviewPhase
        sessionType={sessionType} modules={modules} currentMod={currentMod} qIdx={qIdx}
        questionSkills={questionSkills}
        results={results} flags={flags} crossouts={crossouts} wide={wide}
        onHome={onHome}
        onSetQIdx={setQIdx}
        onSetCurrentMod={setCurrentMod}
      />
    );
  }

  return null;
}
