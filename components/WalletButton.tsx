"use client";

import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { truncateAddress } from "@/lib/utils";

export function WalletButton() {
  const { address, isConnected } = useAccount();
  const { connectAsync, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [error, setError] = useState<string | null>(null);

  async function handleConnect() {
    setError(null);

    try {
      if (typeof window !== "undefined" && window.ethereum) {
        await window.ethereum.request({ method: "eth_requestAccounts" });
      }

      const connector =
        connectors.find((item) => item.name.toLowerCase().includes("metamask")) ??
        connectors.find((item) => item.id.toLowerCase().includes("injected")) ??
        connectors[0];

      if (connector) {
        await connectAsync({ connector });
        return;
      }

      setError("MetaMask not found. Open this in a browser with MetaMask installed.");
    } catch (err) {
      const message = err instanceof Error ? err.message.toLowerCase() : "";
      if (message.includes("provider not found")) {
        setError("MetaMask not found. Open this in a browser with MetaMask installed.");
        return;
      }
      if (message.includes("rejected")) {
        setError("MetaMask connection was rejected.");
        return;
      }
      setError("MetaMask connection failed. Please try again.");
    }
  }

  if (isConnected) {
    return (
      <button className="ritual-button-outline px-4" onClick={() => disconnect()} type="button">
        <img src="/background-logo.png" alt="" className="size-7 object-contain" />
        {truncateAddress(address)}
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        className="ritual-button-outline cursor-pointer px-4"
        disabled={isPending}
        onClick={handleConnect}
        type="button"
      >
        <img src="/background-logo.png" alt="" className="size-7 object-contain" />
        {isPending ? "Connecting" : "Connect MetaMask"}
        <ChevronRight className="size-4 text-ritual-green" />
      </button>
      {error && <p className="absolute right-0 mt-2 w-64 text-right text-xs font-semibold text-red-700">{error}</p>}
    </div>
  );
}
