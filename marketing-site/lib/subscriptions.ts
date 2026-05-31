import { SubscriptionPlan, SubscriptionStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { STRIPE_PRICE_IDS } from "@/lib/stripe";

export async function findLatestSubscriptionForUser(userId: string) {
  try {
    return await prisma.subscription.findFirst({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    });
  } catch (error) {
    console.error("Failed to load latest subscription:", error);
    return null;
  }
}

export function mapStripeStatusToSubscriptionStatus(
  stripeStatus: string | null | undefined,
): SubscriptionStatus {
  switch (stripeStatus) {
  case "active":
    return "active";
  case "trialing":
    return "trialing";
  case "past_due":
    return "past_due";
  case "canceled":
    return "canceled";
  case "incomplete":
  case "incomplete_expired":
    return "incomplete";
  case "unpaid":
    return "unpaid";
  default:
    return "inactive";
  }
}

export function mapStripePriceIdToPlan(
  priceId: string | null | undefined,
): SubscriptionPlan {
  if (!priceId) return "free";
  if (priceId === STRIPE_PRICE_IDS.pro_lifetime) return "pro_lifetime";
  if (priceId === STRIPE_PRICE_IDS.pro_monthly) return "pro_monthly";
  if (priceId === STRIPE_PRICE_IDS.pro_yearly) return "pro_yearly";
  if (priceId === STRIPE_PRICE_IDS.plus_monthly) return "plus_monthly";
  if (priceId === STRIPE_PRICE_IDS.plus_yearly) return "plus_yearly";
  return "free";
}

export async function upsertSubscriptionForUser(input: {
  userId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  stripePriceId?: string | null;
  stripeSessionId?: string | null;
  currentPeriodStart?: Date | null;
  currentPeriodEnd?: Date | null;
  cancelAtPeriodEnd?: boolean;
  canceledAt?: Date | null;
}) {
  const payload = {
    plan: input.plan,
    status: input.status,
    stripeCustomerId: input.stripeCustomerId || null,
    stripeSubscriptionId: input.stripeSubscriptionId || null,
    stripePriceId: input.stripePriceId || null,
    stripeSessionId: input.stripeSessionId || null,
    currentPeriodStart: input.currentPeriodStart || null,
    currentPeriodEnd: input.currentPeriodEnd || null,
    cancelAtPeriodEnd: Boolean(input.cancelAtPeriodEnd),
    canceledAt: input.canceledAt || null,
  };

  const existing = await prisma.subscription.findFirst({
    where: { userId: input.userId },
    select: { id: true },
  });

  if (existing?.id) {
    return prisma.subscription.update({
      where: { id: existing.id },
      data: payload,
    });
  }

  return prisma.subscription.create({
    data: {
      userId: input.userId,
      ...payload,
    },
  });
}
