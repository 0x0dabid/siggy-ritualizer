import { NextResponse } from "next/server";

export const runtime = "nodejs";

const CACHE_TTL_MS = 60 * 60 * 1000;
const avatarCache = new Map<string, { body: ArrayBuffer; contentType: string; expiresAt: number }>();

function sanitizeHandle(value: string | null) {
  return (value ?? "")
    .trim()
    .replace(/^@+/, "")
    .replace(/^https?:\/\/(www\.)?(x|twitter)\.com\//i, "")
    .split(/[/?#]/)[0]
    .replace(/[^a-zA-Z0-9_]/g, "")
    .slice(0, 15);
}

function avatarSources(handle: string) {
  return [`https://unavatar.io/x/${handle}`, `https://unavatar.io/twitter/${handle}`];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const handle = sanitizeHandle(searchParams.get("handle"));

  if (!handle) {
    return NextResponse.json({ error: "Enter a valid X handle." }, { status: 400 });
  }

  const cached = avatarCache.get(handle.toLowerCase());
  if (cached && cached.expiresAt > Date.now()) {
    return new NextResponse(cached.body, {
      headers: {
        "Content-Type": cached.contentType,
        "Cache-Control": "public, max-age=3600, s-maxage=3600"
      }
    });
  }

  for (const source of avatarSources(handle)) {
    try {
      const response = await fetch(source, {
        headers: {
          Accept: "image/avif,image/webp,image/png,image/jpeg,image/*"
        },
        cache: "no-store",
        redirect: "follow"
      });

      const contentType = response.headers.get("content-type")?.split(";")[0]?.trim() ?? "";
      if (!response.ok || !contentType.startsWith("image/")) continue;

      const body = await response.arrayBuffer();
      if (!body.byteLength) continue;

      avatarCache.set(handle.toLowerCase(), {
        body,
        contentType,
        expiresAt: Date.now() + CACHE_TTL_MS
      });

      return new NextResponse(body, {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=3600, s-maxage=3600",
          "X-Avatar-Source": source
        }
      });
    } catch {
      // Try the next resolver source.
    }
  }

  return NextResponse.json(
    { error: "Couldn’t load this X profile picture. Try uploading manually." },
    { status: 404 }
  );
}
