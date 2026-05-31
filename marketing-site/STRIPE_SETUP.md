# Stripe Integration Setup Guide

## 🚀 Quick Setup

### 1. Create Stripe Account
1. Go to [https://stripe.com](https://stripe.com)
2. Sign up for a free account
3. Complete your business profile

### 2. Get API Keys
1. Go to Developers → API Keys in Stripe Dashboard
2. Copy your **Publishable key** (starts with `pk_test_`)
3. Copy your **Secret key** (starts with `sk_test_`)

### 3. Create Products & Prices

#### Winzen Essential - One-time ($49)
1. Go to Products in Stripe Dashboard
2. Click "Add product"
3. Fill in:
   - **Name**: Winzen Essential
   - **Description**: Lifetime access to Winzen Essential
   - **Pricing model**: One-time
   - **Price**: $49.00
4. Click "Save product"
5. Copy the Price ID (starts with `price_`)

#### Winzen Pro - One-time ($99)
1. Go to Products in Stripe Dashboard
2. Click "Add product"
3. Fill in:
   - **Name**: Winzen Pro
   - **Description**: Lifetime access to Winzen Pro with all features
   - **Pricing model**: One-time
   - **Price**: $99.00
4. Click "Save product"
5. Copy the Price ID (starts with `price_`)

### 4. Configure Environment Variables

Create `.env.local` in the marketing-site directory:

```bash
# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE

# Stripe Price IDs
NEXT_PUBLIC_STRIPE_PRICE_ESSENTIAL=price_YOUR_ESSENTIAL_PRICE_ID
NEXT_PUBLIC_STRIPE_PRICE_PRO=price_YOUR_PRO_PRICE_ID

# Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:30231
```

### 5. Test the Integration

1. Start the dev server: `bun run dev`
2. Go to http://localhost:30231/pricing
3. Click "Get Essential" or "Get Pro"
4. Use Stripe test card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
   - ZIP: Any 5 digits

## 📝 Production Setup

### 1. Switch to Live Mode
1. Toggle to "Live mode" in Stripe Dashboard
2. Get new live API keys (start with `pk_live_` and `sk_live_`)
3. Create live products with real pricing

### 2. Update Environment Variables
```bash
# Use live keys
STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_PUBLISHABLE_KEY

# Update base URL to production domain
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

### 3. Configure Webhooks (Recommended)
1. Go to Developers → Webhooks in Stripe Dashboard
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. Copy webhook signing secret
5. Add to `.env.local`: `STRIPE_WEBHOOK_SECRET=whsec_...`

## 🎯 Features Implemented

✅ Two-tier lifetime pricing model
✅ Stripe Checkout integration
✅ Essential ($49) and Pro ($99) one-time plans
✅ Beautiful pricing page
✅ Secure checkout flow
✅ Success page with next steps
✅ 30-day money-back guarantee messaging
✅ Lifetime access to all updates

## 🔐 Security Notes

- Never commit `.env.local` to git (already in .gitignore)
- Use test keys for development
- Use live keys only in production
- Keep secret keys secret (server-side only)
- Publishable keys are safe for client-side

## 📚 Additional Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Checkout Guide](https://stripe.com/docs/payments/checkout)
- [Next.js + Stripe Tutorial](https://stripe.com/docs/stripe-js/react)
