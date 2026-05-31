import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth/server";
import { FEATURE_KEYS, getEntitlementsFromSubscription } from "@/lib/entitlements";
import { findLatestSubscriptionForUser } from "@/lib/subscriptions";
import { SignOutButton } from "@/components/auth/SignOutButton";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Account - Winzen",
  description: "View your Winzen account and entitlement state.",
};

const featureDescriptions: Record<(typeof FEATURE_KEYS)[number], string> = {
  "layouts.unlimited": "Unlimited saved layouts and workspace templates",
  "rules.advanced": "Advanced rules and workspace automation",
  "restore.auto": "Automatic session and login restore flows",
  "monitors.multi": "Multi-monitor-aware space orchestration",
  "backup.cloud": "Cloud backup and settings sync",
  "automation.api": "Future automation and API integrations",
};

export default async function AccountPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login?next=/account");
  }

  const subscription = await findLatestSubscriptionForUser(session.user.id);

  const entitlements = getEntitlementsFromSubscription(
    subscription
      ? { plan: subscription.plan, status: subscription.status }
      : null,
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 px-4 py-24 dark:from-gray-950 dark:via-gray-950 dark:to-gray-900">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">
              Account
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
              {session.user.name || session.user.email}
            </h1>
            <p className="mt-3 text-base text-gray-600 dark:text-gray-300">
              {session.user.email}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/pricing"
              className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-indigo-500 hover:text-indigo-600 dark:border-gray-700 dark:text-gray-200 dark:hover:border-indigo-400 dark:hover:text-indigo-300"
            >
              View plans
            </Link>
            <SignOutButton className="rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100" />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-3xl border border-gray-200/70 bg-white/90 p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.45)] dark:border-white/10 dark:bg-gray-900/70">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Entitlements
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              This is the account payload the desktop app will use as its source
              of truth for feature access.
            </p>

            <div className="mt-6 space-y-4">
              {FEATURE_KEYS.map((featureKey) => (
                <div
                  key={featureKey}
                  className="flex items-start justify-between gap-4 rounded-2xl border border-gray-200/80 bg-slate-50/90 px-4 py-4 dark:border-white/10 dark:bg-gray-950/70"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {featureKey}
                    </p>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                      {featureDescriptions[featureKey]}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${
                      entitlements[featureKey]
                        ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                        : "bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    }`}
                  >
                    {entitlements[featureKey] ? "Enabled" : "Locked"}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-3xl border border-gray-200/70 bg-white/90 p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.45)] dark:border-white/10 dark:bg-gray-900/70">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Subscription state
              </h2>

              <dl className="mt-6 space-y-4 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-gray-600 dark:text-gray-300">Plan</dt>
                  <dd className="font-semibold text-gray-900 dark:text-white">
                    {subscription?.plan || "free"}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-gray-600 dark:text-gray-300">Status</dt>
                  <dd className="font-semibold text-gray-900 dark:text-white">
                    {subscription?.status || "inactive"}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-gray-600 dark:text-gray-300">
                    Current period end
                  </dt>
                  <dd className="font-semibold text-gray-900 dark:text-white">
                    {subscription?.currentPeriodEnd
                      ? subscription.currentPeriodEnd.toLocaleDateString()
                      : "N/A"}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="rounded-3xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50 to-blue-50 p-8 dark:border-indigo-500/20 dark:bg-gradient-to-br dark:from-indigo-950/30 dark:to-blue-950/20">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Next step
              </h2>
              <p className="mt-3 text-sm leading-6 text-gray-700 dark:text-gray-300">
                Authentication is wired. The next layer is Stripe-backed
                checkout, billing state sync, and desktop entitlement refresh.
              </p>
              <Link
                href="/pricing"
                className="mt-5 inline-flex rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
              >
                Explore plans
              </Link>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
