"use client";

import { Share2 } from "lucide-react";

type ShareOnXButtonProps = {
  txUrl?: string;
};

export function ShareOnXButton({ txUrl }: ShareOnXButtonProps) {
  const text = `I just minted my Siggy Ritualizer on Ritual Testnet

AI-generated. Testnet only. No real value.

#RitualTestnet #SiggyRitualizer${txUrl ? `\n\n${txUrl}` : ""}`;

  const href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;

  return (
    <a className="ritual-button w-full" href={href} rel="noreferrer" target="_blank">
      <Share2 className="size-4" />
      Share on X
    </a>
  );
}
