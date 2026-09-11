"use client";
import { useRef, useState } from "react";
import { motion, useAnimationFrame, useMotionValueEvent, useSpring } from "framer-motion";
import { clamp } from "@/lib/math";
import type { PointerState } from "@/types";
import type { MutableRefObject } from "react";

interface Props {
  pointer: MutableRefObject<PointerState>;
  reduced: boolean;
  coarse: boolean;
  onEnter: () => void;
}

/**
 * The gateway, not a button. The tube leans toward the pointer on a spring,
 * the lens warms up, and the platform drifts. Clicking starts the flight.
 */
export function Telescope({ pointer, reduced, coarse, onEnter }: Props) {
  const [hot, setHot] = useState(false);
  const tiltRef = useRef<SVGGElement>(null);
  const tilt = useSpring(0, { stiffness: 55, damping: 15, mass: 0.6 });

  useAnimationFrame((t) => {
    const lean = clamp(pointer.current.nx * 17, -17, 17);
    tilt.set(reduced ? 0 : lean + Math.sin(t / 2600) * 1.6);
  });

  useMotionValueEvent(tilt, "change", (v) => {
    tiltRef.current?.setAttribute("transform", `rotate(${v.toFixed(2)} 180 198)`);
  });

  const warm = hot ? 1 : 0;

  return (
    <div
      className="relative flex flex-col items-center"
      onMouseEnter={() => setHot(true)}
      onMouseLeave={() => setHot(false)}
    >
      <motion.button
        type="button"
        onClick={onEnter}
        onFocus={() => setHot(true)}
        onBlur={() => setHot(false)}
        aria-label="Look through the telescope and start exploring projects"
        className="rounded-[28px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-gold"
        animate={reduced ? {} : { y: [0, -14, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        whileTap={{ scale: 0.97 }}
      >
        <svg viewBox="0 0 360 320" className="w-[min(78vw,380px)] h-auto" aria-hidden="true">
          <defs>
            <linearGradient id="tube" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#9AD8FF" />
              <stop offset="55%" stopColor="#64B5FF" />
              <stop offset="100%" stopColor="#2f6fb8" />
            </linearGradient>
            <linearGradient id="isle" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1b4278" />
              <stop offset="100%" stopColor="#0a1730" />
            </linearGradient>
            <radialGradient id="lensGlow">
              <stop offset="0%" stopColor="#FFE9A6" stopOpacity="0.95" />
              <stop offset="45%" stopColor="#9AD8FF" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#64B5FF" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="isleTop">
              <stop offset="0%" stopColor="#64B5FF" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#64B5FF" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* floating platform */}
          <ellipse cx="180" cy="252" rx="104" ry="30" fill="#64B5FF"
            opacity={hot ? 0.16 : 0.09} className="transition-opacity duration-500" />
          <path d="M86 244 Q180 214 274 244 Q252 292 180 302 Q108 292 86 244 Z" fill="url(#isle)" />
          <ellipse cx="180" cy="244" rx="94" ry="20" fill="url(#isleTop)" />
          <path d="M86 244 Q180 214 274 244" fill="none" stroke="#9AD8FF"
            strokeOpacity="0.55" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="132" cy="246" r="6" fill="#0a1730" opacity=".55" />
          <circle cx="226" cy="250" r="4.5" fill="#0a1730" opacity=".5" />

          {/* tripod */}
          <g stroke="#2a5590" strokeWidth="10" strokeLinecap="round" fill="none">
            <path d="M180 198 L152 246" />
            <path d="M180 198 L210 246" />
            <path d="M180 198 L182 252" />
          </g>
          <circle cx="180" cy="198" r="13" fill="#356ba8" />
          <circle cx="176" cy="194" r="4" fill="#9AD8FF" opacity=".7" />

          {/* tube — leans toward the pointer */}
          <g ref={tiltRef} transform="rotate(0 180 198)">
            <g transform="rotate(-25 180 198)">
              <circle cx="180" cy="86" r="46" fill="url(#lensGlow)"
                opacity={0.32 + warm * 0.63} className="transition-opacity duration-500" />
              <rect x="162" y="196" width="36" height="26" rx="11" fill="#2a5590" />
              <rect x="158" y="96" width="44" height="112" rx="20" fill="url(#tube)" />
              <rect x="166" y="104" width="12" height="94" rx="6" fill="#FFFFFF" opacity=".22" />
              <rect x="152" y="132" width="56" height="13" rx="6.5" fill="#1b4278" opacity=".85" />
              <rect x="152" y="168" width="56" height="13" rx="6.5" fill="#1b4278" opacity=".85" />
              <circle cx="180" cy="90" r="30" fill="#0a1730" />
              <circle cx="180" cy="90" r="30" fill="none" stroke="#FFE9A6" strokeWidth="5"
                opacity={0.7 + warm * 0.3} className="transition-opacity duration-500" />
              <circle cx="180" cy="90" r="21" fill="#102B52" />
              <circle cx="172" cy="82" r="8" fill="#9AD8FF"
                opacity={0.4 + warm * 0.45} className="transition-opacity duration-500" />
              <circle cx="187" cy="97" r="3.5" fill="#FFE9A6"
                opacity={0.35 + warm * 0.55} className="transition-opacity duration-500" />
            </g>
          </g>

          {/* companion sparkles */}
          <g fill="#FFE9A6" className={reduced ? "" : "sparkles"}>
            <path d="M62 120 l4 10 10 4 -10 4 -4 10 -4 -10 -10 -4 10 -4z" opacity={hot ? 1 : 0.55} />
            <path d="M296 92 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3z"
              opacity={hot ? 1 : 0.45} style={{ animationDelay: ".8s" }} />
            <path d="M286 190 l2.5 7 7 2.5 -7 2.5 -2.5 7 -2.5 -7 -7 -2.5 7 -2.5z"
              opacity={hot ? 1 : 0.4} style={{ animationDelay: "1.6s" }} />
            <path d="M74 206 l2.5 7 7 2.5 -7 2.5 -2.5 7 -2.5 -7 -7 -2.5 7 -2.5z"
              opacity={hot ? 0.9 : 0.35} style={{ animationDelay: "2.2s" }} />
          </g>
        </svg>
      </motion.button>

      <motion.div
        initial={false}
        animate={{ opacity: hot || coarse ? 1 : 0, y: hot || coarse ? 0 : 10 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="pointer-events-none -mt-1.5 rounded-full bg-gradient-to-br from-gold to-frost px-[22px] py-[11px] text-[.86rem] text-navy shadow-[0_8px_30px_rgba(100,181,255,.35)]"
      >
        Look through telescope
      </motion.div>
    </div>
  );
}
