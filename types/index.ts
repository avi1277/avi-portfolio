import type { MutableRefObject } from "react";

export type Stage =
  | "landing"
  | "approach"
  | "eyepiece"
  | "expand"
  | "explorer"
  | "zoom"
  | "project"
  | "returning";

export interface Point {
  x: number;
  y: number;
}

export type Edge = [number, number];

/** One project = one constellation. Add an object, get a new star map entry. */
export interface Constellation {
  slug: string;
  name: string;
  /** One-line descriptor rendered under the constellation and above the title. */
  kicker: string;
  summary: string;
  /** Accent colour for lines, glow, sparks and showcase details. */
  color: string;
  /** Centre of the shape in sky-space units. */
  position: Point;
  /** Star offsets relative to `position`. */
  stars: Point[];
  /** Index pairs into `stars`, drawn in order when the shape traces itself. */
  edges: Edge[];
  tech: string[];
  github: string;
  demo: string;
  achievements: string[];
  gallery: string[];
}

export interface PointerState {
  x: number;
  y: number;
  nx: number;
  ny: number;
  has: boolean;
}

export interface DragState {
  on: boolean;
  px: number;
  py: number;
  /** Total pixels travelled since pointerdown — separates a click from a drag. */
  moved: number;
}

export interface CameraState {
  x: number;
  y: number;
  zoom: number;
  /** Radius of the eyepiece aperture in px. Larger than the screen = no vignette. */
  hole: number;
  dim: number;
}

export interface AmbientStar {
  x: number; y: number; r: number; a: number;
  par: number; tw: number; ph: number; warm: boolean;
}

export interface Nebula {
  x: number; y: number; r: number; a: number; col: string; ph: number;
}

export interface Mote { x: number; y: number; r: number; a: number; vx: number; vy: number }
export interface ShootingStar { x: number; y: number; vx: number; vy: number; life: number; max: number }
export interface Spark { x: number; y: number; vx: number; vy: number; life: number; max: number; col: string }

export interface World {
  stars: AmbientStar[];
  nebulae: Nebula[];
  dust: Mote[];
  shooting: ShootingStar[];
  sparks: Spark[];
  nextShoot: number;
}

/** Everything the render loop mutates without triggering a React render. */
export interface SceneRefs {
  stage: MutableRefObject<Stage>;
  stageStart: MutableRefObject<number>;
  active: MutableRefObject<string | null>;
  hovered: MutableRefObject<string | null>;
  found: MutableRefObject<Set<string>>;
  pointer: MutableRefObject<PointerState>;
  /** Eyepiece aim, clamped to the sweep limits. */
  pan: MutableRefObject<Point>;
  /** Free-roam offset used inside the explorer. */
  free: MutableRefObject<Point>;
  drag: MutableRefObject<DragState>;
  cam: MutableRefObject<CameraState>;
  reveal: MutableRefObject<Record<string, number>>;
  dwell: MutableRefObject<Record<string, number>>;
  screen: MutableRefObject<Record<string, Point>>;
  world: MutableRefObject<World>;
  coarse: MutableRefObject<boolean>;
  reduced: MutableRefObject<boolean>;
  lock: MutableRefObject<boolean>;
}
