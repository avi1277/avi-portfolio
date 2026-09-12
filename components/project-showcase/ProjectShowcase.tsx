"use client";
import { motion } from "framer-motion";
import type { Constellation } from "@/types";

interface Props {
  project: Constellation;
  reduced: boolean;
  onReturn: () => void;
}

/** Modular, data-driven. Every section reads from the constellation object. */
export function ProjectShowcase({ project, reduced, onReturn }: Props) {
  const t = reduced ? { duration: 0.2 } : { duration: 0.7, ease: [0.2, 0.8, 0.2, 1] as const };

  return (
    <motion.div
      className="absolute inset-0 overflow-y-auto overflow-x-hidden [touch-action:pan-y]"
      initial={{ opacity: 0, y: 26 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 46 }}
      transition={t}
    >
      <article className="mx-auto max-w-[900px] px-[clamp(20px,5vw,48px)] pt-[clamp(56px,11vh,120px)]">
        <header>
          <span className="text-[.8rem]" style={{ color: project.color }}>
            ✦ {project.kicker}
          </span>
          <h2 className="mt-3 bg-gradient-to-b from-white to-frost bg-clip-text text-[clamp(2.3rem,7vw,4.2rem)] font-light leading-[1.02] tracking-[-.03em] text-transparent">
            {project.name}
          </h2>
          <p className="mt-[18px] max-w-[62ch] text-[clamp(.98rem,2.3vw,1.14rem)] leading-relaxed text-white/70">
            {project.summary}
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href={project.github}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-gradient-to-br from-gold to-frost px-[22px] py-3 text-[.88rem] text-navy shadow-[0_8px_26px_rgba(100,181,255,.28)] transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              View
            </a>
          </div>

          <ul className="mt-[26px] flex list-none flex-wrap gap-2 p-0">
            {project.tech.map((tech) => (
              <li
                key={tech}
                className="rounded-full border border-sky/20 bg-midnight/55 px-[13px] py-1.5 text-[.74rem] text-frost/85"
              >
                {tech}
              </li>
            ))}
          </ul>
        </header>

        <div
          className="mt-11 aspect-[16/9] overflow-hidden rounded-[26px] border bg-navy/50"
          style={{ borderColor: `${project.color}44` }}
        >
          {project.hero.type === "video" ? (
            <video
              src={project.hero.src}
              poster={project.hero.poster}
              autoPlay={!reduced}
              muted
              loop
              playsInline
              controls={reduced}
              className="h-full w-full object-cover"
            />
          ) : project.hero.type === "youtube" ? (
            <iframe
              src={project.hero.src}
              title={`${project.name} demo`}
              allow="accelerometer; clipboard-write; encrypted-media; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            />
          ) : (
            <img src={project.hero.src} alt={`${project.name} interface`} className="h-full w-full object-cover" />
          )}
        </div>

        <section className="mt-[54px]">
          <h3 className="mb-3.5 text-[1.06rem] font-medium">Key achievements</h3>
          <ul className="m-0 grid list-none gap-3 p-0">
            {project.achievements.map((a) => (
              <li
                key={a}
                className="flex gap-3 rounded-2xl border border-sky/10 bg-midnight/40 px-[18px] py-[15px] text-[.95rem] leading-relaxed text-white/70"
              >
                <span style={{ color: project.color }}>✦</span>
                {a}
              </li>
            ))}
          </ul>
        </section>

        <div className="h-32" />
      </article>

      <button
        type="button"
        onClick={onReturn}
        className="fixed bottom-[clamp(16px,4vh,34px)] right-[clamp(16px,4vw,34px)] inline-flex items-center gap-2.5 rounded-full bg-gradient-to-br from-gold to-frost px-[22px] py-3.5 text-[.86rem] text-navy shadow-[0_12px_38px_rgba(8,18,41,.55)] transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_46px_rgba(100,181,255,.35)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        <span>↑</span> Back to the star map
      </button>
    </motion.div>
  );
}
