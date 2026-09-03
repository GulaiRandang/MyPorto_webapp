import { createClient } from "@/lib/supabase/server";

export type Plan = "free" | "pro";

export interface PlanInfo {
  plan: Plan;
  status: string | null;
  currentPeriodEnd: string | null;
  stripeCustomerId: string | null;
}

/** Reads the current user's plan from the `subscriptions` table (RLS-scoped). */
export async function getPlanInfo(): Promise<PlanInfo> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const fallback: PlanInfo = {
    plan: "free",
    status: null,
    currentPeriodEnd: null,
    stripeCustomerId: null,
  };
  if (!user) return fallback;

  const { data } = await supabase
    .from("subscriptions")
    .select("plan, status, current_period_end, stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!data) return fallback;

  // Treat a paid plan as active only while Stripe says so.
  const active =
    data.plan === "pro" &&
    (data.status === null ||
      ["active", "trialing", "past_due"].includes(data.status));

  return {
    plan: active ? "pro" : "free",
    status: data.status,
    currentPeriodEnd: data.current_period_end,
    stripeCustomerId: data.stripe_customer_id,
  };
}

export async function getPlan(): Promise<Plan> {
  return (await getPlanInfo()).plan;
}
