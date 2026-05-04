"use client";

import Image from "next/image";
import { Download, Sparkles } from "lucide-react";
import { downloadDataUrl } from "@/lib/utils";

type GeneratedPfpCardProps = {
  imageDataUrl: string;
  disabled?: boolean;
  children?: React.ReactNode;
};

export function GeneratedPfpCard({ imageDataUrl, disabled, children }: GeneratedPfpCardProps) {
  return (
    <section className="fixed inset-0 z-50 flex items-center justify-center bg-[#07140d]/78 px-4 py-6 backdrop-blur-md">
      <div className="siggy-panel max-h-[calc(100vh-3rem)] w-full max-w-[35rem] overflow-y-auto rounded-[1.35rem] p-4 shadow-[0_0_80px_rgba(25,209,132,0.35)] sm:p-6">
        <div className="relative aspect-square overflow-hidden rounded-xl border border-emerald-100/30 bg-black">
          <Image src={imageDataUrl} alt="Generated Siggy Ritualizer PFP" fill className="object-cover" priority unoptimized />
          <div className="absolute left-3 top-3 inline-flex items-center gap-2 border border-ritual-bright/40 bg-black/70 px-3 py-2 text-xs font-semibold text-ritual-bright backdrop-blur">
            <Sparkles className="size-4" />
            AI Output
          </div>
        </div>

        <div className="mt-5 text-center">
          <p className="text-xl font-semibold text-white">Your Siggy Ritualizer PFP is ready.</p>
          <p className="mt-1 text-sm text-white/60">Ritual Testnet only. No real value.</p>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button
            className="ritual-button-outline min-h-14"
            disabled={disabled}
            type="button"
            onClick={() => downloadDataUrl(imageDataUrl, "siggy-ritualizer.png")}
          >
            <Download className="size-4" />
            Download
          </button>
          {children}
        </div>
      </div>
    </section>
  );
}
