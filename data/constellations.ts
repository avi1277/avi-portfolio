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
    kicker: "Whistle while you work",
    summary:
      "A Spotify miniplayer that always stays on top of your windows, featuring live synced lyrics so you never miss a bar.",
    color: palette.frost,
    position: { x: -780, y: -250 },
    tech: ["Swift", "XCode", "Spotify Web API", "OAuth 2.0 PKCE", "SwiftUI"],
    github: "https://github.com/avi1277/vinyl",
    demo: "#",
    achievements: [
      "Optimized calls to Spotify API by implementing a local timer for song progression/syncing",
      "Designed macOS friendly UI with Liquid Glass and spinning Vinyl animation",
      "Improved my friends studying workflow :) (we like to sing!)",
    ],
    gallery: ["Room view", "Queue and voting", "Now playing", "Mobile"],
    hero: { type: "video", src: "/vinyl-hero.mp4", poster: "/vinyl-hero.jpg" },
    // Groove, label, spindle hole.
    stars: [...ring(14, 124), ...ring(9, 60), ...ring(5, 21, 0.4)],
    edges: [...ringEdges(0, 14), ...ringEdges(14, 9), ...ringEdges(23, 5)],
  },
  {
    slug: "lifeguard-scheduler",
    name: "Lifeguard Scheduler",
    kicker: "Shift planning for a team of guards",
    summary:
      "Constraint-aware scheduling for a pool staff: never miss a sit, plan out your breaks.",
    color: palette.gold,
    position: { x: 700, y: -160 },
    tech: ["HTML", "GitHub Pages", "CSS", "JavaScript"],
    github: "https://avi1277.github.io/lifeguard-scheduler/",
    demo: "#",
    achievements: [
      "Ensured lifeguards were always aware of their sits",
      "Adjusted schedule easily for different employee amounts",
      "Head Guard always aware of which guards are off sit",
    ],
    gallery: ["Week grid", "Conflict resolution", "Staff profile", "Export"],
    hero: { type: "video", src: "/vinyl-hero.mp4", poster: "/vinyl-hero.png" },
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
    hero: { type: "video", src: "/vinyl-hero.mp4", poster: "/vinyl-hero.jpg" },
    stars: fivePointStar(128, 51),
    edges: ringEdges(0, 10),
  },
];

export const bySlug = (slug: string | null) =>
  slug ? constellations.find((c) => c.slug === slug) ?? null : null;
