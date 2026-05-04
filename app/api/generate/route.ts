import { NextResponse } from "next/server";
import { ACCEPTED_IMAGE_TYPES, MAX_UPLOAD_BYTES } from "@/lib/utils";
import { generateSiggyRitualizerFromSource } from "@/lib/openai";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const image = formData.get("image");

    if (!(image instanceof File)) {
      return NextResponse.json({ error: "Upload a PNG, JPG, or WebP image before generating." }, { status: 400 });
    }

    if (!ACCEPTED_IMAGE_TYPES.includes(image.type)) {
      return NextResponse.json({ error: "Unsupported file type. Use PNG, JPG, or WebP." }, { status: 400 });
    }

    if (image.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: "Image is too large. Keep uploads under 8MB." }, { status: 400 });
    }

    const imageDataUrl = await generateSiggyRitualizerFromSource({
      sourceLabel: image.name || "uploaded-image",
      sourceImageUrl: "uploaded image",
      buffer: Buffer.from(await image.arrayBuffer()),
      contentType: image.type || "image/png"
    });

    return NextResponse.json({ imageDataUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : "OpenAI generation failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
