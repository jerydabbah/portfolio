import { createHmac, timingSafeEqual } from "node:crypto";

const COOKIE_NAME = "jd_admin_session";
const TTL_MS = 1000 * 60 * 60 * 24 * 7;

function env(name) {
  if (typeof Netlify !== "undefined" && Netlify?.env?.get) {
    return Netlify.env.get(name);
  }
  return process.env[name];
}

function parseCookies(req) {
  const raw = req.headers.get("cookie") || "";
  return raw.split(";").reduce((acc, part) => {
    const idx = part.indexOf("=");
    if (idx === -1) return acc;
    const key = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    acc[key] = value;
    return acc;
  }, {});
}

function sign(value, secret) {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

export function createSessionCookie() {
  const secret = env("ADMIN_PASSWORD");
  if (!secret) throw new Error("Missing ADMIN_PASSWORD env var.");

  const payload = JSON.stringify({ exp: Date.now() + TTL_MS });
  const encoded = Buffer.from(payload, "utf8").toString("base64url");
  const signature = sign(encoded, secret);
  const cookieValue = `${encoded}.${signature}`;

  return `${COOKIE_NAME}=${cookieValue}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${Math.floor(TTL_MS / 1000)}`;
}

export function clearSessionCookie() {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}

export function requireAdmin(req) {
  const secret = env("ADMIN_PASSWORD");
  if (!secret) {
    return { ok: false, response: new Response("Falta configurar ADMIN_PASSWORD en Netlify.", { status: 500 }) };
  }

  const cookies = parseCookies(req);
  const token = cookies[COOKIE_NAME];
  if (!token || !token.includes(".")) {
    return { ok: false, response: new Response("No autorizado.", { status: 401 }) };
  }

  const [encoded, signature] = token.split(".");
  const expected = sign(encoded, secret);

  const sigA = Buffer.from(signature);
  const sigB = Buffer.from(expected);
  if (sigA.length !== sigB.length || !timingSafeEqual(sigA, sigB)) {
    return { ok: false, response: new Response("No autorizado.", { status: 401 }) };
  }

  let payload;
  try {
    payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
  } catch {
    return { ok: false, response: new Response("Sesion invalida.", { status: 401 }) };
  }

  if (!payload.exp || Date.now() > payload.exp) {
    return { ok: false, response: new Response("Sesion vencida.", { status: 401 }) };
  }

  return { ok: true };
}

export function getAdminPassword() {
  return env("ADMIN_PASSWORD");
}
