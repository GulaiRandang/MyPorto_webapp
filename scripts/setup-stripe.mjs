/**
 * One-time: create the "MyPorto Pro" product + $20/month recurring price in your
 * Stripe TEST account, then print the price id to put in .env.local.
 *
 *   npm run stripe:setup
 *
 * Idempotent: re-running reuses an existing product/price with the same name/amount.
 */
import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error("STRIPE_SECRET_KEY is empty in .env.local");
  process.exit(1);
}
if (!key.startsWith("sk_test_")) {
  console.error(
    `Refusing to run: STRIPE_SECRET_KEY is not a test key (got ${key.slice(0, 8)}...). Use a sk_test_ key.`,
  );
  process.exit(1);
}

const stripe = new Stripe(key);
const PRODUCT_NAME = "MyPorto Pro";
const AMOUNT = 2000; // $20.00
const CURRENCY = "usd";
const INTERVAL = "month";

const products = await stripe.products.list({ active: true, limit: 100 });
let product = products.data.find((p) => p.name === PRODUCT_NAME);
if (product) {
  console.log(`= product exists: ${product.id}`);
} else {
  product = await stripe.products.create({
    name: PRODUCT_NAME,
    description: "Save stocks to your watchlist and track live quotes.",
  });
  console.log(`+ created product: ${product.id}`);
}

const prices = await stripe.prices.list({ product: product.id, limit: 100 });
let price = prices.data.find(
  (p) =>
    p.active &&
    p.unit_amount === AMOUNT &&
    p.currency === CURRENCY &&
    p.recurring?.interval === INTERVAL,
);
if (price) {
  console.log(`= price exists: ${price.id}`);
} else {
  price = await stripe.prices.create({
    product: product.id,
    unit_amount: AMOUNT,
    currency: CURRENCY,
    recurring: { interval: INTERVAL },
  });
  console.log(`+ created price: ${price.id}`);
}

console.log(`\nAdd this to .env.local:\n\nSTRIPE_PRICE_ID="${price.id}"\n`);
