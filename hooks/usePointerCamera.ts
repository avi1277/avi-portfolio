"use client";
import { useCallback, useEffect } from "react";
import type { RefObject } from "react";
import {
  DRAG_GAIN_EXPLORER,
  DRAG_GAIN_EYEPIECE,
  DRAG_THRESHOLD,
  PAN_X,
  PAN_Y,
  ROAM_X,
  ROAM_Y,
} from "@/lib/constants";
import { clamp } from "@/lib/math";
import type { SceneRefs } from "@/types";

interface Options {
  rootRef: RefObject<HTMLDivElement>;
  refs: SceneRefs;
  /** Pointerup that did not travel far enough to count as a drag. */
  onTap: () => void;
}

/**
 * Grab-and-drag navigation. The sky moves under a held pointer in both the
 * eyepiece and the explorer, which keeps the two modes feeling like one surface
 * and avoids the "camera chases the cursor" problem where you can never rest.
 * Arrow keys mirror the same motion for keyboard users.
 */
export function usePointerCamera({ rootRef, refs, onTap }: Options) {
  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const box = rootRef.current?.getBoundingClientRect();
      if (!box) return;
      (e.target as Element).setPointerCapture?.(e.pointerId);
      refs.drag.current = {
        on: true,
        px: e.clientX - box.left,
        py: e.clientY - box.top,
        moved: 0,
      };
    },
    [refs, rootRef],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const box = rootRef.current?.getBoundingClientRect();
      if (!box) return;
      const x = e.clientX - box.left;
      const y = e.clientY - box.top;

      const p = refs.pointer.current;
      p.x = x;
      p.y = y;
      p.nx = clamp((x / box.width) * 2 - 1, -1, 1);
      p.ny = clamp((y / box.height) * 2 - 1, -1, 1);
      p.has = true;

      const drag = refs.drag.current;
      if (!drag.on) return;

      const dx = x - drag.px;
      const dy = y - drag.py;
      const stage = refs.stage.current;

      if (stage === "eyepiece") {
        const pan = refs.pan.current;
        pan.x = clamp(pan.x - dx * DRAG_GAIN_EYEPIECE, -PAN_X, PAN_X);
        pan.y = clamp(pan.y - dy * DRAG_GAIN_EYEPIECE, -PAN_Y, PAN_Y);
      } else if (stage === "explorer") {
        const free = refs.free.current;
        free.x = clamp(free.x - dx * DRAG_GAIN_EXPLORER, -ROAM_X, ROAM_X);
        free.y = clamp(free.y - dy * DRAG_GAIN_EXPLORER, -ROAM_Y, ROAM_Y);
      }

      drag.moved += Math.abs(dx) + Math.abs(dy);
      drag.px = x;
      drag.py = y;
    },
    [refs, rootRef],
  );

  const onPointerUp = useCallback(() => {
    const drag = refs.drag.current;
    const wasDrag = drag.moved > DRAG_THRESHOLD;
    drag.on = false;
    if (!wasDrag) onTap();
  }, [refs, onTap]);

  const onPointerLeave = useCallback(() => {
    refs.drag.current.on = false;
  }, [refs]);

  // Keyboard panning mirrors the drag gesture.
  useEffect(() => {
    const step = 110;
    const onKey = (e: KeyboardEvent) => {
      const stage = refs.stage.current;
      const target =
        stage === "eyepiece" ? refs.pan.current : stage === "explorer" ? refs.free.current : null;
      if (!target) return;
      const [lx, ly] = stage === "eyepiece" ? [PAN_X, PAN_Y] : [ROAM_X, ROAM_Y];
      switch (e.key) {
        case "ArrowLeft": target.x = clamp(target.x - step, -lx, lx); break;
        case "ArrowRight": target.x = clamp(target.x + step, -lx, lx); break;
        case "ArrowUp": target.y = clamp(target.y - step, -ly, ly); break;
        case "ArrowDown": target.y = clamp(target.y + step, -ly, ly); break;
        default: return;
      }
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [refs]);

  return { onPointerDown, onPointerMove, onPointerUp, onPointerLeave };
}
