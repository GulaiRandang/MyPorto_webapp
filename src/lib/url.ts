import "server-only";
import { headers } from "next/headers";

function isLocal(host: string) {
  return host.startsWith("localhost") || host.startsWith("127.0.0.1");
}

function fromEnv(): string | null {
  // Explicit override, then Vercel-provided domains, then nothing.
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, "");
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return null;
}

/**
 * The app's public origin (no trailing slash) for the CURRENT request — i.e. the
 * exact domain the visitor is on (production, preview, or a custom domain).
 *
 * Priority: forwarded host header → env override → localhost. This means sharing
 * a deployment link "just works" without any env var being set correctly.
 */
export function getBaseUrlFromRequest(request: Request): string {
  const h = request.headers;
  const host =
    h.get("x-forwarded-host") ??
    h.get("host") ??
    new URL(request.url).host;
  const proto =
    h.get("x-forwarded-proto")?.split(",")[0]?.trim() ??
    (isLocal(host) ? "http" : "https");
  return `${proto}://${host}`;
}

/** Same as above for Server Components / Server Actions (no explicit Request). */
export async function getBaseUrl(): Promise<string> {
  try {
    const h = await headers();
    const host = h.get("x-forwarded-host") ?? h.get("host");
    if (host) {
      const proto =
        h.get("x-forwarded-proto")?.split(",")[0]?.trim() ??
        (isLocal(host) ? "http" : "https");
      return `${proto}://${host}`;
    }
  } catch {
    // Not inside a request scope (e.g. build-time). Fall through.
  }
  return fromEnv() ?? "http://localhost:3000";
}
