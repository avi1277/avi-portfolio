"use client";

export function ResumeButton() {
  return (
    <a
      href="/avi-patel-resume.pdf"
      target="_blank"
      rel="noreferrer"
      className="absolute right-5 top-[18px] rounded-full border border-frost/25 bg-midnight/40 px-4 py-2 text-[.78rem] text-frost/80 backdrop-blur-md transition-colors hover:border-frost hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
    >
      Résumé
    </a>
  );
}