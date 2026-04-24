import type { ReactNode } from "react";
import styles from "./Shell.module.css";

interface ShellProps {
  children: ReactNode;
  wide?: boolean;
}

export default function Shell({ children, wide }: ShellProps) {
  const classes = [styles.shell, wide && styles.wide].filter(Boolean).join(" ");
  return <div className={classes}>{children}</div>;
}
