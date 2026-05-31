# Subscription And Stripe Implementation Plan

## Objective

Add subscription and entitlement infrastructure to Winzen using the same general API-route pattern MacZen uses, while adapting the product model to Winzen's pricing and feature gating.

This document depends on authenticated users, but authentication design is intentionally separated into `IMPLEMENTATION_AUTHENTICATION.md`.

## Product Direction

Winzen should support:

- free tier
- paid Pro lifetime or recurring plan options
- optional Plus subscription for cloud backup, sync, and advanced services

The desktop app will require users to sign in to unlock subscription-based features and sync entitlements from the server.

## Reference Pattern From MacZen

MacZen uses:

- `lib/stripe.ts` for Stripe client and price IDs
- `app/api/checkout/route.ts` for checkout session creation
- `app/api/webhooks/stripe/route.ts` for Stripe event processing
- `app/api/billing-portal/route.ts` for subscription management
- `app/api/account/me/route.ts`
- `app/api/account/entitlements/route.ts`
- Prisma models for `Subscription`
- helper mapping in `lib/subscriptions.ts`

Winzen should mirror this structure closely in `marketing-site`, even if the first plan mix differs.

### MacZen Reference Files

- `~/Projects/maczen/apps/marketing-site/lib/stripe.ts`
- `~/Projects/maczen/apps/marketing-site/lib/subscriptions.ts`
- `~/Projects/maczen/apps/marketing-site/app/api/checkout/route.ts`
- `~/Projects/maczen/apps/marketing-site/app/api/billing-portal/route.ts`
- `~/Projects/maczen/apps/marketing-site/app/api/webhooks/stripe/route.ts`
- `~/Projects/maczen/apps/marketing-site/app/api/account/me/route.ts`
- `~/Projects/maczen/apps/marketing-site/app/api/account/entitlements/route.ts`
- `~/Projects/maczen/apps/marketing-site/prisma/schema.prisma`

### Current Winzen Reference Files

- `marketing-site/app/api/create-checkout-session/route.ts`
- `marketing-site/app/pricing/page.tsx`
- `marketing-site/app/checkout/page.tsx`
- `marketing-site/STRIPE_SETUP.md`

## Pricing Model Recommendation

### Suggested Structure

- `free`
- `pro_lifetime`
- `pro_monthly`
- `pro_yearly`
- `plus_monthly`
- `plus_yearly`

If you want to keep launch simpler, start with:

- `free`
- `pro_lifetime`
- `plus_yearly`

That preserves one-time monetization while leaving room for recurring cloud services.

## Feature Gating Recommendation

### Free

- basic Space switching
- custom Space names
- basic screenshots
- limited history
- limited layouts/rules

### Pro

- unlimited layouts
- advanced rules
- session restore
- monitor-aware workflows
- richer tray controls

### Plus

- cloud backup
- sync
- multi-device restore
- shared/team features later

## Repository Placement

Recommended `marketing-site` additions:

- `lib/stripe.ts`
- `lib/subscriptions.ts`
- `lib/entitlements.ts`
- `app/api/checkout/route.ts`
- `app/api/billing-portal/route.ts`
- `app/api/webhooks/stripe/route.ts`
- `app/api/account/me/route.ts`
- `app/api/account/entitlements/route.ts`

## Prisma Data Model

Add a `Subscription` model plus plan/status enums in the same style as MacZen.

### SubscriptionPlan Enum

Suggested:

- `free`
- `pro_lifetime`
- `pro_monthly`
- `pro_yearly`
- `plus_monthly`
- `plus_yearly`

### SubscriptionStatus Enum

- `inactive`
- `active`
- `trialing`
- `past_due`
- `canceled`
- `incomplete`
- `unpaid`

### Subscription Model Fields

- `id`
- `userId`
- `plan`
- `status`
- `stripeCustomerId`
- `stripeSubscriptionId`
- `stripePriceId`
- `stripeSessionId`
- `currentPeriodStart`
- `currentPeriodEnd`
- `cancelAtPeriodEnd`
- `canceledAt`
- timestamps

## Stripe Requirements

This is the minimum Stripe setup Winzen needs.

### Stripe Account Setup

- Stripe account with business details completed
- test and live API keys
- webhook endpoint configured
- billing portal enabled if recurring plans are used

### Required Products And Prices

At minimum create:

- Winzen Pro Lifetime
- Winzen Pro Monthly
- Winzen Pro Yearly
- Winzen Plus Monthly
- Winzen Plus Yearly

If launch is simpler, unused prices can be deferred, but the code should support plan expansion cleanly.

