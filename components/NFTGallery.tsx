"use client";

import { Images, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { createPublicClient, http } from "viem";
import { ritualChain, RITUAL_RPC_URL } from "@/lib/chains";
import { hasContractAddress, NFT_CONTRACT_ADDRESS, ritualizedPfpAbi } from "@/lib/contract";

const client = createPublicClient({
  chain: ritualChain,
  transport: http(RITUAL_RPC_URL)
});

type NFTItem = {
  tokenId: number;
  owner: string;
  imageUrl: string;
  name: string;
};

function ipfsToHttp(uri: string) {
  if (uri.startsWith("ipfs://")) return `https://ipfs.io/ipfs/${uri.slice(7)}`;
  return uri;
}

async function fetchIpfsMeta(uri: string): Promise<{ image?: string; name?: string }> {
  try {
    const res = await fetch(`/api/metadata?uri=${encodeURIComponent(uri)}`);
    if (res.ok) return (await res.json()) as { image?: string; name?: string };
  } catch {
    // fall through
  }
  return {};
}

async function readTokenURI(id: number): Promise<string> {
  try {
    const uri = await client.readContract({
      address: NFT_CONTRACT_ADDRESS,
      abi: ritualizedPfpAbi,
      functionName: "tokenURI",
      args: [BigInt(id)]
    });
    return String(uri);
  } catch {
    return "";
  }
}

async function readOwnerOf(id: number): Promise<string> {
  try {
    const owner = await client.readContract({
      address: NFT_CONTRACT_ADDRESS,
      abi: ritualizedPfpAbi,
      functionName: "ownerOf",
      args: [BigInt(id)]
    });
    return String(owner);
  } catch {
    return "";
  }
}

async function batchRun<T>(items: number[], batchSize: number, fn: (id: number) => Promise<T>): Promise<T[]> {
  const results: T[] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    results.push(...await Promise.all(batch.map(fn)));
  }
  return results;
}

export function NFTGallery() {
  const [nfts, setNfts] = useState<NFTItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasContractAddress()) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const nextId = await client.readContract({
          address: NFT_CONTRACT_ADDRESS,
          abi: ritualizedPfpAbi,
          functionName: "nextTokenId"
        });
        const total = Number(nextId) - 1;

        if (total <= 0) {
          setNfts([]);
          setLoading(false);
          return;
        }

        const ids = Array.from({ length: total }, (_, i) => i + 1);

        // Individual reads in batches of 10 — no multicall dependency
        const [tokenURIs, owners] = await Promise.all([
          batchRun(ids, 10, readTokenURI),
          batchRun(ids, 10, readOwnerOf)
        ]);

        const items = await Promise.all(
          ids.map(async (id, i) => {
            const tokenUri = tokenURIs[i];
            const owner = owners[i];

            if (!tokenUri) return { tokenId: id, owner, imageUrl: "", name: `Siggy #${id}` };

            const meta = await fetchIpfsMeta(tokenUri);
            return {
              tokenId: id,
              owner,
              imageUrl: meta.image ? ipfsToHttp(meta.image) : "",
              name: meta.name ?? `Siggy #${id}`
            };
          })
        );

        setNfts(items.reverse());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load collection.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

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
        <div className="mb-8 flex items-center gap-4">
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

        {loading && (
          <div className="flex h-52 items-center justify-center gap-3 text-ritual-bright">
            <Loader2 className="size-6 animate-spin" />
            <span className="font-semibold">Loading collection…</span>
          </div>
        )}

        {!loading && error && (
          <div className="mx-auto max-w-md rounded-xl border border-red-300/30 bg-red-950/70 p-4 text-center text-sm font-medium text-red-100">
            {error}
          </div>
        )}

        {!loading && !error && nfts.length === 0 && (
          <div className="flex h-52 flex-col items-center justify-center gap-3 text-white/30">
            <Images className="size-12 opacity-40" />
            <p className="font-semibold">No Siggys minted yet — be the first!</p>
          </div>
        )}

        {!loading && nfts.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {nfts.map((nft) => (
              <div
                key={nft.tokenId}
                className="group relative overflow-hidden rounded-2xl border border-white/8 bg-white/4 transition-all duration-200 hover:border-ritual-bright/40 hover:scale-[1.02]"
              >
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
                  <span className="absolute left-2.5 top-2.5 rounded-lg bg-black/60 px-2 py-0.5 font-mono text-xs font-bold text-white backdrop-blur-sm">
                    #{nft.tokenId}
                  </span>
                  <span className="absolute right-2.5 top-2.5 rounded-lg bg-ritual-green/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
                    Minted
                  </span>
                </div>
                <div className="px-3 py-2.5">
                  <p className="truncate text-sm font-semibold text-white">{nft.name}</p>
                  <p className="mt-0.5 font-mono text-[10px] text-white/40">
                    {nft.owner ? `${nft.owner.slice(0, 6)}…${nft.owner.slice(-4)}` : ""}
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
