# Stellar — an observatory portfolio

Next.js App Router · TypeScript · Tailwind · Framer Motion · Canvas 2D

```bash
npm install
npm run dev
```

## The flow

`landing → approach → eyepiece → expand → explorer → zoom → project → returning → explorer`

One `requestAnimationFrame` loop owns the camera, the ambient sky and discovery
state. React only re-renders when the DOM layer needs to change, so panning and
twinkling never touch the component tree.

## Navigation

Click and hold to drag the sky, in both the eyepiece and the explorer. Arrow keys
do the same thing for keyboard users. A pointerup that travelled less than
`DRAG_THRESHOLD` pixels counts as a click, so dragging never opens a project by
accident.

Holding a constellation in the reticle fills the dwell ring and, the **first**
time, flies you into it. After that it stays lit but waits for a deliberate
click — sweeping past an old find won't pull you out of the search. Both the
explorer HUD and Escape return you to the eyepiece; the showcase returns you to
the star map.

## Adding a project

Append one object to `data/constellations.ts`:

```ts
{
  slug: "new-thing",
  name: "New Thing",
  kicker: "One line under the stars",
  summary: "...",
  color: palette.frost,
  position: { x: -300, y: 260 },   // sky units, keep inside ±950 x / ±520 y
  stars: fivePointStar(120, 48),   // or ring() / crossOutline() / hand-placed points
  edges: ringEdges(0, 10),         // index pairs, drawn in order when tracing
  tech: [], github: "#", demo: "#", achievements: [], gallery: [],
}
```

Nothing else changes. The renderer, HUD, jump nav and showcase all read the array.

## Structure

```
app/                      shell, globals, page
components/
  StellarExperience.tsx   stage machine, input wiring, layer composition
  telescope/              Telescope, LandingScene, EyepieceHud
  constellations/         ExplorerHud, DiscoveryBanner
  project-showcase/       ProjectShowcase
  ui/                     Wordmark
data/                     shapes.ts (generators), constellations.ts (the map)
hooks/
  useSceneRefs.ts         the mutable bag shared by loop and input
  useStageMachine.ts      stage + auto-advance timings
  usePointerCamera.ts     drag, keyboard pan, click-vs-drag
  useSkyRenderer.ts       the render loop
  useReducedMotion.ts     motion + pointer media queries
lib/                      palette, math, constants, audio
types/                    every shared interface
```

## Tuning

`lib/constants.ts` holds transition lengths, sweep limits, drag gain, dwell time
and the click/drag threshold. Everything you'd want to feel out is in that file.

## Sound

`lib/audio.ts` is wired and silent. Drop files into `public/sfx/` matching the
manifest and set `sfx.enabled = true` after a user gesture.

## Accessibility

Reduced motion compresses every transition to 260ms and stops drift, twinkle and
shooting stars. Keyboard: Enter opens the telescope, arrows pan, Enter locks on,
Escape steps back one level. The explorer's jump nav is a real `<nav>` of buttons
that becomes fully visible on focus. Focus rings are gold on every control.

## Still to wire up

Replace the placeholder copy, hero and gallery blocks in
`data/constellations.ts`, and swap `#` for real GitHub and demo URLs.
