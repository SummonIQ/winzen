# Authentication Implementation Plan

## Objective

Add first-party user authentication to Winzen using the same general pattern MacZen uses in its marketing site:

- Next.js API routes as the auth boundary
- server-side auth library setup
- database-backed users and sessions
- desktop app signs in through the website/backend
- desktop app fetches authenticated account state

This document intentionally does not define subscription and billing logic in detail. That is handled in `IMPLEMENTATION_SUBSCRIPTIONS_AND_STRIPE.md`.

## Product Requirements

- Users can create an account on the website
- Users can sign in from the desktop app
- Desktop app can maintain session state securely
- Backend can identify the user for future subscription, sync, and backup features
- Auth should support both website and desktop app origins

## Reference Pattern From MacZen

MacZen uses:

- `better-auth` server configuration in `apps/marketing-site/lib/auth/server.ts`
- Next.js route handler in `app/api/auth/[...all]/route.ts`
- database-backed `User`, `Session`, `Account`, and `Verification` Prisma models
- trusted origins that include both website and desktop app development origins
- account APIs like:
  - `/api/account/me`
  - `/api/account/entitlements`

Winzen should follow the same pattern, adapted to this repository structure.

### MacZen Reference Files

- `~/Projects/maczen/apps/marketing-site/lib/auth/server.ts`
- `~/Projects/maczen/apps/marketing-site/app/api/auth/[...all]/route.ts`
- `~/Projects/maczen/apps/marketing-site/app/api/account/me/route.ts`
- `~/Projects/maczen/apps/marketing-site/prisma/schema.prisma`

### Current Winzen Reference Files

- `marketing-site/app/api/create-checkout-session/route.ts`
- `marketing-site/app/pricing/page.tsx`
- `desktop-app/src/main/main.ts`

## Recommended Auth Stack

### Primary Recommendation

- Better Auth
- Prisma
- Postgres

Reasoning:

- aligns with MacZen pattern
- gives website and API route cohesion
- works well for session-based auth
- easy to extend for desktop client access

## High-Level Architecture

### Marketing Site

Responsible for:

- sign-up UI
- sign-in UI
- auth API routes
- session cookie issuance
- account APIs

### Desktop App

Responsible for:

- opening sign-in flow
- receiving successful login state
- storing desktop-safe session information
- calling authenticated account endpoints

### Database

Stores:

- users
- sessions
- accounts
- verification tokens

## Repository Placement

Recommended additions in `marketing-site`:

- `lib/auth/server.ts`
- `lib/auth/client.ts`
- `lib/prisma.ts`
- `prisma/schema.prisma`
- `app/api/auth/[...all]/route.ts`
- `app/api/account/me/route.ts`

Optional UI additions:

- `app/login/page.tsx`
- `app/signup/page.tsx`
- `app/account/page.tsx`

## Data Model

Minimum Prisma models:

- `User`
- `Session`
- `Account`
- `Verification`

### User Fields

- `id`
- `email`
- `name`
- `firstName` optional
- `lastName` optional
- `emailVerified`
- `image` optional
- timestamps

## Session Strategy

### Website

- HTTP-only cookie session
- same-site lax
- secure in production

### Desktop App

Desktop needs authenticated access too. There are two reasonable options.

#### Option A: Shared Website Session With Trusted Origin

- desktop opens website auth UI
- backend trusts desktop origin
- desktop can call account APIs if session cookies are available in the embedded/browser flow

Risk:

- cookie handling between Electron and Next auth flow can get tricky

#### Option B: Desktop Login Callback + Token Exchange

- desktop opens browser to hosted login page
- after login, browser redirects to a custom scheme or localhost callback
- desktop receives a one-time auth code
- desktop exchanges it for a durable app session/token

Recommendation:

- start with Better Auth for website session
- add a desktop-specific auth bridge once basic auth is working

## Trusted Origins

Winzen should mirror the MacZen approach and explicitly trust:

- production marketing site origin
- local marketing site origin
- desktop app dev origin if applicable
- any local callback origin used for desktop login

## Desktop Sign-In Flow

### Recommended Flow

1. User clicks "Sign in" in desktop app
2. App opens marketing site auth page in system browser
3. User authenticates
4. Website redirects to:
   - custom protocol like `winzen://auth/callback?...`
   - or localhost callback receiver
5. Desktop app validates callback payload with backend
6. Desktop app stores app session securely
7. Desktop app calls `/api/account/me`

## Desktop Storage Requirements

Do not store raw credentials.

Use:

- Keychain / secure OS storage where possible
- encrypted session token if app-specific token flow is used

Avoid:

- plain localStorage for durable auth secrets

## Required API Routes

### Core

- `app/api/auth/[...all]/route.ts`
- `app/api/account/me/route.ts`

### Likely Needed Soon

- `app/api/account/session/route.ts`
- `app/api/account/logout/route.ts`

### Desktop Bridge Candidates

- `app/api/desktop-auth/start/route.ts`
- `app/api/desktop-auth/exchange/route.ts`

## Account Me Route

This route should mirror MacZen's pattern:

- validate session
- return:
  - `authenticated`
  - `user`
  - later: `subscription`
  - later: `entitlements`

This route becomes the single "who am I and what do I have access to" endpoint used by the desktop client.

## CORS Requirements

The desktop app will need API access from outside the website origin. Follow the MacZen pattern:

- explicit allowlist of origins
- helper functions for:
  - `applyCors`
  - `buildOptionsResponse`

Routes likely needing desktop CORS:

- `/api/account/me`
- `/api/account/entitlements`
- future sync and backup routes

## UI Requirements

### Website

- login page
- signup page
- forgot password later
- account page

### Desktop App

- signed-out empty state
- sign-in CTA in settings
- signed-in profile section
- sign-out action
- session expired state

## Error States

- invalid credentials
- unverified email if enabled
- session expired
- network unavailable
- server unavailable
- desktop callback timeout

## Security Requirements

- secure cookie settings
- CSRF handled by auth library
- rate limiting on auth routes
- brute force protections
- audit logs for login/logout later
- email verification optional for first release, but recommended if cloud backup will exist

## Dependencies

- database provisioning
- Prisma migrations
- environment variables for database and app URLs
- desktop auth callback design

## Environment Variables

Recommended:

- `DATABASE_URL`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_DESKTOP_APP_URL`
- `BETTER_AUTH_SECRET` or equivalent auth secret

## Testing Requirements

- website signup
- website login
- desktop login callback
- desktop logout
- session persistence across restart
- trusted origin CORS behavior

## Rollout Plan

### Phase 1

- Prisma schema
- Better Auth server setup
- auth route
- login/signup website UI

### Phase 2

- account/me route
- desktop sign-in flow
- secure local session storage

### Phase 3

- desktop session refresh
- richer account screen
- password reset / email verification

## Deliverables

- working auth stack in marketing site
- desktop login flow
- account identity endpoint
- documentation for environment and local setup
