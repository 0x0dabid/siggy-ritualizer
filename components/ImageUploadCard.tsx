"use client";

import { Check, ImagePlus, UploadCloud, UserRound } from "lucide-react";
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

  return (
    <section className="siggy-panel relative overflow-hidden rounded-[1.35rem] p-5 sm:p-7" aria-label="Upload image">
      <input
        ref={inputRef}
        className="sr-only"
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        disabled={disabled}
        onChange={(event) => handleFile(event.target.files?.[0])}
      />
      <img src="/background-logo.png" alt="" className="pointer-events-none absolute right-8 top-7 size-24 opacity-10" />
      <div className="relative grid gap-6">
        <button
          className="relative mx-auto aspect-square w-full max-w-[18rem] overflow-hidden rounded-xl border border-emerald-100/30 bg-black/25 p-3 shadow-emerald-glow disabled:cursor-not-allowed disabled:opacity-70"
          disabled={disabled}
          type="button"
          onClick={() => inputRef.current?.click()}
        >
          <div className="relative size-full overflow-hidden rounded-lg border border-ritual-bright/25 bg-parchment">
            {previewUrl ? (
              <img src={previewUrl} alt="Uploaded preview" className="size-full object-cover" />
            ) : (
              <div className="flex size-full flex-col items-center justify-center gap-3 bg-parchment text-center text-ritual-green">
                <UserRound className="size-16" />
                <span className="max-w-44 text-sm font-semibold text-black/55">Upload Image A</span>
              </div>
            )}
          </div>
          <div className="pointer-events-none absolute inset-4 rounded-lg border border-ritual-bright/20" />
          <div className="absolute -bottom-1 left-1/2 flex size-14 -translate-x-1/2 items-center justify-center rounded-full border border-emerald-200/50 bg-[#092216] shadow-emerald-glow">
            <img src="/background-logo.png" alt="" className="size-10 object-contain" />
          </div>
        </button>

        <div className="mx-auto w-full max-w-[25rem]">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.32em] text-[#f3dfaa]">
            Upload Image
          </p>
          <button
            className="mt-4 flex min-h-16 w-full items-center rounded-lg border border-white/80 bg-white px-4 text-left shadow-[inset_0_0_0_2px_rgba(0,0,0,0.12)] disabled:cursor-not-allowed"
            disabled={disabled}
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

          <p className="mt-5 max-w-sm text-lg leading-8 text-white">
            Upload the profile image you want Siggy to ritualize.
          </p>
          {error && <p className="mt-3 text-sm font-semibold text-red-100">{error}</p>}
        </div>
      </div>
    </section>
  );
}
