"use client";

import Image from "next/image";
import { Download, RefreshCcw, Sparkles } from "lucide-react";
import { downloadDataUrl } from "@/lib/utils";

type GeneratedPfpCardProps = {
  imageDataUrl: string;
  disabled?: boolean;
  onRegenerate: () => void;
  children?: React.ReactNode;
};

export function GeneratedPfpCard({ imageDataUrl, disabled, onRegenerate, children }: GeneratedPfpCardProps) {
  return (
    <section className="siggy-panel overflow-hidden rounded-[1.35rem] p-5 sm:p-7">
      <div className="relative aspect-square overflow-hidden rounded-xl border border-emerald-100/30 bg-black">
        <Image src={imageDataUrl} alt="Generated Siggy Ritualizer PFP" fill className="object-cover" priority />
        <div className="absolute left-3 top-3 inline-flex items-center gap-2 border border-ritual-bright/40 bg-black/70 px-3 py-2 text-xs font-semibold text-ritual-bright backdrop-blur">
          <Sparkles className="size-4" />
          AI Output
        </div>
      </div>

      <div className="mt-5">
        <p className="text-lg font-semibold text-white">Your Siggy Ritualizer PFP is ready.</p>
        <p className="mt-1 text-sm text-white/60">Ritual Testnet only. No real value.</p>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button className="ritual-button-outline flex-1" disabled={disabled} type="button" onClick={onRegenerate}>
          <RefreshCcw className="size-4" />
          Regenerate
        </button>
        <button
          className="ritual-button-outline flex-1"
          disabled={disabled}
          type="button"
          onClick={() => downloadDataUrl(imageDataUrl, "siggy-ritualizer.png")}
        >
          <Download className="size-4" />
          Download
        </button>
      </div>

      {children}
    </section>
  );
}
