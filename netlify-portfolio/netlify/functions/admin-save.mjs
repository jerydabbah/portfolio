import { getStore } from "@netlify/blobs";
import { requireAdmin } from "./_auth.mjs";

export default async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const auth = requireAdmin(req);
  if (!auth.ok) return auth.response;

  const body = await req.json().catch(() => null);
  const projects = body?.projects;

  if (!Array.isArray(projects)) {
    return new Response("Formato invalido.", { status: 400 });
  }

  const cleanProjects = projects.map((item) => ({
    title: String(item?.title || "").slice(0, 200),
    src: String(item?.src || "")
  })).filter((item) => item.title && item.src);

  const store = getStore("portfolio-data");
  await store.setJSON("projects.json", cleanProjects);

  return Response.json({ ok: true, count: cleanProjects.length });
};
