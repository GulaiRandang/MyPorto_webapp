import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { env, serverEnv } from "@/lib/env";
import type { Database } from "./database.types";

/**
 * Supabase client for Server Components, Route Handlers and Server Actions.
 * Reads/writes the auth session from the request cookies.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // `setAll` was called from a Server Component — safe to ignore when
          // middleware is refreshing the session.
        }
      },
    },
  });
}

/**
 * Service-role client — bypasses Row Level Security. SERVER ONLY, and only for
 * trusted operations (cache writes, admin tasks, webhooks). Never derive the
 * acting user from this client.
 */
export function createAdminClient() {
  return createServerClient<Database>(
    env.supabaseUrl,
    serverEnv.supabaseServiceRoleKey,
    {
      cookies: { getAll: () => [], setAll: () => {} },
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );
}
