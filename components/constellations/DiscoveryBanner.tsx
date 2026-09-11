"use client";
import { motion } from "framer-motion";

export function DiscoveryBanner({ name }: { name: string }) {
  return (
    <motion.div
      role="status"
      initial={{ opacity: 0, y: 18, x: "-50%" }}
      animate={{ opacity: 1, y: 0, x: "-50%" }}
      exit={{ opacity: 0, y: -10, x: "-50%" }}
      transition={{ duration: 0.6, ease: [0.2, 0.9, 0.2, 1] }}
      className="absolute bottom-[11vh] left-1/2 whitespace-nowrap rounded-full border border-frost/30 bg-midnight/60 px-[26px] py-[13px] text-[.92rem] shadow-[0_10px_44px_rgba(8,18,41,.6)] backdrop-blur-xl"
    >
      <span className="mr-2.5 text-gold">✦</span>
      {name} discovered
    </motion.div>
  );
}
