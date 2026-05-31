import Stripe from "stripe";
import { SubscriptionPlan } from "@prisma/client";

export const STRIPE_PRICE_IDS = {
  pro_lifetime: process.env.STRIPE_PRICE_ID_PRO_LIFETIME,
  pro_monthly: process.env.STRIPE_PRICE_ID_PRO_MONTHLY,
  pro_yearly: process.env.STRIPE_PRICE_ID_PRO_YEARLY,
  plus_monthly: process.env.STRIPE_PRICE_ID_PLUS_MONTHLY,
  plus_yearly: process.env.STRIPE_PRICE_ID_PLUS_YEARLY,
} as const satisfies Partial<Record<Exclude<SubscriptionPlan, "free">, string | undefined>>;

export type StripePaidPlan = Exclude<SubscriptionPlan, "free">;

export function isStripePlan(value: string): value is StripePaidPlan {
  return value in STRIPE_PRICE_IDS;
}

export function getStripePriceIdForPlan(plan: StripePaidPlan) {
  return STRIPE_PRICE_IDS[plan];
}

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-10-29.clover",
    })
  : null;
