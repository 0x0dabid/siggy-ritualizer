"use client";

import { useEffect, useState } from "react";

const LOADING_LINES = [
  "Reading image...",
  "Summoning avatar...",
  "Applying ritual energy...",
  "Rendering PFP..."
];

export function RitualLoader() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => setIndex((value) => (value + 1) % LOADING_LINES.length), 1450);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <section className="siggy-panel relative overflow-hidden rounded-[1.35rem] p-5 text-center sm:p-7" role="status" aria-live="polite">
      <div className="relative overflow-hidden rounded-xl border border-emerald-100/25 bg-black/30">
        <video
          className="aspect-square w-full object-cover"
          src="/loading.mp4"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
        />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_45%,rgba(4,14,10,0.32))]" />
      </div>
      <p className="relative mt-5 font-display text-xl text-white">{LOADING_LINES[index]}</p>
      <p className="relative mt-2 text-sm text-white/65">Ritual energy is moving through the image.</p>
    </section>
  );
}
