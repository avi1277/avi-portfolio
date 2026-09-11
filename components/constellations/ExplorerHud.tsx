"use client";
import { motion } from "framer-motion";
import { constellations } from "@/data/constellations";

interface Props {
  hovered: string | null;
  found: Set<string>;
  coarse: boolean;
  onBackToEyepiece: () => void;
  onOpen: (slug: string) => void;
}

/**
 * The explorer is a dead end without a way back to the search, so the route to
 * the eyepiece lives here permanently rather than behind the Escape key.
 */
export function ExplorerHud({ hovered, found, coarse, onBackToEyepiece, onOpen }: Props) {
  const name = constellations.find((c) => c.slug === hovered)?.name;

  return (
    <motion.div
      className="pointer-events-none absolute inset-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <p className="absolute inset-x-0 top-[clamp(18px,5vh,44px)] m-0 text-center text-[.82rem] text-frost/75">
        {name
          ? `${name} — ${coarse ? "tap" : "click"} to open`
          : `Drag to roam the map · ${found.size} of ${constellations.length} discovered`}
      </p>

      <button
        type="button"
        onClick={onBackToEyepiece}
        className="pointer-events-auto absolute left-1/2 top-[calc(clamp(18px,5vh,44px)+46px)] -translate-x-1/2 rounded-full border border-gold/30 bg-midnight/50 px-5 py-[9px] text-[.78rem] text-gold backdrop-blur-md transition-colors hover:border-gold hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
      >
        Look through the telescope again
      </button>

      <nav
        aria-label="Projects"
        className="pointer-events-auto absolute inset-x-0 bottom-4 flex justify-center gap-2 opacity-30 transition-opacity focus-within:opacity-100 hover:opacity-100"
      >
        {constellations.map((c) => (
          <button
            key={c.slug}
            type="button"
            onClick={() => onOpen(c.slug)}
            className="rounded-full border border-frost/20 bg-midnight/50 px-[15px] py-[7px] text-[.74rem] text-frost transition-colors hover:border-sky hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            {found.has(c.slug) ? "✦ " : ""}
            {c.name}
          </button>
        ))}
      </nav>
    </motion.div>
  );
}
