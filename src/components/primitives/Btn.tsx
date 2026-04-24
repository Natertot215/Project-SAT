import type { ReactNode } from "react";
import styles from "./Btn.module.css";

interface BtnProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  small?: boolean;
  danger?: boolean;
}

export default function Btn({ children, onClick, disabled, small, danger }: BtnProps) {
  const classes = [styles.btn, small && styles.small, danger && styles.danger]
    .filter(Boolean)
    .join(" ");
  return (
    <button onClick={onClick} disabled={disabled} className={classes}>
      {children}
    </button>
  );
}
