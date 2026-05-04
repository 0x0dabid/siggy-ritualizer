"use client";

import { AtSign, Check, ImagePlus, Loader2, UploadCloud, UserRound } from "lucide-react";
import { useRef, useState } from "react";
import { ACCEPTED_IMAGE_TYPES, MAX_UPLOAD_BYTES, fileToDataUrl } from "@/lib/utils";

type ImageUploadCardProps = {
  file: File | null;
  previewUrl: string | null;
  disabled?: boolean;
  onChange: (file: File | null, previewUrl: string | null) => void;
};

export function ImageUploadCard({ file, previewUrl, disabled, onChange }: ImageUploadCardProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [mode, setMode] = useState<"x" | "upload">("x");
  const [handle, setHandle] = useState("");
  const [isLoadingPfp, setIsLoadingPfp] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(nextFile?: File) {
    setError(null);
    if (!nextFile) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(nextFile.type)) {
      setError("Use a PNG, JPG, or WebP image.");
      return;
    }

    if (nextFile.size > MAX_UPLOAD_BYTES) {
      setError("Image is too large. Keep uploads under 8MB.");
      return;
    }

    onChange(nextFile, await fileToDataUrl(nextFile));
  }

  async function loadXProfilePicture() {
    const cleanHandle = handle.trim().replace(/^@+/, "");
    setError(null);

    if (!cleanHandle) {
      setError("Enter an X handle first.");
      return;
    }

    setIsLoadingPfp(true);
    try {
      const response = await fetch(`/api/x-avatar?handle=${encodeURIComponent(cleanHandle)}`);
      const contentType = response.headers.get("content-type")?.split(";")[0]?.trim() || "image/png";

      if (!response.ok || !contentType.startsWith("image/")) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error || "Couldn’t load this X profile picture. Try uploading manually.");
      }

      const blob = await response.blob();
      const extension = contentType.split("/")[1]?.replace("jpeg", "jpg") || "png";
      const xFile = new File([blob], `${cleanHandle}-x-pfp.${extension}`, { type: contentType });
      onChange(xFile, await fileToDataUrl(xFile));
    } catch {
      setError("Couldn’t load this X profile picture. Try uploading manually.");
    } finally {
      setIsLoadingPfp(false);
    }
  }

  const busy = disabled || isLoadingPfp;

  return (
    <section className="siggy-panel relative overflow-hidden rounded-[1.35rem] p-5 sm:p-7" aria-label="Upload image">
      <input
        ref={inputRef}
        className="sr-only"
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        disabled={busy}
        onChange={(event) => handleFile(event.target.files?.[0])}
      />
      <img src="/background-logo.png" alt="" className="pointer-events-none absolute right-8 top-7 size-24 opacity-10" />
      <div className="relative grid gap-6">
        <button
          className="relative mx-auto aspect-square w-full max-w-[18rem] overflow-hidden rounded-xl border border-emerald-100/30 bg-black/25 p-3 shadow-emerald-glow disabled:cursor-not-allowed disabled:opacity-70"
          disabled={busy}
          type="button"
          onClick={() => inputRef.current?.click()}
        >
          <div className="relative size-full overflow-hidden rounded-lg border border-ritual-bright/25 bg-parchment">
            {isLoadingPfp ? (
              <div className="flex size-full flex-col items-center justify-center gap-3 bg-parchment text-center text-ritual-green">
                <Loader2 className="size-14 animate-spin" />
                <span className="max-w-44 text-sm font-semibold text-black/55">Loading X PFP</span>
              </div>
            ) : previewUrl ? (
              <img src={previewUrl} alt="Uploaded preview" className="size-full object-cover" />
            ) : (
              <div className="flex size-full flex-col items-center justify-center gap-3 bg-parchment text-center text-ritual-green">
                <img src="/background-logo.png" alt="" className="size-20 object-contain opacity-90" />
                <UserRound className="size-10" />
                <span className="max-w-44 text-sm font-semibold text-black/55">Import or upload Image A</span>
              </div>
            )}
          </div>
          <div className="pointer-events-none absolute inset-4 rounded-lg border border-ritual-bright/20" />
          <div className="absolute -bottom-1 left-1/2 flex size-14 -translate-x-1/2 items-center justify-center rounded-full border border-emerald-200/50 bg-[#092216] shadow-emerald-glow">
            <img src="/background-logo.png" alt="" className="size-10 object-contain" />
          </div>
        </button>

        <div className="mx-auto w-full max-w-[25rem]">
          <div className="grid grid-cols-2 rounded-xl border border-white/15 bg-black/20 p-1">
            {[
              ["x", "Import from X"],
              ["upload", "Upload Image"]
            ].map(([value, label]) => (
              <button
                key={value}
                className={`min-h-11 rounded-lg text-sm font-bold transition ${mode === value ? "bg-white text-ritual-green shadow-card" : "text-white/70 hover:text-white"}`}
                disabled={busy}
                type="button"
                onClick={() => {
                  setMode(value as "x" | "upload");
                  setError(null);
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {mode === "x" ? (
            <div className="mt-5">
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.32em] text-[#f3dfaa]">
                Import X Profile
              </p>
              <div className="mt-4 flex gap-3">
                <label className="flex min-h-14 flex-1 items-center rounded-lg border border-white/80 bg-white px-4 shadow-[inset_0_0_0_2px_rgba(0,0,0,0.12)]">
                  <AtSign className="mr-2 size-5 shrink-0 text-ritual-green" />
                  <input
                    className="w-full bg-transparent text-base font-bold text-black outline-none placeholder:text-black/35"
                    disabled={busy}
                    placeholder="Enter X handle"
                    value={handle}
                    onChange={(event) => setHandle(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        void loadXProfilePicture();
                      }
                    }}
                  />
                </label>
                <button className="ritual-button min-h-14 shrink-0 px-5" disabled={busy} type="button" onClick={loadXProfilePicture}>
                  {isLoadingPfp ? <Loader2 className="size-4 animate-spin" /> : <AtSign className="size-4" />}
                  <span className="hidden sm:inline">Load PFP</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-5">
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.32em] text-[#f3dfaa]">
                Upload Image
              </p>
              <button
                className="mt-4 flex min-h-16 w-full items-center rounded-lg border border-white/80 bg-white px-4 text-left shadow-[inset_0_0_0_2px_rgba(0,0,0,0.12)] disabled:cursor-not-allowed"
                disabled={busy}
                type="button"
                onClick={() => inputRef.current?.click()}
              >
                <UploadCloud className="mr-3 size-6 shrink-0 text-ritual-green" />
                <span className="w-full truncate text-xl font-bold text-black">
                  {file ? file.name : "Choose PNG / JPG / WebP"}
                </span>
                {file ? (
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-ritual-green text-white">
                    <Check className="size-5" />
                  </span>
                ) : (
                  <ImagePlus className="size-6 shrink-0 text-ritual-green" />
                )}
              </button>
            </div>
          )}

          <p className="mt-5 max-w-sm text-lg leading-8 text-white">
            Import your X profile picture or upload the image you want Siggy to ritualize.
          </p>
          {error && <p className="mt-3 text-sm font-semibold text-red-100">{error}</p>}
        </div>
      </div>
    </section>
  );
}
