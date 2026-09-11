"use client";
import { useEffect } from "react";
import type { RefObject } from "react";
import { constellations } from "@/data/constellations";
import { sfx } from "@/lib/audio";
import { APPROACH, DWELL_MS, EXPAND, RETURN, ZOOM } from "@/lib/constants";
import { clamp, damp, easeIn, easeInOut, easeOut, lerp, rand } from "@/lib/math";
import { palette, skyGradient } from "@/lib/palette";
import type { AmbientStar, Mote, Nebula, Point, SceneRefs } from "@/types";

interface Options {
  canvasRef: RefObject<HTMLCanvasElement>;
  rootRef: RefObject<HTMLDivElement>;
  vignetteRef: RefObject<HTMLDivElement>;
  refs: SceneRefs;
  onDiscover: (slug: string) => void;
  onHover: (slug: string | null) => void;
}

const LAYERS = [
  { par: 0.32, n: 620, r: [0.5, 1.1], a: [0.25, 0.55] },
  { par: 0.62, n: 480, r: [0.8, 1.7], a: [0.4, 0.8] },
  { par: 1.0, n: 260, r: [1.1, 2.4], a: [0.55, 1] },
] as const;

function seedWorld() {
  const stars: AmbientStar[] = [];
  for (const L of LAYERS) {
    for (let i = 0; i < L.n; i++) {
      stars.push({
        x: rand(-2600, 2600),
        y: rand(-1900, 1900),
        r: rand(L.r[0], L.r[1]),
        a: rand(L.a[0], L.a[1]),
        par: L.par,
        tw: rand(0.4, 1.6),
        ph: rand(0, Math.PI * 2),
        warm: Math.random() < 0.16,
      });
    }
  }
  const nebulae: Nebula[] = Array.from({ length: 6 }, () => ({
    x: rand(-1500, 1500),
    y: rand(-1000, 1000),
    r: rand(420, 820),
    a: rand(0.05, 0.12),
    col: Math.random() < 0.5 ? "100,181,255" : "154,216,255",
    ph: rand(0, Math.PI * 2),
  }));
  const dust: Mote[] = Array.from({ length: 54 }, () => ({
    x: Math.random(),
    y: Math.random(),
    r: rand(0.6, 2.1),
    a: rand(0.06, 0.22),
    vx: rand(-0.004, 0.004),
    vy: rand(-0.009, -0.002),
  }));
  return { stars, nebulae, dust };
}

/**
 * Single requestAnimationFrame loop owning the camera, the ambient simulation,
 * discovery state and every pixel of the sky. React state is only touched when
 * something the DOM layer cares about actually changes.
 */
