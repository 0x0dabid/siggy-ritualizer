"use client";

import { Images, Loader2, X } from "lucide-react";
import { useState } from "react";
import { decodeEventLog } from "viem";
import { usePublicClient } from "wagmi";
import { hasContractAddress, NFT_CONTRACT_ADDRESS, ritualizedPfpAbi } from "@/lib/contract";

type NFTItem = {
  tokenId: string;
  minter: string;
  imageUrl: string;
  name: string;
};

function ipfsToHttp(uri: string) {
  if (uri.startsWith("ipfs://")) {
    return `https://ipfs.io/ipfs/${uri.slice(7)}`;
  }
  return uri;
}

export function NFTGallery() {
  const [open, setOpen] = useState(false);
  const [nfts, setNfts] = useState<NFTItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const publicClient = usePublicClient();

  async function fetchGallery() {
    if (!publicClient || !hasContractAddress()) {
      setError("Contract not configured.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const CHUNK = 99_999n;
      const latestBlock = await publicClient.getBlockNumber();

      const rawLogs: Awaited<ReturnType<typeof publicClient.getLogs>> = [];
      for (let from = 0n; from <= latestBlock; from += CHUNK + 1n) {
        const to = from + CHUNK > latestBlock ? latestBlock : from + CHUNK;
        const chunk = await publicClient.getLogs({
          address: NFT_CONTRACT_ADDRESS,
          fromBlock: from,
          toBlock: to
        });
        rawLogs.push(...chunk);
      }

      const items = await Promise.all(
        rawLogs.map(async (log) => {
          let tokenId = "?";
          let minter = "";
          let tokenUri = "";
          try {
            const decoded = decodeEventLog({
              abi: ritualizedPfpAbi,
              data: log.data,
              topics: log.topics,
              eventName: "PfpMinted"
            });
            tokenId = decoded.args.tokenId?.toString() ?? "?";
            minter = (decoded.args.minter as string) ?? "";
            tokenUri = (decoded.args.tokenURI as string) ?? "";
          } catch {
            return null;
          }
          try {
            const res = await fetch(ipfsToHttp(tokenUri));
            const meta = (await res.json()) as { image?: string; name?: string };
            return {
              tokenId,
              minter,
              imageUrl: meta.image ? ipfsToHttp(meta.image) : "",
              name: meta.name ?? `Siggy #${tokenId}`
            };
          } catch {
            return { tokenId, minter, imageUrl: "", name: `Siggy #${tokenId}` };
          }
        })
      );

      setNfts(items.filter((item): item is NFTItem => item !== null).reverse());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load gallery.");
    } finally {
      setLoading(false);
    }
  }

  function handleOpen() {
    setOpen(true);
    fetchGallery();
  }

  return (
    <>
      <button className="ritual-button-outline gap-2 px-4" type="button" onClick={handleOpen}>
        <Images className="size-4" />
        <span className="hidden sm:inline">Gallery</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex flex-col overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(14,60,38,0.97), rgba(6,17,13,0.96))" }}>
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              background: "linear-gradient(90deg, rgba(47,121,90,0.15) 1px, transparent 1px), linear-gradient(rgba(47,121,90,0.12) 1px, transparent 1px)",
              backgroundSize: "88px 88px"
            }}
          />

          <div className="relative flex items-center justify-between border-b border-white/10 px-6 py-4">
            <div className="flex items-center gap-3">
              <img src="/background-logo.png" alt="" className="size-8 object-contain drop-shadow-[0_0_10px_rgba(25,209,132,0.5)]" />
              <h2 className="font-display text-2xl text-ritual-bright">Siggy Gallery</h2>
              {!loading && nfts.length > 0 && (
                <span className="rounded-full border border-ritual-bright/30 bg-ritual-green/20 px-2.5 py-0.5 text-xs font-semibold text-ritual-bright">
                  {nfts.length} minted
                </span>
              )}
            </div>
            <button
              className="flex size-9 items-center justify-center rounded-full border border-white/15 text-white/60 transition hover:border-white/40 hover:text-white"
              type="button"
              onClick={() => setOpen(false)}
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="relative flex-1 overflow-y-auto p-6">
            {loading && (
              <div className="flex h-64 items-center justify-center gap-3 text-ritual-bright">
                <Loader2 className="size-6 animate-spin" />
                <span className="font-semibold">Loading gallery...</span>
              </div>
            )}

            {!loading && error && (
              <div className="mx-auto mt-8 max-w-md rounded-xl border border-red-300/30 bg-red-950/70 p-4 text-center text-sm font-medium text-red-100">
                {error}
              </div>
            )}

            {!loading && !error && nfts.length === 0 && (
              <div className="flex h-64 flex-col items-center justify-center gap-3 text-white/40">
                <Images className="size-12 opacity-40" />
                <p className="font-semibold">No Siggys minted yet. Be the first!</p>
              </div>
            )}

            {!loading && nfts.length > 0 && (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {nfts.map((nft) => (
                  <div
                    key={nft.tokenId}
                    className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition hover:border-ritual-bright/40 hover:bg-white/8"
                  >
                    {nft.imageUrl ? (
                      <img
                        src={nft.imageUrl}
                        alt={nft.name}
                        className="aspect-square w-full object-cover"
                      />
                    ) : (
                      <div className="flex aspect-square w-full items-center justify-center bg-white/5">
                        <Images className="size-8 text-white/20" />
                      </div>
                    )}
                    <div className="p-3">
                      <p className="truncate text-sm font-semibold text-white">{nft.name}</p>
                      <p className="mt-0.5 truncate font-mono text-[10px] text-white/40">
                        {nft.minter.slice(0, 6)}…{nft.minter.slice(-4)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
