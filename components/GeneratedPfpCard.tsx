"use client";

import Image from "next/image";
import { Download } from "lucide-react";
import { downloadDataUrl } from "@/lib/utils";

type GeneratedPfpCardProps = {
  imageDataUrl: string;
  disabled?: boolean;
  children?: React.ReactNode;
};

export function GeneratedPfpCard({ imageDataUrl, disabled, children }: GeneratedPfpCardProps) {
  return (
    <section className="fixed inset-0 z-50 flex items-center justify-center bg-[#07140d]/78 px-4 py-6 backdrop-blur-md">
      <div className="siggy-panel max-h-[calc(100vh-2rem)] w-full max-w-[38rem] overflow-y-auto rounded-[1.35rem] p-3 shadow-[0_0_80px_rgba(25,209,132,0.35)] sm:p-4">
        <div className="relative aspect-square overflow-hidden rounded-xl">
          <Image src={imageDataUrl} alt="Generated Siggy Ritualizer PFP" fill className="object-contain" priority unoptimized />
        </div>

        <div className="mt-5 text-center">
          <p className="text-xl font-semibold text-white">Your Siggy Ritualizer PFP is ready.</p>
          <p className="mt-1 text-sm text-white/60">Ritual Testnet only. No real value.</p>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button
            className="ritual-button-outline min-h-14 bg-white/10 text-white hover:bg-white/15"
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
