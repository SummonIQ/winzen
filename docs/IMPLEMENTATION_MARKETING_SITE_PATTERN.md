# Marketing Site Setup And MacZen Pattern Plan

## Objective

Expand Winzen's marketing site to follow the stronger MacZen pattern for product marketing, public navigation, and conversion flows.

The goal is not to clone MacZen visually. The goal is to copy the structure and implementation pattern:

- clear top-level routes
- stronger public navigation
- download page
- pricing page
- changelog page
- account-aware upgrade flow
- API-backed checkout flow

## Reference Pattern From MacZen

MacZen includes a fuller marketing-site structure with:

- `/pricing`
- `/download`
- `/changelog`
- `/subscribe`
- richer header/footer navigation
- tracked download links
- Stripe-backed checkout routes
- account routes for authenticated desktop integration

Winzen already has:

- homepage
- pricing page
- checkout page
- download page
- about page
- docs page
- checkout session route

What is missing is a more complete public-product structure and stronger implementation consistency.

### MacZen Reference Files

- `~/Projects/maczen/apps/marketing-site/app/pricing/page.tsx`
- `~/Projects/maczen/apps/marketing-site/app/download/page.tsx`
- `~/Projects/maczen/apps/marketing-site/app/changelog/page.tsx`
- `~/Projects/maczen/apps/marketing-site/app/subscribe/page.tsx`
- `~/Projects/maczen/apps/marketing-site/app/_components/header.tsx`
- `~/Projects/maczen/apps/marketing-site/app/_components/footer.tsx`
- `~/Projects/maczen/apps/marketing-site/app/_components/tracked-download-link.tsx`

### Current Winzen Reference Files

- `marketing-site/app/page.tsx`
- `marketing-site/app/pricing/page.tsx`
- `marketing-site/app/download/page.tsx`
- `marketing-site/app/checkout/page.tsx`
- `marketing-site/components/Header.tsx`
- `marketing-site/app/api/create-checkout-session/route.ts`

## Recommended Public Routes

### Keep

- `/`
- `/pricing`
- `/download`
- `/about`

### Add

- `/changelog`
- `/login`
- `/signup`
- `/account`
- `/subscribe` or keep `/checkout` but consider cleaner separation

### Optional Later

- `/features`
- `/compare`
- `/roadmap`
- `/blog`

## Recommended Header Navigation

Top nav should include:

- Features
- Pricing
- Changelog
- Download
- Account or Sign In

This mirrors the MacZen pattern where download and changelog are first-class public pages, not buried.

## Recommended Footer Structure

- Product
- Pricing
- Download
- Changelog
- Docs
- Support / Contact
- Privacy / Terms

## Pricing Page Requirements

### Structural Improvements

- stronger plan comparison table
- monthly/yearly/lifetime support if used
- FAQ focused on billing and ownership
- clearer upgrade CTA paths
- account-aware "Manage plan" state when signed in

### Conversion Requirements

- plan buttons route to checkout or subscribe flow
- highlight best-value plan
- clearly explain which features are paid

## Download Page Requirements

The Winzen download page should follow the stronger MacZen pattern:

- hero with primary download CTA
- system requirements
- install steps
- download FAQ
- final CTA section

Recommended additions:

- app version and supported macOS versions
- notarization/signing status
- Apple Silicon / Intel support
- update policy

## Changelog Page Requirements

Winzen should add a public changelog page because it helps:

- trust
- launch polish
- SEO
- existing users evaluating updates

### Content Structure

Per release include:

- release date
- version
- release title
- summary
- bullet list of changes

### CTA Requirements

- download latest version
- view pricing

## Subscribe / Checkout Flow

MacZen separates public pricing from the actual purchase flow via `/subscribe`.

Recommended Winzen pattern:

- `/pricing` for plan comparison and objections
- `/subscribe` or `/checkout` for focused purchase UI

This keeps:

- pricing page persuasive
- purchase page task-focused

## Account-Aware Marketing Site

Once auth exists, the site should become lightly account-aware.

### Signed-Out

- Sign In
- Get Winzen

### Signed-In

- Account
- Manage plan
- Download

## API Route Requirements

In addition to checkout:

- `/api/auth/[...all]`
- `/api/account/me`
- `/api/account/entitlements`
- `/api/billing-portal`
- `/api/webhooks/stripe`

These routes let the marketing site act as the control plane for the desktop app.

## Analytics And Tracking

MacZen uses tracked download links. Winzen should adopt the same idea.

Track:

- download button clicked
- pricing CTA clicked
- checkout started
- checkout completed
- changelog CTA clicked

Use:

- Vercel Analytics or existing analytics choice
- lightweight custom event wrappers

## Content Strategy

### Homepage

Position Winzen as:

- the fastest way to control Spaces on macOS
- the easiest way to restore workspace context
- a premium utility for people with serious desktop workflows

### Pricing

Explain:

- what free includes
- why Pro exists
- why cloud features justify recurring plans if offered

### Download

Reduce friction:

- exactly what to click
- exactly what permissions are needed
- exactly what happens on first run

### Changelog

Show momentum:

- reliability improvements
- new workflow features
- polish

## Design Notes

MacZen's pattern is route- and funnel-oriented, not just page-oriented. Winzen should preserve its own visual identity, but the route structure should become more complete and predictable.

Recommended route flow:

1. user discovers homepage
2. user checks pricing
3. user checks download and install trust
4. user downloads or signs in
5. user returns to account/billing as needed

## Environment And Deployment Requirements

- production app URL
- download artifact hosting strategy
- latest DMG publishing process
- changelog update process per release

## Recommended File Additions

Within `marketing-site`:

- `app/changelog/page.tsx`
- `app/login/page.tsx`
- `app/signup/page.tsx`
- `app/account/page.tsx`
- maybe `app/subscribe/page.tsx`
- tracked download link helper
- account-aware header/footer

## Rollout Plan

### Phase 1

- add changelog route
- update header/footer nav
- improve download page structure

### Phase 2

- add auth pages
- add account page
- separate subscribe/checkout route if desired

### Phase 3

- account-aware pricing/download CTAs
- tracked download events
- release/changelog publishing workflow

## Deliverables

- fuller public website structure
- MacZen-style route pattern adapted to Winzen
- clearer marketing funnel from homepage to paid conversion
- public changelog and stronger download experience
