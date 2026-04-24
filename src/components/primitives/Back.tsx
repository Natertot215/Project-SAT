import styles from "./Back.module.css";

interface BackProps {
  onClick?: () => void;
  label?: string;
}

export default function Back({ onClick, label }: BackProps) {
  return (
    <button onClick={onClick} className={styles.back}>
      ← {label || "Back"}
    </button>
  );
}
