import type { SessionState } from "../types";
import styles from "./Sidebar.module.css";

const NAV = [
  { id: "overview", label: "Overview" },
  { id: "practice", label: "Practice" },
  { id: "test",     label: "Test"     },
  { id: "history",  label: "History"  },
] as const;

type NavId = (typeof NAV)[number]["id"];

interface SidebarProps {
  active: NavId | string;
  onNavigate: (id: NavId) => void;
  savedSession: SessionState | null;
  onResume: () => void;
}

export default function Sidebar({ active, onNavigate, savedSession, onResume }: SidebarProps) {
  return (
    <div className={styles.sidebar}>
      <div className={styles.brand}>
        <div className={styles.brandText}>SAT Prep</div>
      </div>

      <nav className={styles.nav}>
        {NAV.map(({ id, label }) => {
          const sel = id === active;
          const classes = [styles.navItem, sel && styles.navItemActive].filter(Boolean).join(" ");
          return (
            <button key={id} onClick={() => onNavigate(id)} className={classes}>
              {label}
            </button>
          );
        })}
      </nav>

      {savedSession && (
        <div className={styles.resumeSlot}>
          <button onClick={onResume} className={styles.resumeBtn}>
            <div className={styles.resumeLabel}>In Progress</div>
            <div className={styles.resumeTitle}>Resume Session →</div>
          </button>
        </div>
      )}
    </div>
  );
}
