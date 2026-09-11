"use client";
import { motion } from "framer-motion";
import { Telescope } from "@/components/telescope/Telescope";
import type { PointerState } from "@/types";
import type { MutableRefObject } from "react";

interface Props {
  pointer: MutableRefObject<PointerState>;
  approaching: boolean;
  reduced: boolean;
  coarse: boolean;
  approachMs: number;
  onEnter: () => void;
  onSkip: () => void;
}

export function LandingScene({
  pointer, approaching, reduced, coarse, approachMs, onEnter, onSkip,
}: Props) {
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-5 py-[4vh]"
      style={{ pointerEvents: approaching ? "none" : "auto" }}
    >
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 18 }}
        animate={approaching ? { opacity: 0, y: -26 } : { opacity: 1, y: 0 }}
        transition={{ duration: approaching ? 0.52 : 0.9, ease: "easeOut" }}
      >
        <h1 className="m-0 bg-gradient-to-b from-white via-frost to-sky bg-clip-text text-[clamp(2.6rem,8vw,5.1rem)] font-light leading-none tracking-[-0.03em] text-transparent">
          Avi Patel
        </h1>
        <p className="mt-3.5 text-[clamp(.85rem,2.4vw,1.02rem)] text-frost/90">
          Computer Engineering @ Brown University
        </p>
        <p className="mt-1.5 text-[clamp(.8rem,2.2vw,.95rem)] italic text-white/50">
          Explore my projects through the stars.
        </p>
      </motion.div>

      <motion.div
        className="origin-[50%_30%] will-change-transform"
        animate={approaching ? { scale: 9, opacity: 0 } : { scale: 1, opacity: 1 }}
        transition={{
          duration: approachMs / 1000,
          ease: approaching ? [0.55, 0.02, 0.78, 0.62] : "easeOut",
        }}
      >
        <Telescope pointer={pointer} reduced={reduced} coarse={coarse} onEnter={onEnter} />
      </motion.div>

      <motion.button
        type="button"
        onClick={onSkip}
        animate={{ opacity: approaching ? 0 : 1 }}
        className="mt-6 rounded text-[.74rem] text-white/30 underline underline-offset-4 transition-colors hover:text-frost/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
      >
        Skip the flight and go straight to the star map
      </motion.button>
    </div>
  );
}
