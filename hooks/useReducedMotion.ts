"use client";
import { useEffect, useState } from "react";

/** Tracks prefers-reduced-motion, and reports coarse pointers for copy changes. */
export function useEnvironment() {
  const [reduced, setReduced] = useState(false);
  const [coarse, setCoarse] = useState(false);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pointer = window.matchMedia("(pointer: coarse)");
    const sync = () => {
      setReduced(motion.matches);
      setCoarse(pointer.matches);
    };
    sync();
    motion.addEventListener("change", sync);
    pointer.addEventListener("change", sync);
    return () => {
      motion.removeEventListener("change", sync);
      pointer.removeEventListener("change", sync);
    };
  }, []);

  return { reduced, coarse };
}
