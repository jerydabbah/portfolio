import { getStore } from "@netlify/blobs";

export default async (req) => {
  const url = new URL(req.url);
  const key = url.searchParams.get("key");

  if (!key) {
    return new Response("Falta key.", { status: 400 });
  }

  const store = getStore("portfolio-images");
  const entry = await store.getWithMetadata(key, { consistency: "strong" }).catch(() => null);

  if (!entry || !entry.data) {
    return new Response("No encontrada.", { status: 404 });
  }

  const contentType = entry.metadata?.contentType || "application/octet-stream";

  return new Response(entry.data, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable"
    }
  });
};
