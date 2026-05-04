"use client";

import { ExternalLink, Gem, Loader2, PartyPopper } from "lucide-react";
import { useMemo, useState } from "react";
import type { Hex } from "viem";
import { decodeEventLog } from "viem";
import {
  useAccount,
  useChainId,
  useConnect,
  usePublicClient,
  useSwitchChain,
  useWalletClient
} from "wagmi";
import { addRitualToWallet, ritualChain } from "@/lib/chains";
import { hasContractAddress, NFT_CONTRACT_ADDRESS, ritualizedPfpAbi } from "@/lib/contract";
import { explorerTxUrl, getFriendlyError } from "@/lib/utils";
import { ShareOnXButton } from "./ShareOnXButton";

type MintStatus =
  | "idle"
  | "connecting"
  | "switching"
  | "uploading"
  | "confirming"
  | "pending"
  | "success"
  | "error";

type MintPanelProps = {
  imageDataUrl: string;
};

export function MintPanel({ imageDataUrl }: MintPanelProps) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { connectors, connectAsync } = useConnect();
  const { switchChainAsync } = useSwitchChain();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const [status, setStatus] = useState<MintStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<Hex | undefined>();
  const [tokenId, setTokenId] = useState<string | null>(null);

  const label = useMemo(() => {
    if (status === "connecting") return "Connecting wallet...";
    if (status === "switching") return "Switching network...";
    if (status === "uploading") return "Uploading to IPFS...";
    if (status === "confirming") return "Confirm in MetaMask...";
    if (status === "pending") return "Waiting for confirmation...";
    if (status === "success") return "Minted on Ritual";
    return "Mint on Ritual";
  }, [status]);

  const busy = ["connecting", "switching", "uploading", "confirming", "pending"].includes(status);
  const txUrl = explorerTxUrl(txHash);

  async function ensureWallet() {
    if (!isConnected) {
      setStatus("connecting");
      const connector = connectors[0];
      if (!connector) throw new Error("MetaMask was not found. Install MetaMask to mint.");
      await connectAsync({ connector });
    }
  }

  async function ensureRitualNetwork() {
    if (chainId === ritualChain.id) return;
    setStatus("switching");
    try {
      await switchChainAsync({ chainId: ritualChain.id });
    } catch {
      await addRitualToWallet();
      await switchChainAsync({ chainId: ritualChain.id });
    }
  }

  async function uploadToIpfs() {
    setStatus("uploading");
    const nextTokenId =
      publicClient && hasContractAddress()
        ? await publicClient
            .readContract({
              address: NFT_CONTRACT_ADDRESS,
              abi: ritualizedPfpAbi,
              functionName: "nextTokenId"
            })
            .then((value) => value.toString())
            .catch(() => undefined)
        : undefined;

    const response = await fetch("/api/ipfs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageDataUrl, nextTokenId })
    });
    const data = (await response.json()) as { tokenUri?: string; error?: string };
    if (!response.ok || !data.tokenUri) {
      throw new Error(data.error || "IPFS upload failed.");
    }
    return data.tokenUri;
  }

  async function handleMint() {
    setError(null);
    setTxHash(undefined);

    try {
      if (!hasContractAddress()) {
        throw new Error("Missing contract address. Set NEXT_PUBLIC_NFT_CONTRACT_ADDRESS.");
      }

      await ensureWallet();
      await ensureRitualNetwork();

      if (!walletClient || !publicClient || !address) {
        throw new Error("Wallet is not ready yet. Try again in a moment.");
      }

      const tokenUri = await uploadToIpfs();
      setStatus("confirming");
      const hash = await walletClient.writeContract({
        address: NFT_CONTRACT_ADDRESS,
        abi: ritualizedPfpAbi,
        functionName: "mint",
        args: [tokenUri],
        account: address,
        chain: ritualChain
      });

      setTxHash(hash);
      setStatus("pending");
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      if (receipt.status !== "success") throw new Error("Mint transaction failed.");

      const mintedLog = receipt.logs
        .map((log) => {
          try {
            return decodeEventLog({
              abi: ritualizedPfpAbi,
              data: log.data,
              topics: log.topics,
              eventName: "PfpMinted"
            });
          } catch {
            return null;
          }
        })
        .find((log) => log?.eventName === "PfpMinted");

      const mintedTokenId = mintedLog?.args?.tokenId?.toString();
      setTokenId(mintedTokenId ?? null);
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(getFriendlyError(err));
    }
  }

  if (status === "success") {
    return (
      <div className="sm:col-span-2 rounded-xl border border-ritual-bright/40 bg-ritual-green/15 p-4 text-center shadow-emerald-glow">
        <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-ritual-green text-white">
          <PartyPopper className="size-6" />
        </div>
        <p className="text-xl font-bold text-white">
          Congrats{tokenId ? `, Siggy #${tokenId} is minted.` : ", your Siggy is minted."}
        </p>
        {txUrl && (
          <a className="mt-3 inline-flex items-center justify-center gap-2 text-sm font-semibold text-ritual-bright underline" href={txUrl} target="_blank" rel="noreferrer">
            View transaction
            <ExternalLink className="size-4" />
          </a>
        )}
        <div className="mt-4">
          <ShareOnXButton txUrl={txUrl} />
        </div>
      </div>
    );
  }

  return (
    <div className="contents">
      <button className="ritual-button min-h-12 w-full sm:min-h-14" disabled={busy} type="button" onClick={handleMint}>
        {busy ? <Loader2 className="size-4 animate-spin" /> : <Gem className="size-4" />}
        {label}
      </button>

      <div className="sm:col-span-2">
        <p className="text-center text-xs text-white/55">
          Need gas?{" "}
          <a className="font-semibold text-ritual-bright underline" href="https://faucet.ritualfoundation.org" target="_blank" rel="noreferrer">
            Ritual faucet
          </a>
        </p>

        {error && (
          <div className="mx-auto mt-3 max-w-md rounded-lg border border-red-300/30 bg-red-950/70 p-3 text-sm font-medium text-red-100">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