export function useSkyRenderer({
  canvasRef,
  rootRef,
  vignetteRef,
  refs,
  onDiscover,
  onHover,
}: Options) {
  useEffect(() => {
    const canvas = canvasRef.current;
    const root = rootRef.current;
    if (!canvas || !root) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const seeded = seedWorld();
    refs.world.current = { ...refs.world.current, ...seeded };

    let W = 0;
    let H = 0;
    let raf = 0;
    let last = performance.now();
    let lastHole = -1;

    const resize = () => {
      const box = root.getBoundingClientRect();
      W = box.width;
      H = box.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(root);

    const frame = (now: number) => {
      const dt = Math.min(60, now - last);
      last = now;

      const stage = refs.stage.current;
      const elapsed = now - refs.stageStart.current;
      const still = refs.reduced.current;
      const ms = (v: number) => (still ? Math.min(v, 260) : v);
      const cam = refs.cam.current;
      const p = refs.pointer.current;
      const world = refs.world.current;

      const eyeR = Math.max(132, Math.min(W, H) * (refs.coarse.current ? 0.34 : 0.3));
      const maxR = Math.hypot(W, H);
      const current = constellations.find((c) => c.slug === refs.active.current) ?? null;
      const centre: Point = current ? current.position : { x: 0, y: 0 };

      /* ---------------------------------------------------- camera targets */
      let tx = 0;
      let ty = 0;
      let tz = 1;
      let hole = maxR;
      let dim = 0;
      let k = 0.1;

      switch (stage) {
        case "landing":
          tx = p.nx * 46; ty = p.ny * 34; k = 0.045;
          break;
        case "approach": {
          const t = easeIn(clamp(elapsed / ms(APPROACH), 0, 1));
          hole = lerp(maxR, eyeR, t);
          tz = lerp(1, 1.28, t);
          tx = p.nx * 46 * (1 - t); ty = p.ny * 34 * (1 - t); k = 0.35;
          break;
        }
        case "eyepiece":
          hole = eyeR; tz = 1.28;
          tx = refs.pan.current.x; ty = refs.pan.current.y; k = 0.12;
          break;
        case "expand": {
          const t = easeOut(clamp(elapsed / ms(EXPAND), 0, 1));
          hole = lerp(eyeR, maxR * 1.05, t);
          tz = lerp(1.28, 1, t);
          tx = centre.x; ty = centre.y; k = 0.14;
          break;
        }
        case "explorer":
          tx = centre.x + refs.free.current.x + (still ? 0 : p.nx * 70);
          ty = centre.y + refs.free.current.y + (still ? 0 : p.ny * 54);
          k = 0.07;
          break;
        case "zoom": {
          const t = easeInOut(clamp(elapsed / ms(ZOOM), 0, 1));
          tz = lerp(1, 1.9, t); dim = 0.6 * t;
          tx = centre.x; ty = centre.y; k = 0.3;
          break;
        }
        case "project":
          tz = 1.9; dim = 0.66;
          tx = centre.x + Math.sin(now / 7000) * 18;
          ty = centre.y + Math.cos(now / 9000) * 12;
          k = 0.04;
          break;
        case "returning": {
          const t = easeInOut(clamp(elapsed / ms(RETURN), 0, 1));
          tz = lerp(1.9, 1, t); dim = 0.66 * (1 - t);
          tx = centre.x + refs.free.current.x;
          ty = centre.y + refs.free.current.y - 120 * Math.sin(t * Math.PI);
          k = 0.3;
          break;
        }
      }

      const f = damp(k, dt);
      cam.x = lerp(cam.x, tx, f);
      cam.y = lerp(cam.y, ty, f);
      cam.zoom = lerp(cam.zoom, tz, f);
      cam.dim = lerp(cam.dim, dim, damp(0.12, dt));
      cam.hole = stage === "eyepiece" ? lerp(cam.hole, hole, damp(0.2, dt)) : hole;

      const toScreen = (wx: number, wy: number, par = 1): Point => ({
        x: W / 2 + (wx - cam.x * par) * cam.zoom,
        y: H / 2 + (wy - cam.y * par) * cam.zoom,
      });

      /* ------------------------------------------- dwell, reveal, discovery */
      for (const c of constellations) {
        const sp = toScreen(c.position.x, c.position.y);
        refs.screen.current[c.slug] = sp;
        const known = refs.found.current.has(c.slug);
        let target = 0;

        if (stage === "eyepiece") {
          const near = Math.hypot(sp.x - W / 2, sp.y - H / 2) < eyeR * 0.78;
          refs.dwell.current[c.slug] = clamp(
            refs.dwell.current[c.slug] + (near ? dt / DWELL_MS : -dt / 650),
            0,
            1,
          );
          // A full dwell only auto-enters the first time. Once a constellation
          // is known it stays highlighted and waits for a deliberate click, so
          // sweeping past an old find never yanks you out of the search.
          if (refs.dwell.current[c.slug] >= 1 && !known) onDiscover(c.slug);
          target = known ? Math.max(refs.dwell.current[c.slug], 0.22) : refs.dwell.current[c.slug];
        } else if (stage === "expand") {
          target = c.slug === refs.active.current ? 1 : 0.15;
        } else if (stage === "explorer") {
          target = refs.hovered.current === c.slug ? 1 : known ? 0.55 : 0.4;
        } else {
          target = c.slug === refs.active.current ? 1 : 0.12;
        }

        refs.reveal.current[c.slug] = lerp(refs.reveal.current[c.slug], target, damp(0.14, dt));
      }

      /* ------------------------------------------------------ explorer hover */
      if (stage === "explorer") {
        let near: string | null = null;
        let nd = Infinity;
        for (const c of constellations) {
          const sp = refs.screen.current[c.slug];
          const d = refs.coarse.current
            ? Math.hypot(sp.x - W / 2, sp.y - H / 2)
            : Math.hypot(sp.x - p.x, sp.y - p.y);
          if (d < 230 && d < nd) {
            nd = d;
            near = c.slug;
          }
        }
        if (near !== refs.hovered.current) {
          refs.hovered.current = near;
          onHover(near);
          if (near) {
            sfx.play("reveal", 0.3);
            const c = constellations.find((x) => x.slug === near)!;
            for (let i = 0; i < 18; i++) {
              const st = c.stars[Math.floor(Math.random() * c.stars.length)];
              world.sparks.push({
                x: c.position.x + st.x,
                y: c.position.y + st.y,
                vx: rand(-0.28, 0.28),
                vy: rand(-0.34, 0.1),
                life: 0,
                max: rand(700, 1500),
                col: c.color,
              });
            }
          }
        }
      } else if (refs.hovered.current) {
        refs.hovered.current = null;
        onHover(null);
      }

      /* -------------------------------------------------------- ambient sim */
      if (!still) {
        world.nextShoot -= dt;
        if (world.nextShoot <= 0) {
          world.nextShoot = rand(3800, 9000);
          const fromLeft = Math.random() < 0.5;
          world.shooting.push({
            x: fromLeft ? rand(-0.1, 0.4) * W : rand(0.6, 1.1) * W,
            y: rand(0.02, 0.5) * H,
            vx: (fromLeft ? 1 : -1) * rand(0.55, 0.95),
            vy: rand(0.18, 0.42),
            life: 0,
            max: rand(900, 1400),
          });
        }
        for (const d of world.dust) {
          d.x += d.vx * dt * 0.01;
          d.y += d.vy * dt * 0.01;
          if (d.y < -0.05) { d.y = 1.05; d.x = Math.random(); }
          if (d.x < -0.05) d.x = 1.05;
          if (d.x > 1.05) d.x = -0.05;
        }
      }
      world.shooting = world.shooting.filter((s) => {
        s.x += s.vx * dt; s.y += s.vy * dt; s.life += dt;
        return s.life < s.max;
      });
      world.sparks = world.sparks.filter((s) => {
        s.x += s.vx * dt * 0.06; s.y += s.vy * dt * 0.06; s.life += dt;
        return s.life < s.max;
      });

      /* ================================================================ paint */
      const wash = ctx.createLinearGradient(0, 0, W * 0.35, H);
      wash.addColorStop(0, skyGradient[0]);
      wash.addColorStop(0.55, skyGradient[1]);
      wash.addColorStop(1, skyGradient[2]);
      ctx.fillStyle = wash;
      ctx.fillRect(0, 0, W, H);

      for (const n of world.nebulae) {
        const drift = still ? 0 : Math.sin(now / 9000 + n.ph) * 60;
        const sp = toScreen(n.x + drift, n.y + drift * 0.4, 0.4);
        const rr = n.r * cam.zoom;
        if (sp.x < -rr || sp.x > W + rr || sp.y < -rr || sp.y > H + rr) continue;
        const g = ctx.createRadialGradient(sp.x, sp.y, 0, sp.x, sp.y, rr);
        g.addColorStop(0, `rgba(${n.col},${n.a})`);
        g.addColorStop(0.55, `rgba(${n.col},${n.a * 0.35})`);
        g.addColorStop(1, "rgba(16,43,82,0)");
        ctx.fillStyle = g;
        ctx.fillRect(sp.x - rr, sp.y - rr, rr * 2, rr * 2);
      }

      const twinkle = still ? 0 : 1;
      for (const st of world.stars) {
        const sx = W / 2 + (st.x - cam.x * st.par) * cam.zoom;
        if (sx < -6 || sx > W + 6) continue;
        const sy = H / 2 + (st.y - cam.y * st.par) * cam.zoom;
        if (sy < -6 || sy > H + 6) continue;
        const a = st.a * (1 - twinkle * 0.4 + twinkle * 0.4 * Math.sin(now * 0.001 * st.tw + st.ph));
        ctx.globalAlpha = clamp(a, 0, 1);
        ctx.fillStyle = st.warm ? palette.gold : palette.white;
        ctx.beginPath();
        ctx.arc(sx, sy, st.r * (0.8 + st.par * 0.4), 0, Math.PI * 2);
        ctx.fill();
        if (st.r > 1.9) {
          ctx.globalAlpha = clamp(a * 0.16, 0, 1);
          ctx.beginPath();
          ctx.arc(sx, sy, st.r * 4.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;

      for (const s of world.shooting) {
        const t = s.life / s.max;
        const a = Math.sin(t * Math.PI) * 0.85;
        const g = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * 150, s.y - s.vy * 150);
        g.addColorStop(0, `rgba(255,255,255,${a})`);
        g.addColorStop(1, "rgba(154,216,255,0)");
        ctx.strokeStyle = g;
        ctx.lineWidth = 1.8;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - s.vx * 150, s.y - s.vy * 150);
        ctx.stroke();
      }

      for (const c of constellations) {
        const reveal = refs.reveal.current[c.slug];
        if (reveal < 0.01) continue;
        const base = refs.screen.current[c.slug];
        const pad = 260 * cam.zoom;
        if (base.x < -pad || base.x > W + pad || base.y < -pad || base.y > H + pad) continue;

        const pts = c.stars.map((s) => ({
          x: base.x + s.x * cam.zoom,
          y: base.y + s.y * cam.zoom,
        }));

        ctx.lineCap = "round";
        for (let i = 0; i < c.edges.length; i++) {
          const portion = clamp(reveal * (c.edges.length + 2) - i, 0, 1);
          if (portion <= 0) break;
          const [a, b] = c.edges[i];
          const p0 = pts[a];
          const p1 = pts[b];
          const ex = lerp(p0.x, p1.x, portion);
          const ey = lerp(p0.y, p1.y, portion);
          ctx.strokeStyle = c.color;
          ctx.globalAlpha = 0.18 + reveal * 0.4;
          ctx.lineWidth = 3.2;
          ctx.beginPath(); ctx.moveTo(p0.x, p0.y); ctx.lineTo(ex, ey); ctx.stroke();
          ctx.globalAlpha = 0.55 + reveal * 0.45;
          ctx.lineWidth = 1.1;
          ctx.strokeStyle = palette.white;
          ctx.beginPath(); ctx.moveTo(p0.x, p0.y); ctx.lineTo(ex, ey); ctx.stroke();
        }

        pts.forEach((pt, i) => {
          const pulse = still ? 1 : 0.82 + 0.18 * Math.sin(now * 0.0026 + i * 0.9);
          const rr = (2.1 + reveal * 1.7) * pulse;
          ctx.globalAlpha = 0.1 + reveal * 0.28;
          ctx.fillStyle = c.color;
          ctx.beginPath(); ctx.arc(pt.x, pt.y, rr * 6.5, 0, Math.PI * 2); ctx.fill();
          ctx.globalAlpha = 0.35 + reveal * 0.65;
          ctx.fillStyle = palette.white;
          ctx.beginPath(); ctx.arc(pt.x, pt.y, rr, 0, Math.PI * 2); ctx.fill();
        });

        if (reveal > 0.35) {
          const la = clamp((reveal - 0.35) / 0.4, 0, 1);
          const scale = Math.min(cam.zoom, 1.3);
          ctx.textAlign = "center";
          ctx.globalAlpha = la;
          ctx.fillStyle = palette.white;
          ctx.font = `500 ${Math.round(17 * scale)}px var(--font-sans), ui-sans-serif, system-ui, sans-serif`;
          ctx.fillText(c.name, base.x, base.y + 172 * cam.zoom);
          ctx.globalAlpha = la * 0.62;
          ctx.fillStyle = palette.frost;
          ctx.font = `400 ${Math.round(12 * scale)}px var(--font-sans), ui-sans-serif, system-ui, sans-serif`;
          ctx.fillText(c.kicker, base.x, base.y + 194 * cam.zoom);
        }
        ctx.globalAlpha = 1;
      }

      for (const s of world.sparks) {
        const scr = toScreen(s.x, s.y);
        const t = s.life / s.max;
        ctx.globalAlpha = Math.sin((1 - t) * Math.PI * 0.5) * 0.9;
        ctx.fillStyle = s.col;
        ctx.beginPath();
        ctx.arc(scr.x, scr.y, 1.6 * (1 - t) + 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
      for (const d of world.dust) {
        ctx.globalAlpha = d.a;
        ctx.fillStyle = palette.frost;
        ctx.beginPath();
        ctx.arc(d.x * W, d.y * H, d.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      /* ----------------------------------------------------- telescope optics */
      if (cam.hole < maxR * 0.99) {
        const cx = W / 2;
        const cy = H / 2;
        const r = cam.hole;

        const falloff = ctx.createRadialGradient(cx, cy, r * 0.35, cx, cy, r);
        falloff.addColorStop(0, "rgba(8,18,41,0)");
        falloff.addColorStop(0.82, "rgba(8,18,41,0.18)");
        falloff.addColorStop(1, "rgba(8,18,41,0.72)");
        ctx.fillStyle = falloff;
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();

        ctx.globalAlpha = 0.5; ctx.lineWidth = 2; ctx.strokeStyle = palette.frost;
        ctx.beginPath(); ctx.arc(cx, cy, r - 1, 0, Math.PI * 2); ctx.stroke();
        ctx.globalAlpha = 0.28; ctx.strokeStyle = palette.gold;
        ctx.beginPath(); ctx.arc(cx, cy, r - 4.5, 0, Math.PI * 2); ctx.stroke();
        ctx.globalAlpha = 1;

        if (stage === "eyepiece") {
          const gap = 26;
          const arm = r * 0.62;
          ctx.strokeStyle = "rgba(154,216,255,0.4)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(cx - arm, cy); ctx.lineTo(cx - gap, cy);
          ctx.moveTo(cx + gap, cy); ctx.lineTo(cx + arm, cy);
          ctx.moveTo(cx, cy - arm); ctx.lineTo(cx, cy - gap);
          ctx.moveTo(cx, cy + gap); ctx.lineTo(cx, cy + arm);
          ctx.stroke();
          ctx.strokeStyle = "rgba(255,233,166,0.5)";
          ctx.beginPath(); ctx.arc(cx, cy, gap, 0, Math.PI * 2); ctx.stroke();

          ctx.strokeStyle = "rgba(154,216,255,0.28)";
          for (let i = 0; i < 48; i++) {
            const a = (i / 48) * Math.PI * 2;
            const len = i % 4 === 0 ? 12 : 6;
            ctx.beginPath();
            ctx.moveTo(cx + Math.cos(a) * (r - 14), cy + Math.sin(a) * (r - 14));
            ctx.lineTo(cx + Math.cos(a) * (r - 14 - len), cy + Math.sin(a) * (r - 14 - len));
            ctx.stroke();
          }

          let lead = constellations[0];
          for (const c of constellations) {
            if (refs.dwell.current[c.slug] > refs.dwell.current[lead.slug]) lead = c;
          }
          const value = refs.dwell.current[lead.slug];
          if (value > 0.02) {
            ctx.strokeStyle = lead.color;
            ctx.lineWidth = 3;
            ctx.globalAlpha = 0.85;
            ctx.beginPath();
            ctx.arc(cx, cy, gap + 10, -Math.PI / 2, -Math.PI / 2 + value * Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }
      }

      if (cam.dim > 0.005) {
        ctx.fillStyle = `rgba(8,18,41,${cam.dim})`;
        ctx.fillRect(0, 0, W, H);
      }

      /* ------------------------------------- DOM aperture driven from the loop */
      const vg = vignetteRef.current;
      if (vg) {
        const off = cam.hole >= maxR * 0.99;
        vg.style.opacity = off ? "0" : "1";
        if (!off && Math.abs(cam.hole - lastHole) > 0.6) {
          lastHole = cam.hole;
          const mask = `radial-gradient(circle at 50% 50%, transparent ${cam.hole - 2}px, #000 ${cam.hole + 26}px)`;
          vg.style.setProperty("mask-image", mask);
          vg.style.setProperty("-webkit-mask-image", mask);
        }
      }

      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [canvasRef, rootRef, vignetteRef, refs, onDiscover, onHover]);
}
