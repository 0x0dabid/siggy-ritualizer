"use client";

import { Download } from "lucide-react";
import { downloadDataUrl } from "@/lib/utils";

type GeneratedPfpCardProps = {
  imageDataUrl: string;
  disabled?: boolean;
  children?: React.ReactNode;
};

export function GeneratedPfpCard({ imageDataUrl, disabled, children }: GeneratedPfpCardProps) {
  return (
    <section className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#07140d]/78 px-3 py-4 backdrop-blur-md sm:px-4 sm:py-6">
      <div className="w-full max-w-[min(42rem,calc(100dvh-8rem),calc(100vw-1.5rem))] sm:max-w-[min(42rem,calc(100dvh-9rem),calc(100vw-2rem))]">
        <div className="flex aspect-square w-full items-center justify-center rounded-lg bg-[#07140d]/30 p-1.5 shadow-[0_0_60px_rgba(25,209,132,0.32)] sm:rounded-xl sm:p-3 sm:shadow-[0_0_80px_rgba(25,209,132,0.35)]">
          <img
            src={imageDataUrl}
            alt="Generated Siggy Ritualizer PFP"
            className="block max-h-full max-w-full object-contain"
          />
        </div>

        <div className="mt-3 grid gap-2 sm:mt-4 sm:grid-cols-2 sm:gap-3">
          <button
            className="ritual-button min-h-12 w-full sm:min-h-14"
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
