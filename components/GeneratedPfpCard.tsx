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
    <section className="fixed inset-0 z-50 flex items-center justify-center bg-[#07140d]/78 px-4 py-6 backdrop-blur-md">
      <div className="max-h-[calc(100vh-2rem)] w-full max-w-[42rem] overflow-y-auto px-1">
        <img
          src={imageDataUrl}
          alt="Generated Siggy Ritualizer PFP"
          className="mx-auto block h-auto max-h-[calc(100vh-7.5rem)] w-full object-contain drop-shadow-[0_0_80px_rgba(25,209,132,0.35)]"
        />

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <button
            className="ritual-button-outline min-h-14 bg-white/90 text-black hover:bg-white"
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
