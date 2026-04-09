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
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const auth = requireAdmin(req);
  if (!auth.ok) return auth.response;

  const formData = await req.formData().catch(() => null);
  const file = formData?.get("file");

  if (!(file instanceof File)) {
    return new Response("Archivo invalido.", { status: 400 });
  }

  if (!file.type || !file.type.startsWith("image/")) {
    return new Response("Solo se permiten imagenes.", { status: 400 });
  }

  const maxSize = 15 * 1024 * 1024;
  if (file.size > maxSize) {
    return new Response("La imagen supera el limite de 15MB.", { status: 400 });
  }

  const extension = (file.name.split(".").pop() || "bin").toLowerCase();
  const safeName = sanitizeName(file.name.replace(/\.[^.]+$/, "")) || "image";
  const key = `images/${Date.now()}-${randomUUID()}-${safeName}.${extension}`;

  const store = getStore("portfolio-images");
  await store.set(key, file, {
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
};
