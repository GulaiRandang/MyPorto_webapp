import { createClient } from "@/lib/supabase/server";

/**
 * Returns the current user or `null`. Use in Server Components / route handlers.
 */
export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
