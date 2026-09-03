/**
 * Centralised, validated environment access.
 *
 * - `NEXT_PUBLIC_*` values are safe in the browser (Supabase URL + anon key).
 * - `serverEnv` values are secrets — only read them from server code.
 *
 * All getters are lazy so a missing variable fails at request time with a clear
 * message, rather than crashing the build.
 */

function required(name: string, value: string | undefined): string {
  if (!value || value.trim() === "") {
    throw new Error(
      `Missing environment variable ${name}. Copy .env.example to .env.local and fill it in.`,
    );
  }
  return value;
}

export const env = {
  get supabaseUrl() {
    return required(
      "NEXT_PUBLIC_SUPABASE_URL",
      process.env.NEXT_PUBLIC_SUPABASE_URL,
    );
  },
  get supabaseAnonKey() {
    return required(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    );
  },
  /** Public base URL, used for Stripe redirect URLs. Defaults to localhost. */
  get siteUrl() {
    return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
      "http://localhost:3000";
  },
};

/** Server-only secrets. Never import into Client Components. */
export const serverEnv = {
  get supabaseServiceRoleKey() {
    return required(
      "SUPABASE_SERVICE_ROLE_KEY",
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    );
  },
  get finnhubApiKey() {
    return required("FINNHUB_API_KEY", process.env.FINNHUB_API_KEY);
  },
  get stripeSecretKey() {
    return required("STRIPE_SECRET_KEY", process.env.STRIPE_SECRET_KEY);
  },
  get stripePriceId() {
    return required("STRIPE_PRICE_ID", process.env.STRIPE_PRICE_ID);
  },
  /** Optional — only needed when running `stripe listen` for local webhooks. */
  get stripeWebhookSecret(): string | undefined {
    return process.env.STRIPE_WEBHOOK_SECRET || undefined;
  },
};
