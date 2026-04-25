import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import HomeView from "./views/HomeView";
import PracticeView from "./views/PracticeView";
import TestView from "./views/TestView";
import HistoryView from "./views/HistoryView";
import SessionView from "./views/session/SessionView";
import * as storage from "./lib/storage";
import type {
  DifficultyChoice,
  HistoryEntry,
  PersistedSession,
  SessionInit,
  SessionType,
  Skill,
} from "./types";

type View = "home" | "practice" | "test" | "history" | "session";

export default function App() {
  const [view, setView] = useState<View>("home");
  const [sessionInit, setSessionInit] = useState<SessionInit | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>(() =>
    storage.get<HistoryEntry[]>("history", []),
  );
  const [savedSession, setSavedSession] = useState<PersistedSession | null>(() => {
    const raw = storage.get<unknown>("savedSession", null);
    return storage.isValidPersistedSession(raw) ? raw : null;
  });

  useEffect(() => {
    storage.set("history", history);
  }, [history]);
  useEffect(() => {
    storage.set("savedSession", savedSession);
  }, [savedSession]);

  const startSession = (
    type: SessionType,
    n: number,
    skills: Skill[],
    difficulty: DifficultyChoice,
  ) => {
    setSessionInit({ type, n, skills, difficulty });
    setSavedSession(null);
    setView("session");
  };

  const resumeSession = () => {
    if (!storage.isValidPersistedSession(savedSession)) {
      setSavedSession(null);
      return;
    }
    setSessionInit({ resume: savedSession });
    setView("session");
  };

  const handleSaveAndExit = (persisted: PersistedSession) => {
    setSavedSession(persisted);
    setSessionInit(null);
    setView("home");
  };

  const handleSubmit = (entry: HistoryEntry | null) => {
    if (entry) setHistory((p) => [entry, ...p]);
    setSavedSession(null);
  };

  const deleteSession = (id: number) =>
    setHistory((p) => p.filter((h) => h.id !== id));

  const handleSidebarNav = (id: string) =>
    setView((id === "overview" ? "home" : (id as View)));
  const sidebarActive = view === "home" ? "overview" : view;

  if (view === "session" && sessionInit) {
    return (
      <SessionView
        init={sessionInit}
        onHome={() => {
          setSessionInit(null);
          setView("home");
        }}
        onSaveAndExit={handleSaveAndExit}
        onSubmit={handleSubmit}
      />
    );
  }

  return (
    <div className="flex min-h-screen bg-bg text-tx">
      <Sidebar
        active={sidebarActive}
        onNavigate={handleSidebarNav}
        savedSession={savedSession}
        onResume={resumeSession}
      />
      <div className="flex-1 min-w-0">
        {view === "home" && <HomeView />}
        {view === "practice" && <PracticeView onStart={startSession} />}
        {view === "test" && <TestView onStart={startSession} />}
        {view === "history" && (
          <HistoryView history={history} onDelete={deleteSession} />
        )}
      </div>
    </div>
  );
}
