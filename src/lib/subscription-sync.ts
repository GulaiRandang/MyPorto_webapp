import "server-only";
import type Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/server";

const ACTIVE_STATUSES = ["active", "trialing", "past_due"];

/** Upserts our `subscriptions` row from a Stripe Subscription object. */
export async function syncSubscription(sub: Stripe.Subscription, userId: string) {
  const item = sub.items.data[0];
  const periodEndUnix =
    // API 2025-xx moved current_period_end onto the item; fall back to the sub.
    (item as unknown as { current_period_end?: number })?.current_period_end ??
    (sub as unknown as { current_period_end?: number }).current_period_end ??
    null;

  const plan = ACTIVE_STATUSES.includes(sub.status) ? "pro" : "free";

  const admin = createAdminClient();
  const { error } = await admin.from("subscriptions").upsert(
    {
      user_id: userId,
      plan,
      status: sub.status,
      stripe_customer_id:
        typeof sub.customer === "string" ? sub.customer : sub.customer.id,
      stripe_subscription_id: sub.id,
      price_id: item?.price.id ?? null,
      current_period_end: periodEndUnix
        ? new Date(periodEndUnix * 1000).toISOString()
        : null,
    },
    { onConflict: "user_id" },
  );

  if (error) throw new Error(`syncSubscription failed: ${error.message}`);
  return plan;
}

/** Reset a user to the free plan (subscription cancelled / deleted). */
export async function downgradeToFree(userId: string) {
  const admin = createAdminClient();
  const { error } = await admin
    .from("subscriptions")
    .update({ plan: "free", status: "canceled" })
    .eq("user_id", userId);
  if (error) throw new Error(`downgradeToFree failed: ${error.message}`);
}
