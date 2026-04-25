import type { ReactNode } from "react";

interface BtnProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  small?: boolean;
  danger?: boolean;
}

export default function Btn({ children, onClick, disabled, small, danger }: BtnProps) {
  const size = small ? "px-5 py-2 text-[13px]" : "px-7 py-[11px] text-sm";
  const basePalette = danger
    ? "bg-bad-dim text-bad border border-transparent"
    : "bg-transparent text-tx2 border border-bdr";
  const hoverPalette = disabled
    ? ""
    : danger
      ? "hover:border-bad hover:scale-[1.02]"
      : "hover:bg-sel-dim hover:border-bdr2 hover:text-tx hover:scale-[1.02]";
  const palette = `${basePalette} ${hoverPalette}`;
  const state = disabled ? "opacity-40 cursor-default" : "cursor-pointer";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${size} ${palette} ${state} rounded-lg font-semibold tracking-[.01em] transition-all duration-[120ms] will-change-transform`}
    >
      {children}
    </button>
  );
}
