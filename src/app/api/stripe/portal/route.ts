import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { getPlanInfo } from "@/lib/plan";
import { stripe } from "@/lib/stripe";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function POST() {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const info = await getPlanInfo();
  if (!info.stripeCustomerId) {
    return NextResponse.json({ error: "no_customer" }, { status: 400 });
  }

  const session = await stripe().billingPortal.sessions.create({
    customer: info.stripeCustomerId,
    return_url: `${env.siteUrl}/pricing`,
  });

  return NextResponse.json({ url: session.url });
}
