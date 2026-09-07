import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { getPlanInfo } from "@/lib/plan";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/server";
import { serverEnv } from "@/lib/env";
import { getBaseUrlFromRequest } from "@/lib/url";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const baseUrl = getBaseUrlFromRequest(request);
  const user = await getUser();
  if (!user?.email) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const info = await getPlanInfo();
  if (info.plan === "pro") {
    return NextResponse.json({ error: "already_pro" }, { status: 400 });
  }

  let customerId = info.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe().customers.create({
      email: user.email,
      metadata: { user_id: user.id },
    });
    customerId = customer.id;
    await createAdminClient()
      .from("subscriptions")
      .upsert(
        { user_id: user.id, stripe_customer_id: customerId },
        { onConflict: "user_id" },
      );
  }

  const session = await stripe().checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: serverEnv.stripePriceId, quantity: 1 }],
    client_reference_id: user.id,
    subscription_data: { metadata: { user_id: user.id } },
    allow_promotion_codes: true,
    success_url: `${baseUrl}/pricing?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/pricing?checkout=cancelled`,
  });

  return NextResponse.json({ url: session.url });
}
