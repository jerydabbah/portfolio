import { createSessionCookie, getAdminPassword } from "./_auth.mjs";

export default async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const adminPassword = getAdminPassword();
  if (!adminPassword) {
    return new Response("Falta configurar ADMIN_PASSWORD en Netlify.", { status: 500 });
  }

  const body = await req.json().catch(() => null);
  if (!body?.password || body.password !== adminPassword) {
    return new Response("Contraseña incorrecta.", { status: 401 });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": createSessionCookie()
    }
  });
};
