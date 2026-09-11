import { palette } from "@/lib/palette";
import { crossOutline, fivePointStar, ring, ringEdges } from "@/data/shapes";
import type { Constellation } from "@/types";

/**
 * The whole star map. Adding a project means appending one object here —
 * the renderer, explorer, HUD and showcase all read from this array.
 *
 * Sky-space units are roughly screen pixels at zoom 1. Keep positions inside
 * roughly ±950 x / ±520 y so every shape is reachable from the eyepiece sweep.
 */
export const constellations: Constellation[] = [
  {
    slug: "vinyl",
    name: "Vinyl",
    kicker: "Collaborative listening",
    summary:
      "A shared listening room where a group queues, votes on and reacts to records in real time — the feel of a turntable between friends, over the wire.",
    color: palette.frost,
    position: { x: -780, y: -250 },
    tech: ["Next.js", "TypeScript", "Node", "PostgreSQL", "WebSockets", "Spotify Web API"],
    github: "#",
    demo: "#",
    achievements: [
      "Sub-120ms playback sync across clients on a single WebSocket channel",
      "Optimistic queue reordering with server reconciliation, no visible snap-back",
      "Placeholder — swap in your real metric here",
    ],
    gallery: ["Room view", "Queue and voting", "Now playing", "Mobile"],
    // Groove, label, spindle hole.
    stars: [...ring(14, 124), ...ring(9, 60), ...ring(5, 21, 0.4)],
    edges: [...ringEdges(0, 14), ...ringEdges(14, 9), ...ringEdges(23, 5)],
  },
  {
    slug: "lifeguard-scheduler",
    name: "Lifeguard Scheduler",
    kicker: "Shift planning that respects certifications",
    summary:
      "Constraint-aware scheduling for a pool staff: availability, certification expiry and coverage minimums resolved into a week that actually works.",
    color: palette.gold,
    position: { x: 700, y: -160 },
    tech: ["React", "TypeScript", "Python", "FastAPI", "OR-Tools", "PostgreSQL"],
    github: "#",
    demo: "#",
    achievements: [
      "Cut weekly scheduling from roughly three hours to under five minutes",
      "Hard constraints on certification lapse — the solver cannot produce an unsafe shift",
      "Placeholder — swap in your real metric here",
    ],
    gallery: ["Week grid", "Conflict resolution", "Staff profile", "Export"],
    stars: crossOutline(42, 122),
    edges: ringEdges(0, 12),
  },
  {
    slug: "gnome-alone",
    name: "Gnome Alone",
    kicker: "A small game about a garden left unguarded",
    summary:
      "A hand-drawn defence game built around one gnome, one garden and an escalating night. Written for feel first: weight, wind-up, and a satisfying thud.",
    color: palette.sky,
    position: { x: 40, y: 460 },
    tech: ["TypeScript", "Canvas", "Howler", "Vite", "Aseprite"],
    github: "#",
    demo: "#",
    achievements: [
      "Fixed-timestep loop holding 60fps with several hundred entities",
      "Spatial hash collision pass, no per-frame allocation in the hot path",
      "Placeholder — swap in your real metric here",
    ],
    gallery: ["Title", "Wave three", "Upgrade screen", "Boss"],
    stars: fivePointStar(128, 51),
    edges: ringEdges(0, 10),
  },
];

export const bySlug = (slug: string | null) =>
  slug ? constellations.find((c) => c.slug === slug) ?? null : null;
