import { useState } from "react";
import type { ModuleDef } from "../types";
import styles from "./ModuleDropdown.module.css";

interface ModuleDropdownProps {
  modules: ModuleDef[];
  currentMod: number;
  onSelect: (idx: number) => void;
}

export default function ModuleDropdown({ modules, currentMod, onSelect }: ModuleDropdownProps) {
  const [open, setOpen] = useState(false);
  if (modules.length <= 1) return null;
  const cur = modules[currentMod];
  return (
    <div className={styles.wrapper}>
      <button onClick={() => setOpen(!open)} className={styles.trigger}>
        {cur.label.replace("Reading & Writing", "R&W")}
        <span className={styles.caret}>{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className={styles.menu}>
          {modules.map((m, mi) => {
            const classes = [styles.item, mi === currentMod && styles.itemActive]
              .filter(Boolean)
              .join(" ");
            return (
              <button
                key={mi}
                onClick={() => { onSelect(mi); setOpen(false); }}
                className={classes}
              >
                {m.label.replace("Reading & Writing", "R&W")}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
