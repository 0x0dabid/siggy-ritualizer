"use client";

import { Share2 } from "lucide-react";

type ShareOnXButtonProps = {
  txUrl?: string;
};

export function ShareOnXButton({ txUrl }: ShareOnXButtonProps) {
  const text = `I JUST MINTED MY SIGGY VERSION OF ME (❖,❖)

TRY IT HERE https://siggy-ritualizer.vercel.app/

#RITUAL #TESTNET #SIGGYME${txUrl ? `\n\n${txUrl}` : ""}`;

  const href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;

  return (
    <a className="ritual-button min-h-12 w-full sm:min-h-14" href={href} rel="noreferrer" target="_blank">
      <Share2 className="size-4" />
      Share on X
    </a>
  );
}
