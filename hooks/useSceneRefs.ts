"use client";
import { useRef } from "react";
import { constellations } from "@/data/constellations";
import type { SceneRefs, Stage, World } from "@/types";

const emptyWorld = (): World => ({
  stars: [],
  nebulae: [],
  dust: [],
  shooting: [],
  sparks: [],
  nextShoot: 3000,
});

const zeroed = () =>
  Object.fromEntries(constellations.map((c) => [c.slug, 0])) as Record<string, number>;

/** One bag of mutable refs shared by the render loop and the input handlers. */
export function useSceneRefs(initial: Stage = "landing"): SceneRefs {
  return {
    stage: useRef<Stage>(initial),
    stageStart: useRef(0),
    active: useRef<string | null>(null),
    hovered: useRef<string | null>(null),
    found: useRef<Set<string>>(new Set()),
    pointer: useRef({ x: 0, y: 0, nx: 0, ny: 0, has: false }),
    pan: useRef({ x: 0, y: 0 }),
    free: useRef({ x: 0, y: 0 }),
    drag: useRef({ on: false, px: 0, py: 0, moved: 0 }),
    cam: useRef({ x: 0, y: 0, zoom: 1, hole: 4000, dim: 0 }),
    reveal: useRef(zeroed()),
    dwell: useRef(zeroed()),
    screen: useRef({}),
    world: useRef(emptyWorld()),
    coarse: useRef(false),
    reduced: useRef(false),
    lock: useRef(false),
  };
}
