import { getStore } from "@netlify/blobs";

export default async () => {
  const store = getStore("portfolio-data");
  const saved = await store.get("projects.json", { type: "json", consistency: "strong" }).catch(() => null);
  const projects = Array.isArray(saved) ? saved : [];
  return Response.json(projects, {
    headers: {
      "Cache-Control": "no-store"
    }
  });
};
