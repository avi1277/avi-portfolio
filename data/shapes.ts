import type { Edge, Point } from "@/types";

/** Evenly spaced points around a circle. */
export const ring = (count: number, radius: number, phase = 0): Point[] =>
  Array.from({ length: count }, (_, i) => {
    const a = phase + (i / count) * Math.PI * 2;
    return { x: Math.cos(a) * radius, y: Math.sin(a) * radius };
  });

/** Closed loop of edges over `count` points starting at index `start`. */
export const ringEdges = (start: number, count: number): Edge[] =>
  Array.from({ length: count }, (_, i) => [start + i, start + ((i + 1) % count)] as Edge);

/** Ten vertices alternating outer and inner radius: an unmistakable five-point star. */
export const fivePointStar = (outer: number, inner: number): Point[] => {
  const pts: Point[] = [];
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
    pts.push({ x: Math.cos(a) * outer, y: Math.sin(a) * outer });
    const b = a + Math.PI / 5;
    pts.push({ x: Math.cos(b) * inner, y: Math.sin(b) * inner });
  }
  return pts;
};

/** Twelve-point outline of a plus, traced clockwise from the top-left notch. */
export const crossOutline = (arm: number, reach: number): Point[] => [
  { x: -arm, y: -reach }, { x: arm, y: -reach }, { x: arm, y: -arm }, { x: reach, y: -arm },
  { x: reach, y: arm }, { x: arm, y: arm }, { x: arm, y: reach }, { x: -arm, y: reach },
  { x: -arm, y: arm }, { x: -reach, y: arm }, { x: -reach, y: -arm }, { x: -arm, y: -arm },
];
