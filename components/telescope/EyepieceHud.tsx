"use client";
import { motion } from "framer-motion";

interface Props {
  found: number;
  total: number;
  coarse: boolean;
}

export function EyepieceHud({ found, total, coarse }: Props) {
  return (
    <motion.div
      className="pointer-events-none absolute inset-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <p className="absolute inset-x-0 top-[clamp(18px,5vh,44px)] m-0 text-center text-[.82rem] text-frost/75">
        {coarse ? "Drag" : "Click and drag"} to sweep the sky · hold a constellation in the reticle to discover it
      </p>
      <p className="absolute inset-x-0 top-[calc(clamp(18px,5vh,44px)+26px)] m-0 text-center text-[.72rem] tracking-[.08em] text-gold/60">
        {found} of {total} discovered
      </p>
      <p className="absolute inset-x-0 bottom-[clamp(18px,5vh,40px)] m-0 text-center text-[.72rem] text-white/30">
        Arrow keys pan · Enter locks on
      </p>
    </motion.div>
  );
}
