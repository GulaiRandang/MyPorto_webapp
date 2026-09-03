import type { Metadata } from "next";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { getUser } from "@/lib/auth";
import { getPlanInfo } from "@/lib/plan";
import { stripe } from "@/lib/stripe";
import { syncSubscription } from "@/lib/subscription-sync";
import { UpgradeButton, ManageButton } from "@/components/pricing/plan-buttons";

export const metadata: Metadata = { title: "Pricing — MyPorto" };

const FREE_FEATURES = [
  "Live quotes & market search",
  "Portfolio dashboard",
  "Market news",
];
const PRO_FEATURES = [
  "Everything in Free",
  "Save unlimited stocks to your watchlist",
  "Live watchlist quotes",
  "Priority support",
];

/**
 * Verifies a returning Stripe Checkout session server-side and upgrades the
 * user immediately — so the sandbox flow works even without `stripe listen`.
 * The webhook remains the source of truth for renewals/cancellations.
 */
async function confirmCheckout(sessionId: string) {
  const user = await getUser();
  if (!user) return;
  try {
    const session = await stripe().checkout.sessions.retrieve(sessionId, {
      expand: ["subscription"],
    });
    if (session.client_reference_id !== user.id) return;
    if (session.payment_status !== "paid" && session.status !== "complete") {
      return;
    }
    const sub = session.subscription;
    if (sub && typeof sub !== "string") {
      await syncSubscription(sub, user.id);
    }
  } catch {
    // ignore — the webhook will reconcile
  }
}

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const sessionId =
    typeof params.session_id === "string" ? params.session_id : null;
  if (params.checkout === "success" && sessionId) {
    await confirmCheckout(sessionId);
  }

  const info = await getPlanInfo();
  const isPro = info.plan === "pro";

  return (
    <div className="mx-auto max-w-3xl">
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Pricing
        </h2>
        <p className="mt-1.5 text-sm text-muted">
          You are currently on the{" "}
          <span className="font-semibold text-foreground">
            {isPro ? "Pro" : "Free"}
          </span>{" "}
          plan.
        </p>
      </div>

      {params.checkout === "success" && (
        <p className="mx-auto mt-5 max-w-md rounded-lg border border-success-border bg-success-surface px-3 py-2 text-center text-xs font-medium text-success">
          Payment complete — you&apos;re on Pro. 🎉
        </p>
      )}
      {params.checkout === "cancelled" && (
        <p className="mx-auto mt-5 max-w-md rounded-lg border border-card-border bg-card px-3 py-2 text-center text-xs font-medium text-muted">
          Checkout cancelled — no charge was made.
        </p>
      )}

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        {/* Free */}
        <div className="rounded-card border border-card-border bg-card p-6 card-shadow">
          <h3 className="text-sm font-semibold text-muted">Free</h3>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">
            $0
            <span className="text-sm font-medium text-muted-2">/month</span>
          </p>
          <ul className="mt-5 flex flex-col gap-2.5">
            {FREE_FEATURES.map((f) => (
              <li
                key={f}
                className="flex items-start gap-2 text-sm text-foreground"
              >
                <Check
                  className="mt-0.5 size-4 shrink-0 text-muted-2"
                  strokeWidth={2.5}
                />
                {f}
              </li>
            ))}
          </ul>
          <div className="mt-6">
            <div
              className={cn(
                "rounded-xl border border-card-border px-4 py-2.5 text-center text-sm font-semibold",
                isPro ? "text-muted-2" : "text-foreground",
              )}
            >
              {isPro ? "Included" : "Current plan"}
            </div>
          </div>
        </div>

        {/* Pro */}
        <div className="rounded-card border-2 border-brand bg-card p-6 card-shadow">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-brand">Pro</h3>
            <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[11px] font-semibold text-brand">
              Most popular
            </span>
          </div>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">
            $20
            <span className="text-sm font-medium text-muted-2">/month</span>
          </p>
          <ul className="mt-5 flex flex-col gap-2.5">
            {PRO_FEATURES.map((f) => (
              <li
                key={f}
                className="flex items-start gap-2 text-sm text-foreground"
              >
                <Check
                  className="mt-0.5 size-4 shrink-0 text-brand"
                  strokeWidth={2.5}
                />
                {f}
              </li>
            ))}
          </ul>
          <div className="mt-6">
            {isPro ? <ManageButton /> : <UpgradeButton />}
          </div>
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-muted-2">
        Test mode — use card <code>4242 4242 4242 4242</code>, any future expiry
        and CVC.
      </p>
    </div>
  );
}
