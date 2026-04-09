import { randomUUID } from "node:crypto";
import { getStore } from "@netlify/blobs";
import { requireAdmin } from "./_auth.mjs";

function sanitizeName(name) {
  return name
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

export default async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    const auth = requireAdmin(req);
    if (!auth.ok) return auth.response;

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return new Response("No se recibió ningún archivo.", { status: 400 });
    }

    if (!file.type || !file.type.startsWith("image/")) {
      return new Response("Solo se permiten imágenes.", { status: 400 });
    }

    const maxSize = 15 * 1024 * 1024;
    if (file.size > maxSize) {
      return new Response("La imagen supera el límite de 15MB.", { status: 400 });
    }

    const extension = (file.name.split(".").pop() || "bin").toLowerCase();
    const safeName = sanitizeName(file.name.replace(/\.[^.]+$/, "")) || "image";
    const key = `images/${Date.now()}-${randomUUID()}-${safeName}.${extension}`;

    const bytes = await file.arrayBuffer();
    const store = getStore("portfolio-images");

    await store.set(key, new Uint8Array(bytes), {
      metadata: {
        contentType: file.type,
        originalName: file.name
      }
    });

    return Response.json({
      ok: true,
      key,
      src: `/.netlify/functions/image?key=${encodeURIComponent(key)}`
    });
  } catch (error) {
    return new Response(`Upload error: ${error?.message || error}`, {
      status: 500
    });
  }
};
