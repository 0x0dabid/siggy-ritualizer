"use client";

import { Box, ChevronRight, Share, Sparkles, UploadCloud, WandSparkles } from "lucide-react";
import { useState } from "react";
import { GeneratedPfpCard } from "@/components/GeneratedPfpCard";
import { ImageUploadCard } from "@/components/ImageUploadCard";
import { MintPanel } from "@/components/MintPanel";
import { NFTGallery } from "@/components/NFTGallery";
import { RitualLoader } from "@/components/RitualLoader";
import { WalletButton } from "@/components/WalletButton";

export default function HomePage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setError(null);

    if (!file) {
      setError("Import an X profile picture or upload an image before generating.");
      return;
    }

    setIsGenerating(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const response = await fetch("/api/generate", {
        method: "POST",
        body: formData
      });
      const data = (await response.json()) as { imageDataUrl?: string; error?: string };
      if (!response.ok || !data.imageDataUrl) {
        throw new Error(data.error || "Generation failed. Try a different image.");
      }
      setGeneratedImage(data.imageDataUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }

  const hasResult = Boolean(generatedImage);

  return (
    <main className="siggy-shell relative min-h-screen overflow-hidden px-5 py-7 sm:px-8 lg:px-11">
      <div className="pointer-events-none absolute bottom-10 left-10 hidden h-px w-[26rem] bg-black/20 lg:block" />
      <div className="pointer-events-none absolute bottom-10 right-14 hidden h-px w-[18rem] bg-ritual-green/35 lg:block" />

      <div className="relative mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-[92rem] flex-col gap-8">
        <header className="relative z-20 flex items-center justify-between gap-4">
          <div className="inline-flex min-h-14 items-center gap-3 rounded-full border border-black/10 bg-white/72 px-5 text-sm font-semibold uppercase tracking-wide text-black/75 shadow-card backdrop-blur">
            <img src="/background-logo.png" alt="" className="size-9 object-contain" />
            Ritual Testnet
          </div>
          <div className="flex items-center gap-3">
            <NFTGallery />
            <WalletButton />
          </div>
        </header>

        <section className="grid flex-1 items-center gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(28rem,34rem)] xl:gap-8">
          <div className="flex h-full flex-col justify-center pt-2">
            <img src="/background-logo.png" alt="Siggy Ritualizer logo" className="mb-5 size-36 object-contain drop-shadow-[0_0_20px_rgba(25,209,132,0.55)] sm:size-44" />
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.18em] text-ritual-green">
              AI-native Web3 avatar mint ✣
            </p>
            <h1 className="max-w-[43rem] font-display text-[clamp(4rem,8.6vw,8.8rem)] leading-[0.82] text-black drop-shadow-[0_8px_0_rgba(0,0,0,0.08)]">
              Siggy
              <br />
              Ritualizer
            </h1>
            <div className="my-6 flex max-w-[39rem] items-center gap-4 text-black">
              <span className="h-px flex-1 bg-black/70" />
              <Sparkles className="size-7" />
              <span className="h-px flex-1 bg-black/70" />
            </div>
            <p className="mt-5 max-w-xl text-xl leading-8 text-black/72">
              Import your X PFP or upload an image. Let Siggy ritualize it into a mystical AI avatar, then mint it on Ritual Testnet.
            </p>

            <div className="mt-10 flex max-w-[42rem] overflow-hidden rounded-xl border border-black/10 bg-white/45 shadow-card backdrop-blur">
              {[
                ["Upload", UploadCloud],
                ["Generate", WandSparkles],
                ["Mint", Box],
                ["Share", Share]
              ].map(([label, Icon], index) => (
                <div
                  key={String(label)}
                  className={`flex min-h-14 flex-1 items-center justify-center gap-3 px-4 text-sm font-semibold ${index === 0 ? "bg-emerald-100 text-ritual-green shadow-emerald-glow" : "text-black/75"}`}
                >
                  <Icon className="size-5" />
                  <span className="hidden sm:inline">{String(label)}</span>
                  {index < 3 && <ChevronRight className="ml-auto hidden size-4 text-ritual-green/60 sm:block" />}
                </div>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[34rem]">
            <div className="relative space-y-5">
            {!hasResult && !isGenerating && (
              <>
                <ImageUploadCard
                  file={file}
                  previewUrl={previewUrl}
                  disabled={isGenerating}
                  onChange={(nextFile, nextPreviewUrl) => {
                    setFile(nextFile);
                    setPreviewUrl(nextPreviewUrl);
                    setGeneratedImage(null);
                    setError(null);
                  }}
                />
                <button className="ritual-button min-h-20 w-full rounded-[1.25rem] border-2 text-2xl" disabled={isGenerating || !file} type="button" onClick={generate}>
                  <Sparkles className="size-8" />
                  Generate Siggy
                </button>
                {error && (
                  <div className="rounded-xl border border-red-300/40 bg-red-950/70 px-4 py-3 text-sm font-semibold text-red-100 shadow-card" role="alert">
                    {error}
                  </div>
                )}
              </>
            )}

            {isGenerating && <RitualLoader />}

            {generatedImage && !isGenerating && (
              <GeneratedPfpCard imageDataUrl={generatedImage} disabled={isGenerating}>
                <MintPanel imageDataUrl={generatedImage} />
              </GeneratedPfpCard>
            )}
            </div>
          </div>
        </section>

        <footer className="flex items-center justify-between gap-6 pb-1 text-ritual-green">
          <div className="ml-auto inline-flex items-center gap-3 font-mono text-xs uppercase tracking-[0.24em] text-ritual-green/70">
            <img src="/background-logo.png" alt="" className="size-7 object-contain" />
            Made by 0xDabid
          </div>
        </footer>
      </div>
    </main>
  );
}
