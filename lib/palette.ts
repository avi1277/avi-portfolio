export const palette = {
  navy: "#081229",
  midnight: "#102B52",
  sky: "#64B5FF",
  frost: "#9AD8FF",
  white: "#FFFFFF",
  gold: "#FFE9A6",
} as const;

/** Stops for the sky wash: dark, with a little more life toward the top-left. */
export const skyGradient = ["#0b1a3a", "#0c1f3f", palette.navy] as const;
