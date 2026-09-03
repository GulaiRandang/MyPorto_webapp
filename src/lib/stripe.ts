import "server-only";
import Stripe from "stripe";
import { serverEnv } from "@/lib/env";

let _stripe: Stripe | null = null;

export function stripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(serverEnv.stripeSecretKey, {
      appInfo: { name: "MyPorto" },
    });
  }
  return _stripe;
}
