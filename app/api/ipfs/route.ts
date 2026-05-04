import { NextResponse } from "next/server";
import { uploadGeneratedPfpToIpfs } from "@/lib/ipfs";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { imageDataUrl?: string; nextTokenId?: string };
    if (!body.imageDataUrl) {
      return NextResponse.json({ error: "No generated image found to upload." }, { status: 400 });
    }

    const uploaded = await uploadGeneratedPfpToIpfs(body.imageDataUrl, body.nextTokenId);
    return NextResponse.json(uploaded);
  } catch (error) {
    const message = error instanceof Error ? error.message : "IPFS upload failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
