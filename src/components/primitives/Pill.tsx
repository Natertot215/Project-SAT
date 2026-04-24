import type { ReactNode } from "react";
import styles from "./Pill.module.css";

interface PillProps {
  active?: boolean;
  children: ReactNode;
  onClick?: () => void;
}

export default function Pill({ active, children, onClick }: PillProps) {
  const classes = [styles.pill, active && styles.active].filter(Boolean).join(" ");
  return (
    <button onClick={onClick} className={classes}>
      {children}
    </button>
  );
}
