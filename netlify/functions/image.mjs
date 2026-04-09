import { getStore } from "@netlify/blobs";

export default async (req) => {
  const url = new URL(req.url);
  const key = url.searchParams.get("key");

  if (!key) {
    return new Response("Falta key.", { status: 400 });
  }

  const store = getStore("portfolio-images");
  const blob = await store.get(key, { type: "blob", consistency: "strong" }).catch(() => null);

  if (!blob) {
    return new Response("No encontrada.", { status: 404 });
  }

  return new Response(blob.stream(), {
    status: 200,
    headers: {
      "Content-Type": blob.type || "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable"
    }
  });
};
