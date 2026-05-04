"use client";

import { Loader2, Share2 } from "lucide-react";
import { useState } from "react";

type ShareOnXButtonProps = {
  sourceImageDataUrl: string;
  generatedImageDataUrl: string;
  txUrl?: string;
};

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function drawCover(ctx: CanvasRenderingContext2D, image: HTMLImageElement, x: number, y: number, width: number, height: number) {
  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
  const sourceWidth = width / scale;
  const sourceHeight = height / scale;
  const sourceX = (image.naturalWidth - sourceWidth) / 2;
  const sourceY = (image.naturalHeight - sourceHeight) / 2;
  ctx.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height);
}

async function createShareTemplate(sourceImageDataUrl: string, generatedImageDataUrl: string) {
  const [sourceImage, generatedImage] = await Promise.all([
    loadImage(sourceImageDataUrl),
    loadImage(generatedImageDataUrl)
  ]);

  const canvas = document.createElement("canvas");
  canvas.width = 1600;
  canvas.height = 900;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not create share image.");

  ctx.fillStyle = "#F5F0E8";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const gradient = ctx.createRadialGradient(1170, 430, 80, 1170, 430, 740);
  gradient.addColorStop(0, "rgba(25, 209, 132, 0.32)");
  gradient.addColorStop(1, "rgba(25, 209, 132, 0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#0b0d0b";
  ctx.font = "800 54px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("ME", 425, 86);
  ctx.fillText("VS", 800, 86);
  ctx.fillText("SIGGY ME", 1175, 86);

  const panelY = 126;
  const panelSize = 700;
  const leftX = 80;
  const rightX = 820;

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(leftX, panelY, panelSize, panelSize, 24);
  ctx.clip();
  drawCover(ctx, sourceImage, leftX, panelY, panelSize, panelSize);
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(rightX, panelY, panelSize, panelSize, 24);
  ctx.clip();
  drawCover(ctx, generatedImage, rightX, panelY, panelSize, panelSize);
  ctx.restore();

  ctx.strokeStyle = "#2F795A";
  ctx.lineWidth = 8;
  for (const x of [leftX, rightX]) {
    ctx.beginPath();
    ctx.roundRect(x, panelY, panelSize, panelSize, 24);
    ctx.stroke();
  }

  ctx.fillStyle = "#2F795A";
  ctx.font = "700 28px Arial, sans-serif";
  ctx.fillText("SIGGY RITUALIZER", 800, 868);

  return new Promise<File>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Could not export share image."));
        return;
      }
      resolve(new File([blob], "siggy-me-vs-siggy-me.png", { type: "image/png" }));
    }, "image/png");
  });
}

export function ShareOnXButton({ sourceImageDataUrl, generatedImageDataUrl, txUrl }: ShareOnXButtonProps) {
  const [isPreparing, setIsPreparing] = useState(false);
  const text = `ME VS SIGGY ME

I just minted my Siggy Ritualizer on Ritual Testnet

AI-generated. Testnet only. No real value.

#RitualTestnet #SiggyRitualizer${txUrl ? `\n\n${txUrl}` : ""}`;

  async function share() {
    setIsPreparing(true);
    try {
      const file = await createShareTemplate(sourceImageDataUrl, generatedImageDataUrl);

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          text,
          title: "ME VS SIGGY ME"
        });
        return;
      }

      const url = URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.name;
      link.click();
      URL.revokeObjectURL(url);
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank", "noreferrer");
    } finally {
      setIsPreparing(false);
    }
  }

  return (
    <button className="ritual-button w-full" disabled={isPreparing} type="button" onClick={share}>
      {isPreparing ? <Loader2 className="size-4 animate-spin" /> : <Share2 className="size-4" />}
      Share on X
    </button>
  );
}
