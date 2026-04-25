import { useCallback, useEffect, useState } from "react";
import useWideAspect from "../../hooks/useWideAspect";
import { buildModules } from "../../lib/modules";
import { fetchQuestions, fetchQuestionsByIds } from "../../lib/api";
import { isRWSkill } from "../../data/taxonomy";
import LoadingPhase from "./LoadingPhase";
import QuestionsPhase from "./QuestionsPhase";
import BreakPhase from "./BreakPhase";
import ResultsPhase from "./ResultsPhase";
import ReviewPhase from "./ReviewPhase";
import type {
  AnswerMap,
  CrossoutMap,
  FlagMap,
  HistoryEntry,
  Module,
  PersistedSession,
  Phase,
  Question,
  ReviewResult,
  SessionInit,
  SessionType,
  Skill,
} from "../../types";

function isResumeInit(init: SessionInit): init is { resume: PersistedSession } {
  return "resume" in init && init.resume != null;
}

interface SessionViewProps {
  init: SessionInit;
  onHome: () => void;
  onSaveAndExit: (state: PersistedSession) => void;
  onSubmit: (entry: HistoryEntry | null) => void;
}

export default function SessionView({ init, onHome, onSaveAndExit, onSubmit }: SessionViewProps) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [loadError, setLoadError] = useState<string | null>(null);

  const [sessionType, setSessionType] = useState<SessionType>("practice");
  const [modules, setModules] = useState<Module[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionSkills, setQuestionSkills] = useState<Skill[]>([]);
  const [currentMod, setCurrentMod] = useState(0);
  const [qIdx, setQIdx] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [flags, setFlags] = useState<FlagMap>({});
  const [crossouts, setCrossouts] = useState<CrossoutMap>({});
  const [highlighting, setHighlighting] = useState(false);
  const [confirmHome, setConfirmHome] = useState(false);

  // Aspect-ratio threshold: side-by-side layout when window is wider than 2.25:1.
  const wide = useWideAspect(2.25);

  // Async load on mount (or when init changes — practically once per mount).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (isResumeInit(init)) {
          const p = init.resume;
          const fetched = await fetchQuestionsByIds(p.questionIds);
          if (cancelled) return;
          setSessionType(p.sessionType);
          setModules(p.modules);
          setQuestions(fetched);
          setQuestionSkills(p.questionSkills);
          setCurrentMod(p.currentMod);
          setQIdx(p.qIdx);
          setAnswers(p.answers);
          setFlags(p.flags);
          setCrossouts(p.crossouts);
          setPhase("questions");
        } else {
          const mods = buildModules(init.type, init.n);
          const { questions: qs, questionSkills: qSkills } = await fetchQuestions({
            sessionType: init.type,
            n: init.n,
            skills: init.skills,
            difficulty: init.difficulty,
            modulesSections: mods.map((m) => ({ start: m.start, count: m.count, sec: m.sec })),
          });
          if (cancelled) return;
          setSessionType(init.type);
          setModules(mods);
          setQuestions(qs);
          setQuestionSkills(qSkills);
          setCurrentMod(0);
          setQIdx(0);
          setAnswers({});
          setFlags({});
          setCrossouts({});
          setPhase("questions");
        }
      } catch (err) {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : String(err);
        setLoadError(msg);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const answeredCount = Object.values(answers).filter((v) => v != null).length;

  const scoreSession = useCallback(
    (): ReviewResult[] =>
      questions.map((q, i) => ({
        answered: answers[i] != null,
        correct: answers[i] != null && answers[i] === q.correctIndex,
        picked: answers[i],
        correctChoice: q.correctIndex,
        skill: questionSkills[i] || q.skill || "Unknown",
        isRW: isRWSkill(questionSkills[i] || q.skill || ""),
      })),
    [answers, questions, questionSkills],
  );

  const restartModule = (mi: number) => {
    const m = modules[mi];
    const na = { ...answers };
    const nf = { ...flags };
    const nc = { ...crossouts };
    for (let i = m.start; i < m.start + m.count; i++) {
      delete na[i];
      delete nf[i];
      [0, 1, 2, 3].forEach((c) => delete nc[`${i}-${c}`]);
    }
    setAnswers(na);
    setFlags(nf);
    setCrossouts(nc);
    setCurrentMod(mi);
    setQIdx(m.start);
    setPhase("questions");
  };

  const handleSaveAndExit = () => {
    onSaveAndExit({
      sessionType,
      modules,
      questionIds: questions.map((q) => q.id),
      questionSkills,
      currentMod,
      qIdx,
      answers,
      flags,
      crossouts,
    });
  };

  const handleSubmit = () => {
    const results = scoreSession();
    let entry: HistoryEntry | null = null;
    if (sessionType === "test") {
      const correct = results.filter((r) => r.correct).length;
      const attempted = results.filter((r) => r.answered).length;
      const flaggedOnly: FlagMap = Object.entries(flags)
        .filter(([, v]) => v)
        .reduce<FlagMap>((o, [k, v]) => {
          o[Number(k)] = v;
          return o;
        }, {});
      entry = {
        id: Date.now(),
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        type: `Test — ${questions.length === 98 ? "Full" : "Half"} Length`,
        skills: [],
        correct,
        total: questions.length,
        attempted,
        breakdown: results.map((r) => r.correct),
        flagged: flaggedOnly,
        reviewData: results,
      };
    }
    onSubmit(entry);
    setPhase("results");
  };

  if (phase === "loading") {
    return <LoadingPhase error={loadError} onHome={onHome} />;
  }

  const currentQuestion = questions[qIdx];

  if (phase === "questions") {
    return (
      <QuestionsPhase
        sessionType={sessionType}
        modules={modules}
        currentMod={currentMod}
        qIdx={qIdx}
        question={currentQuestion}
        questionSkills={questionSkills}
        answers={answers}
        flags={flags}
        crossouts={crossouts}
        highlighting={highlighting}
        confirmHome={confirmHome}
        answeredCount={answeredCount}
        wide={wide}
        onConfirmHome={() => setConfirmHome(true)}
        onCancelHome={() => setConfirmHome(false)}
        onSaveAndExit={handleSaveAndExit}
        onDiscardHome={onHome}
        onSetQIdx={setQIdx}
        onSetCurrentMod={setCurrentMod}
        onToggleHighlight={() => setHighlighting((h) => !h)}
        onToggleFlag={() => setFlags((p) => ({ ...p, [qIdx]: !p[qIdx] }))}
        onSetAnswer={(ci) => setAnswers((p) => ({ ...p, [qIdx]: p[qIdx] === ci ? null : ci }))}
        onToggleCrossout={(ci) =>
          setCrossouts((p) => ({ ...p, [`${qIdx}-${ci}`]: !p[`${qIdx}-${ci}`] }))
        }
        onGoBreak={() => setPhase("break")}
      />
    );
  }

  if (phase === "break") {
    return (
      <BreakPhase
        sessionType={sessionType}
        modules={modules}
        currentMod={currentMod}
        qIdx={qIdx}
        answers={answers}
        flags={flags}
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
        sessionType={sessionType}
        results={results}
        flags={flags}
        total={questions.length}
        onHome={onHome}
        onReview={() => {
          setQIdx(0);
          setCurrentMod(0);
          setPhase("review");
        }}
      />
    );
  }

  if (phase === "review") {
    const results = scoreSession();
    return (
      <ReviewPhase
        modules={modules}
        currentMod={currentMod}
        qIdx={qIdx}
        question={currentQuestion}
        questionSkills={questionSkills}
        results={results}
        flags={flags}
        crossouts={crossouts}
        wide={wide}
        onHome={onHome}
        onSetQIdx={setQIdx}
        onSetCurrentMod={setCurrentMod}
      />
    );
  }

  return null;
}
