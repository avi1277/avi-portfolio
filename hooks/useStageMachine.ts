"use client";
import { useCallback, useEffect, useState } from "react";
import { APPROACH, EXPAND, RETURN, ZOOM } from "@/lib/constants";
import type { SceneRefs, Stage } from "@/types";

/** Stages that advance on their own after a fixed cinematic beat. */
const AUTO: Partial<Record<Stage, { next: Stage; ms: number }>> = {
  approach: { next: "eyepiece", ms: APPROACH },
  expand: { next: "explorer", ms: EXPAND },
  zoom: { next: "project", ms: ZOOM },
  returning: { next: "explorer", ms: RETURN },
};

export function useStageMachine(refs: SceneRefs) {
  const [stage, setStage] = useState<Stage>("landing");

  /** Reduced motion keeps the sequence, just compresses it. */
  const duration = useCallback(
    (ms: number) => (refs.reduced.current ? Math.min(ms, 260) : ms),
    [refs],
  );

  useEffect(() => {
    refs.stage.current = stage;
    refs.stageStart.current = performance.now();
    const auto = AUTO[stage];
    if (!auto) return;
    const t = window.setTimeout(() => setStage(auto.next), duration(auto.ms));
    return () => window.clearTimeout(t);
  }, [stage, refs, duration]);

  return { stage, setStage, duration };
}