### Required Environment Variables

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_APP_URL`
- `STRIPE_PRICE_ID_PRO_LIFETIME`
- `STRIPE_PRICE_ID_PRO_MONTHLY`
- `STRIPE_PRICE_ID_PRO_YEARLY`
- `STRIPE_PRICE_ID_PLUS_MONTHLY`
- `STRIPE_PRICE_ID_PLUS_YEARLY`

Optional:

- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

### Stripe Webhook Events Required

- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `checkout.session.async_payment_failed`
- `charge.refunded`

If using disputes/workflow revocation:

- `charge.dispute.created`

### Stripe Billing Portal

Required if recurring subscriptions are offered.

Capabilities:

- cancel subscription
- update payment method
- switch plans later
- view billing history

### Stripe Checkout Session Requirements

Each session should include metadata:

- `userId`
- `email`
- `planType`

Mode:

- `payment` for lifetime purchase
- `subscription` for recurring plans

## Backend Responsibilities

### Checkout Route

Responsibilities:

- rate limit request
- validate authenticated session or supplied email
- resolve plan type to Stripe price ID
- create/reuse Stripe customer
- create checkout session
- return `url` and `sessionId`

### Webhook Route

Responsibilities:

- verify Stripe signature
- sync subscription state to database
- upgrade/downgrade entitlements
- revoke access on refunds/cancellations where appropriate
- handle lifetime purchases separately from subscriptions

### Billing Portal Route

Responsibilities:

- require authenticated user
- look up Stripe customer ID
- create Stripe billing portal session

### Account Routes

These routes should be the desktop app's source of truth.

#### `/api/account/me`

Return:

- `authenticated`
- `user`
- `subscription`
- `entitlements`

#### `/api/account/entitlements`

Return:

- `authenticated`
- `entitlements`

This route is especially useful for the Electron app to perform frequent lightweight entitlement checks.

## Entitlements Layer

Do not hardcode plan checks all over the desktop app. Add a mapping layer.

Example feature keys:

- `layouts.unlimited`
- `rules.advanced`
- `restore.auto`
- `monitors.multi`
- `backup.cloud`
- `automation.api`

Create a helper:

- `getEntitlementsFromSubscription(subscription)`

This should mirror MacZen's entitlements pattern conceptually.

## Desktop App Integration

### On Sign In

1. desktop app authenticates user
2. desktop app fetches `/api/account/me`
3. store:
   - user identity
   - subscription state
   - entitlements

### During Runtime

- periodically refresh entitlements
- refresh on app focus
- refresh after checkout success

### UI Requirements

- locked feature states
- upgrade CTA
- account panel
- restore entitlements after restart

## Upgrade Flow

### Recommended

1. user clicks locked feature
2. desktop app shows why feature is gated
3. user clicks upgrade
4. app opens website pricing/checkout flow
5. after purchase, desktop app refreshes `/api/account/me`

## CORS Requirements

The desktop app must be allowed to call account and billing-related routes.

Follow MacZen's pattern:

- explicit trusted origins
- `OPTIONS` handlers for desktop-consumed routes
- `applyCors` helper

Routes needing desktop-safe CORS:

- `/api/account/me`
- `/api/account/entitlements`
- `/api/billing-portal`
- future `/api/account/backups`

## Handling One-Time And Recurring Plans Together

Winzen may mix lifetime and recurring revenue. The model must support both.

### Lifetime

- `mode = payment`
- mark plan active permanently unless refunded/revoked

### Recurring

- `mode = subscription`
- status driven by Stripe subscription lifecycle

## Failure Handling

- checkout creation failure
- webhook signature failure
- missing Stripe price IDs
- customer exists but no subscription row
- entitlement drift between Stripe and DB
- desktop app still cached old entitlements

## Operational Requirements

- admin observability on subscription sync failures
- logs for webhook processing
- replay-friendly idempotent webhook handling
- migration plan for future plan changes

## Testing Requirements

- free user entitlement set
- lifetime purchase
- monthly purchase
- yearly purchase
- cancellation at period end
- subscription renewal
- payment failure
- refund
- desktop entitlement refresh after purchase

## Rollout Plan

### Phase 1

- Prisma subscription model
- Stripe helper config
- checkout route
- webhook route
- `/api/account/me`
- `/api/account/entitlements`

### Phase 2

- billing portal
- full entitlement gating in desktop app
- locked feature UI

### Phase 3

- plan upgrades/downgrades
- cloud backup/sync billing tie-in
- admin ops tooling

## Deliverables

- authenticated subscription model
- Stripe checkout and webhook sync
- entitlement endpoint for desktop client
- billing portal support
- clear feature gating strategy
