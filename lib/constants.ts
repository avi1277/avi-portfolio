/** Transition lengths in ms. Reduced motion collapses each to 260ms. */
export const APPROACH = 1750;
export const EXPAND = 1500;
export const ZOOM = 1050;
export const RETURN = 1000;

/** How far the eyepiece can sweep from the origin, in sky units. */
export const PAN_X = 980;
export const PAN_Y = 540;

/** Free-roam limits inside the explorer. */
export const ROAM_X = 1500;
export const ROAM_Y = 1000;

/** Pointer travel (px) above which a pointerup counts as a drag, not a click. */
export const DRAG_THRESHOLD = 8;

/** Dwell time needed to discover a constellation, in ms. */
export const DWELL_MS = 900;

/** Drag sensitivity: sky units per pixel of pointer travel. */
export const DRAG_GAIN_EYEPIECE = 1.7;
export const DRAG_GAIN_EXPLORER = 1.5;
