# Feature Flags

This directory contains feature flag configuration for the marketing site.

## How to Use

### Enable/Disable Pricing

To toggle between the full pricing model and "Coming Soon" beta mode, edit `features.ts`:

```typescript
export const FEATURES = {
  PRICING_ENABLED: false, // Set to true to enable pricing
} as const
```

### Modes

**When `PRICING_ENABLED: false` (Beta Mode):**
- Home page shows "Request Access" CTAs with "Beta" badges
- Pricing page displays "Coming Soon" with early access request form
- Header button says "Request Access"
- Messaging emphasizes "Private Beta" and "Limited Spots"

**When `PRICING_ENABLED: true` (Launch Mode):**
- Home page shows "Get Winzen" CTAs with "Lifetime Access" badges
- Pricing page displays full Essential ($49) and Pro ($99) pricing
- Header button says "Get Started"
- Messaging emphasizes "One-time Payment" and pricing details

### Single Point of Control

All feature flags are defined in `/config/features.ts`. Simply change the value from `false` to `true` when you're ready to launch, and the entire site updates automatically.

No need to search through multiple files or components - just one variable change!
