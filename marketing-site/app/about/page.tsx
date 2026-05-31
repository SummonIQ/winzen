import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About - Winzen",
  description: "Why Winzen exists and how it approaches macOS workspace flow.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 px-4 py-24 dark:from-gray-950 dark:via-gray-950 dark:to-gray-900">
      <div className="mx-auto max-w-4xl">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">
          About Winzen
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
          Winzen exists to make macOS Spaces usable at speed.
        </h1>
        <div className="mt-8 space-y-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
          <p>
            The product focus is deliberate: reduce the friction between
            knowing where a workspace lives and getting there instantly.
          </p>
          <p>
            The website is evolving into more than a landing page. It is now
            the account boundary for authentication, billing, entitlements, and
            the future desktop control plane.
          </p>
          <p>
            That structure lets the desktop app stay focused on native macOS
            workflow while the marketing site owns identity and commerce.
          </p>
        </div>
      </div>
    </div>
  );
}
