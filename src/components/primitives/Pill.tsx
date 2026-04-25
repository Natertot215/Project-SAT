import type { ReactNode } from "react";

interface PillProps {
  active?: boolean;
  children: ReactNode;
  onClick?: () => void;
  fullWidth?: boolean;
  large?: boolean;
  /**
   * When true (and `large` is false), the pill renders at small density on
   * narrow viewports and scales up to the `large` density at 2xl/3xl screens.
   * Use for content pills (e.g. skill selectors) that should adapt to
   * available real estate; toolbar pills should keep their explicit size.
   */
  responsive?: boolean;
}

export default function Pill({ active, children, onClick, fullWidth, large, responsive }: PillProps) {
  // fullWidth pills sit inside fr-grid cells that may compress; use tighter
  // horizontal padding and min-w-0 + truncate so the cell can shrink without
  // the text protruding past the button border.
  const layout = fullWidth
    ? "w-full min-w-0 text-center whitespace-nowrap overflow-hidden text-ellipsis"
    : "text-left";
  const size = large
    ? `${fullWidth ? "px-3" : "px-5"} py-2 text-[13px] rounded-lg`
    : responsive
      ? `${fullWidth ? "px-[var(--scale-pill-px-narrow)]" : "px-[var(--scale-pill-px-wide)]"} py-[var(--scale-pill-py)] text-[length:var(--scale-pill-text)] rounded-[var(--scale-pill-rounded)]`
      : `${fullWidth ? "px-2" : "px-3"} py-[5px] text-xs rounded-md`;
  return (
    <button
      onClick={onClick}
      className={`${size} leading-[1.4] ${layout} cursor-pointer transition-all duration-[120ms] border hover:scale-[1.02] ${
        active
          ? "font-semibold border-tx2 bg-sel-dim text-sel hover:border-tx"
          : "font-normal border-bdr bg-transparent text-tx2 hover:border-bdr2 hover:text-tx"
      }`}
    >
      {children}
    </button>
  );
}
