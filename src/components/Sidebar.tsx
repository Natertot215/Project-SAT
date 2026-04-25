import type { PersistedSession } from "../types";

const NAV = [
  { id: "overview", label: "Overview" },
  { id: "practice", label: "Practice" },
  { id: "test", label: "Test" },
  { id: "history", label: "History" },
] as const;

interface SidebarProps {
  active: string;
  onNavigate: (id: string) => void;
  savedSession: PersistedSession | null;
  onResume: () => void;
}

export default function Sidebar({ active, onNavigate, savedSession, onResume }: SidebarProps) {
  return (
    <div className="w-[var(--scale-sidebar-w)] flex-shrink-0 border-r border-bdr flex flex-col py-[var(--scale-sidebar-py)] sticky top-0 h-screen">
      <div className="px-[var(--scale-sidebar-brand-px)] pb-[var(--scale-sidebar-brand-pb)]">
        <div className="text-[length:var(--scale-sidebar-brand-text)] font-bold tracking-[-.01em] text-tx">
          Modulaire
        </div>
      </div>

      <nav className="flex flex-col gap-0.5 px-[var(--scale-sidebar-nav-px)]">
        {NAV.map(({ id, label }) => {
          const sel = id === active;
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              aria-current={sel ? "page" : undefined}
              className={`w-full text-left px-[var(--scale-sidebar-navbtn-px)] py-[var(--scale-sidebar-navbtn-py)] rounded-[7px] text-[length:var(--scale-sidebar-navbtn-text)] border transition-[background,color,border-color] duration-100 ${
                sel
                  ? "border-tx2 bg-sf2 text-tx font-semibold"
                  : "border-bdr bg-transparent text-tx2 font-normal hover:text-tx"
              }`}
            >
              {label}
            </button>
          );
        })}
      </nav>

      {savedSession && (
        <div className="mt-auto px-2.5">
          <button
            onClick={onResume}
            className="w-full text-left px-[14px] py-3 rounded-[7px] bg-sf border border-bdr text-[13px] cursor-pointer transition-all duration-[120ms] hover:bg-sf2 hover:border-bdr2 hover:scale-[1.02]"
          >
            <div className="text-xs text-tx3 mb-1">In Progress</div>
            <div className="font-semibold text-tx2">Resume Session →</div>
          </button>
        </div>
      )}
    </div>
  );
}
