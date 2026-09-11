"use client";

export function Wordmark({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute left-5 top-[18px] rounded-lg px-2 py-1.5 text-[.82rem] tracking-[.04em] text-white/40 transition-colors hover:text-frost focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
    >
      Avi Patel
    </button>
  );
}
