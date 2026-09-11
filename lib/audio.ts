/**
 * Silent by default. Drop files into /public/sfx and set `sfx.enabled = true`
 * (ideally after a user gesture, so autoplay policy doesn't swallow the first cue).
 */
type Cue = "telescope" | "twinkle" | "discover" | "reveal" | "warp";

const manifest: Record<Cue, string> = {
  telescope: "/sfx/telescope-click.mp3",
  twinkle: "/sfx/star-twinkle.mp3",
  discover: "/sfx/discovery-chime.mp3",
  reveal: "/sfx/constellation-reveal.mp3",
  warp: "/sfx/warp.mp3",
};

const cache = new Map<Cue, HTMLAudioElement>();

export const sfx = {
  enabled: false,
  play(cue: Cue, volume = 0.5) {
    if (!this.enabled || typeof Audio === "undefined") return;
    let el = cache.get(cue);
    if (!el) {
      el = new Audio(manifest[cue]);
      cache.set(cue, el);
    }
    el.volume = volume;
    el.currentTime = 0;
    void el.play().catch(() => undefined);
  },
};
