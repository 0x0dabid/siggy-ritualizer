import { NextResponse } from "next/server";

export const runtime = "nodejs";

const GATEWAYS = [
  "https://ipfs.io/ipfs/",
  "https://dweb.link/ipfs/",
  "https://w3s.link/ipfs/",
  "https://gateway.pinata.cloud/ipfs/"
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const uri = searchParams.get("uri");

  if (!uri) {
    return NextResponse.json({ error: "Missing uri" }, { status: 400 });
  }

  const cid = uri.startsWith("ipfs://") ? uri.slice(7) : uri;

  for (const gateway of GATEWAYS) {
    try {
      const res = await fetch(`${gateway}${cid}`, {
        signal: AbortSignal.timeout(10_000),
        next: { revalidate: 3600 }
      });
      if (res.ok) {
        const data = await res.json();
        return NextResponse.json(data);
      }
    } catch {
      // try next gateway
    }
  }

  return NextResponse.json({ error: "Failed to fetch metadata from IPFS" }, { status: 502 });
}
