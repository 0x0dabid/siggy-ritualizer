"use client";

import { Images, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { parseAbiItem } from "viem";
import { usePublicClient } from "wagmi";
import { hasContractAddress, NFT_CONTRACT_ADDRESS } from "@/lib/contract";

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
  const [nfts, setNfts] = useState<NFTItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const publicClient = usePublicClient();

  useEffect(() => {
    if (!publicClient || !hasContractAddress()) {
      setLoading(false);
      return;
    }

    const CHUNK = 99_999n;
    const event = parseAbiItem(
      "event PfpMinted(address indexed minter, uint256 indexed tokenId, string tokenURI)"
    );
    type PfpLog = { args: { minter?: `0x${string}`; tokenId?: bigint; tokenURI?: string } };

    (async () => {
      try {
        const latestBlock = await publicClient.getBlockNumber();
        const allLogs: PfpLog[] = [];

        for (let from = 0n; from <= latestBlock; from += CHUNK + 1n) {
          const to = from + CHUNK > latestBlock ? latestBlock : from + CHUNK;
          const chunk = await publicClient.getLogs({
            address: NFT_CONTRACT_ADDRESS,
            event,
            fromBlock: from,
            toBlock: to
          });
          allLogs.push(...(chunk as PfpLog[]));
        }

        const items = await Promise.all(
          allLogs.map(async (log) => {
            const tokenId = log.args.tokenId?.toString() ?? "?";
            const minter = log.args.minter ?? "";
            const tokenUri = log.args.tokenURI ?? "";
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

        setNfts(items.reverse());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load gallery.");
      } finally {
        setLoading(false);
      }
    })();
  }, [publicClient]);

  return (
    <section id="gallery" className="relative w-full" style={{ background: "linear-gradient(180deg, rgba(14,60,38,0.0) 0%, rgba(6,17,13,1) 6%)" }}>
      <div
        className="pointer-events-none absolute inset-0 opacity-15"
        style={{
          background: "linear-gradient(90deg, rgba(25,209,132,0.12) 1px, transparent 1px), linear-gradient(rgba(25,209,132,0.10) 1px, transparent 1px)",
          backgroundSize: "88px 88px"
        }}
      />

      <div className="relative mx-auto max-w-[92rem] px-5 py-14 sm:px-8 lg:px-11">
        {/* Section header */}
        <div className="mb-8 flex items-end justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex size-11 items-center justify-center rounded-xl border border-ritual-bright/30 bg-ritual-green/20">
              <Images className="size-5 text-ritual-bright" />
            </div>
            <div>
              <h2 className="font-display text-3xl text-white sm:text-4xl">Collection</h2>
              <p className="mt-0.5 font-mono text-xs uppercase tracking-widest text-ritual-bright/70">
                {loading ? "Loading…" : `${nfts.length} Siggy${nfts.length !== 1 ? "s" : ""} minted`}
              </p>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex h-52 items-center justify-center gap-3 text-ritual-bright">
            <Loader2 className="size-6 animate-spin" />
            <span className="font-semibold">Loading collection…</span>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="mx-auto max-w-md rounded-xl border border-red-300/30 bg-red-950/70 p-4 text-center text-sm font-medium text-red-100">
            {error}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && nfts.length === 0 && (
          <div className="flex h-52 flex-col items-center justify-center gap-3 text-white/30">
            <Images className="size-12 opacity-40" />
            <p className="font-semibold">No Siggys minted yet — be the first!</p>
          </div>
        )}

        {/* Grid */}
        {!loading && nfts.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {nfts.map((nft) => (
              <div
                key={nft.tokenId}
                className="group relative overflow-hidden rounded-2xl border border-white/8 bg-white/4 transition-all duration-200 hover:border-ritual-bright/40 hover:scale-[1.02]"
              >
                {/* Image */}
                <div className="relative aspect-square w-full overflow-hidden bg-ritual-green/10">
                  {nft.imageUrl ? (
                    <img
                      src={nft.imageUrl}
                      alt={nft.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Images className="size-8 text-white/20" />
                    </div>
                  )}
                  {/* Token ID badge */}
                  <span className="absolute left-2.5 top-2.5 rounded-lg bg-black/60 px-2 py-0.5 font-mono text-xs font-bold text-white backdrop-blur-sm">
                    #{nft.tokenId}
                  </span>
                  {/* Minted badge */}
                  <span className="absolute right-2.5 top-2.5 rounded-lg bg-ritual-green/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
                    Minted
                  </span>
                </div>

                {/* Footer */}
                <div className="px-3 py-2.5">
                  <p className="truncate text-sm font-semibold text-white">{nft.name}</p>
                  <p className="mt-0.5 font-mono text-[10px] text-white/40">
                    {nft.minter.slice(0, 6)}…{nft.minter.slice(-4)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
