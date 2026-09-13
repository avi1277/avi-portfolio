"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { DiscoveryBanner } from "@/components/constellations/DiscoveryBanner";
import { ExplorerHud } from "@/components/constellations/ExplorerHud";
import { ProjectShowcase } from "@/components/project-showcase/ProjectShowcase";
import { EyepieceHud } from "@/components/telescope/EyepieceHud";
import { LandingScene } from "@/components/telescope/LandingScene";
import { Wordmark } from "@/components/ui/Wordmark";
import { bySlug, constellations } from "@/data/constellations";
import { useEnvironment } from "@/hooks/useReducedMotion";
import { usePointerCamera } from "@/hooks/usePointerCamera";
import { useSceneRefs } from "@/hooks/useSceneRefs";
import { useSkyRenderer } from "@/hooks/useSkyRenderer";
import { useStageMachine } from "@/hooks/useStageMachine";
import { sfx } from "@/lib/audio";
import { APPROACH, PAN_X, PAN_Y } from "@/lib/constants";
import { clamp } from "@/lib/math";
import { ResumeButton } from "@/components/ui/ResumeButton";

export function StellarExperience() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const vignetteRef = useRef<HTMLDivElement>(null);

  const refs = useSceneRefs();
  const { stage, setStage, duration } = useStageMachine(refs);
  const { reduced, coarse } = useEnvironment();

  const [active, setActive] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [found, setFound] = useState<Set<string>>(new Set());
  const [banner, setBanner] = useState<string | null>(null);

  useEffect(() => { refs.reduced.current = reduced; }, [reduced, refs]);
  useEffect(() => { refs.coarse.current = coarse; }, [coarse, refs]);
  useEffect(() => { refs.active.current = active; }, [active, refs]);

  /* --------------------------------------------------------- transitions */

  /** Enter the universe on a constellation. New finds also raise the banner. */
  const enterConstellation = useCallback(
    (slug: string) => {
      if (refs.stage.current !== "eyepiece" || refs.lock.current) return;
      refs.lock.current = true;
      window.setTimeout(() => { refs.lock.current = false; }, 400);

      const isNew = !refs.found.current.has(slug);
      sfx.play(isNew ? "discover" : "warp");
      refs.dwell.current[slug] = 1;
      refs.found.current.add(slug);
      refs.free.current = { x: 0, y: 0 };
      setFound(new Set(refs.found.current));
      setActive(slug);
      refs.active.current = slug;
      setStage("expand");

      if (isNew) {
        const name = bySlug(slug)?.name ?? "";
        setBanner(name);
        window.setTimeout(() => setBanner(null), 2600);
      }
    },
    [refs, setStage],
  );

  const openProject = useCallback(
    (slug: string) => {
      sfx.play("warp");
      setActive(slug);
      refs.active.current = slug;
      setStage("zoom");
    },
    [refs, setStage],
  );

  /** Back to the search, keeping the camera roughly where it was. */
  const backToEyepiece = useCallback(() => {
    sfx.play("telescope");
    refs.pan.current = {
      x: clamp(refs.cam.current.x, -PAN_X, PAN_X),
      y: clamp(refs.cam.current.y, -PAN_Y, PAN_Y),
    };
    refs.free.current = { x: 0, y: 0 };
    setStage("eyepiece");
  }, [refs, setStage]);

  const enterTelescope = useCallback(() => {
    sfx.play("telescope");
    setStage("approach");
  }, [setStage]);

  const skipToMap = useCallback(() => {
    setActive(null);
    refs.active.current = null;
    refs.free.current = { x: 0, y: 0 };
    setStage("explorer");
  }, [refs, setStage]);

  const backToLanding = useCallback(() => {
    setActive(null);
    refs.active.current = null;
    refs.pan.current = { x: 0, y: 0 };
    refs.free.current = { x: 0, y: 0 };
    setStage("landing");
  }, [refs, setStage]);

  /* ------------------------------------------------------------- input */

  /** A pointerup that didn't travel: commit the dwell, or open what's hovered. */
  const onTap = useCallback(() => {
    const s = refs.stage.current;
    if (s === "eyepiece") {
      let best: string | null = null;
      for (const c of constellations) {
        if (refs.dwell.current[c.slug] > 0.12) {
          if (!best || refs.dwell.current[c.slug] > refs.dwell.current[best]) best = c.slug;
        }
      }
      if (best) enterConstellation(best);
    } else if (s === "explorer" && refs.hovered.current) {
      openProject(refs.hovered.current);
    }
  }, [refs, enterConstellation, openProject]);

  const handlers = usePointerCamera({ rootRef, refs, onTap });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const s = refs.stage.current;
      if (e.key === "Escape") {
        if (s === "project") setStage("returning");
        else if (s === "explorer") backToEyepiece();
        else if (s === "eyepiece") backToLanding();
        return;
      }
      if (e.key === "Enter" && s === "eyepiece") onTap();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [refs, setStage, backToEyepiece, backToLanding, onTap]);

  /* ------------------------------------------------------------ renderer */
  useSkyRenderer({
    canvasRef,
    rootRef,
    vignetteRef,
    refs,
    onDiscover: enterConstellation,
    onHover: setHovered,
  });

  /* --------------------------------------------------------------- view */
  const project = bySlug(active);
  const onLanding = stage === "landing" || stage === "approach";
  const navigating = stage === "eyepiece" || stage === "explorer";
  const showcaseOpen = stage === "project" || stage === "zoom";

  return (
    <div
      ref={rootRef}
      {...handlers}
      className={`relative h-[100dvh] w-full select-none overflow-hidden bg-navy text-white ${
        navigating ? (hovered ? "cursor-pointer" : "cursor-grab active:cursor-grabbing") : ""
      }`}
      style={{ touchAction: showcaseOpen || stage === "returning" ? "pan-y" : "none" }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 block" />

      {/* eyepiece aperture: darkens and blurs everything outside the lens */}
      <div
        ref={vignetteRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 backdrop-blur-[5px] transition-opacity duration-300"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(8,18,41,0) 40%, rgba(6,13,30,0.93) 62%)",
        }}
      />

      <AnimatePresence mode="wait">
        {onLanding && (
          <LandingScene
            key="landing"
            pointer={refs.pointer}
            approaching={stage === "approach"}
            reduced={reduced}
            coarse={coarse}
            approachMs={duration(APPROACH)}
            onEnter={enterTelescope}
            onSkip={skipToMap}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {stage === "eyepiece" && (
          <EyepieceHud key="eyepiece" found={found.size} total={constellations.length} coarse={coarse} />
        )}
        {stage === "explorer" && (
          <ExplorerHud
            key="explorer"
            hovered={hovered}
            found={found}
            coarse={coarse}
            onBackToEyepiece={backToEyepiece}
            onOpen={openProject}
          />
        )}
        {banner && <DiscoveryBanner key="banner" name={banner} />}
        {showcaseOpen && project && (
          <ProjectShowcase
            key={project.slug}
            project={project}
            reduced={reduced}
            onReturn={() => setStage("returning")}
          />
        )}
      </AnimatePresence>

      {!onLanding && <Wordmark onClick={backToLanding} />}
      <ResumeButton />
    </div>
    
  );
}
