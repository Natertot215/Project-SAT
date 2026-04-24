import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar.jsx";
import HomeView from "./views/HomeView.jsx";
import PracticeView from "./views/PracticeView.jsx";
import TestView from "./views/TestView.jsx";
import HistoryView from "./views/HistoryView.jsx";
import SessionView from "./views/session/SessionView.jsx";
import { C, ff } from "./styles/theme.js";
import * as storage from "./lib/storage.js";

export default function App() {
  const [view, setView] = useState("home");
  const [sessionInit, setSessionInit] = useState(null);
  const [history, setHistory] = useState(() => storage.get("history", []));
  const [savedSession, setSavedSession] = useState(() => storage.get("savedSession", null));

  useEffect(() => { storage.set("history", history); }, [history]);
  useEffect(() => { storage.set("savedSession", savedSession); }, [savedSession]);

  const startSession = (type, n, skills) => {
    setSessionInit({ type, n, skills });
    setSavedSession(null);
    setView("session");
  };

  const resumeSession = () => {
    setSessionInit({ resume: savedSession });
    setView("session");
  };

  const handleSaveAndExit = (sessionState) => {
    setSavedSession(sessionState);
    setSessionInit(null);
    setView("home");
  };

  const handleSubmitTest = (entry) => {
    setHistory(p => [entry, ...p]);
    setSavedSession(null);
  };

  const deleteSession = (id) => setHistory(p => p.filter(h => h.id !== id));

  const handleSidebarNav = (id) => setView(id === "overview" ? "home" : id);
  const sidebarActive = view === "home" ? "overview" : view;

  if (view === "session" && sessionInit) {
    return (
      <SessionView
        init={sessionInit}
        onHome={() => { setSessionInit(null); setView("home"); }}
        onSaveAndExit={handleSaveAndExit}
        onSubmitTest={handleSubmitTest}
      />
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: C.bg, fontFamily: ff, color: C.tx }}>
      <Sidebar
        active={sidebarActive}
        onNavigate={handleSidebarNav}
        savedSession={savedSession}
        onResume={resumeSession}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        {view === "home"     && <HomeView />}
        {view === "practice" && <PracticeView onStart={startSession} />}
        {view === "test"     && <TestView onStart={startSession} />}
        {view === "history"  && <HistoryView history={history} onDelete={deleteSession} />}
      </div>
    </div>
  );
}
