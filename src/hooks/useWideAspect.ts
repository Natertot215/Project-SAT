import { useEffect, useState } from "react";

const DEBOUNCE_MS = 120;

function compute(threshold: number, minWidthPx: number): boolean {
  if (typeof window === "undefined") return false;
  const w = window.innerWidth;
  const h = window.innerHeight || 1;
  return w / h >= threshold && w >= minWidthPx;
}

/**
 * Reports true when the viewport is "wide enough" for a side-by-side or inline
 * layout. Aspect ratio alone misjudges narrow 16:9 windows (e.g. 1280×720 is
 * 1.78 but only 964px of content fits beside the 252px sidebar), so callers
 * can pass `minWidthPx` to enforce an absolute pixel floor.
 */
export default function useWideAspect(
  threshold: number = 1.8,
  minWidthPx: number = 0,
): boolean {
  const [wide, setWide] = useState<boolean>(() => compute(threshold, minWidthPx));

  useEffect(() => {
    let handle: ReturnType<typeof setTimeout> | null = null;
    const onResize = () => {
      if (handle) clearTimeout(handle);
      handle = setTimeout(() => setWide(compute(threshold, minWidthPx)), DEBOUNCE_MS);
    };
    window.addEventListener("resize", onResize);
    return () => {
      if (handle) clearTimeout(handle);
      window.removeEventListener("resize", onResize);
    };
  }, [threshold, minWidthPx]);

  return wide;
}
