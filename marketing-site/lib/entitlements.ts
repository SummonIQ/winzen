import { SubscriptionPlan, SubscriptionStatus } from "@prisma/client";

export const FEATURE_KEYS = [
  "layouts.unlimited",
  "rules.advanced",
  "restore.auto",
  "monitors.multi",
  "backup.cloud",
  "automation.api",
] as const;

export type FeatureKey = (typeof FEATURE_KEYS)[number];

export type FeatureEntitlements = Record<FeatureKey, boolean>;

export const DEFAULT_ENTITLEMENTS: FeatureEntitlements = {
  "layouts.unlimited": false,
  "rules.advanced": false,
  "restore.auto": false,
  "monitors.multi": false,
  "backup.cloud": false,
  "automation.api": false,
};

const ACTIVE_STATUSES = new Set<SubscriptionStatus>(["active", "trialing"]);

export function getEntitlementsFromSubscription(input: {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
} | null): FeatureEntitlements {
  if (!input || !ACTIVE_STATUSES.has(input.status)) {
    return DEFAULT_ENTITLEMENTS;
  }

  switch (input.plan) {
  case "pro_lifetime":
  case "pro_monthly":
  case "pro_yearly":
    return {
      "layouts.unlimited": true,
      "rules.advanced": true,
      "restore.auto": true,
      "monitors.multi": true,
      "backup.cloud": false,
      "automation.api": false,
    };
  case "plus_monthly":
  case "plus_yearly":
    return {
      "layouts.unlimited": true,
      "rules.advanced": true,
      "restore.auto": true,
      "monitors.multi": true,
      "backup.cloud": true,
      "automation.api": true,
    };
  case "free":
  default:
    return DEFAULT_ENTITLEMENTS;
  }
}
