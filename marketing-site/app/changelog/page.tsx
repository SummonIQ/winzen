import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Changelog - Winzen",
  description: "Track the product progress and release history for Winzen.",
};

const releases = [
  {
    version: "0.2.0",
    date: "March 6, 2026",
    title: "Accounts and entitlement groundwork",
    summary:
      "Introduced the first account-aware foundation for the marketing site and future desktop integration.",
    changes: [
      "Added Better Auth and Prisma-backed account infrastructure",
      "Created account identity and entitlement API routes",
      "Added login, signup, and account pages",
    ],
  },
  {
    version: "0.1.0",
    date: "October 28, 2025",
    title: "Initial public launch site",
    summary:
      "Published the first Winzen landing, download, pricing, and checkout experience.",
    changes: [
      "Launched the homepage and download page",
      "Added initial Stripe checkout integration",
      "Published early pricing structure for beta users",
    ],
  },
];

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 px-4 py-24 dark:from-gray-950 dark:via-gray-950 dark:to-gray-900">
      <div className="mx-auto max-w-4xl">
        <div className="mb-14">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">
            Changelog
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
            Product progress, shipped in public.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-gray-600 dark:text-gray-300">
            Winzen is still early. The changelog makes the trajectory visible
            for customers evaluating updates and launch readiness.
          </p>
        </div>

        <div className="space-y-8">
          {releases.map((release) => (
            <article
              key={release.version}
              className="rounded-3xl border border-gray-200/70 bg-white/90 p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.45)] dark:border-white/10 dark:bg-gray-900/70"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.14em] text-indigo-600 dark:text-indigo-400">
                    Version {release.version}
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                    {release.title}
                  </h2>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {release.date}
                </p>
              </div>

              <p className="mt-4 text-base leading-7 text-gray-600 dark:text-gray-300">
                {release.summary}
              </p>

              <ul className="mt-6 space-y-3">
                {release.changes.map((change) => (
                  <li
                    key={change}
                    className="rounded-2xl border border-gray-200/80 bg-slate-50/90 px-4 py-3 text-sm text-gray-700 dark:border-white/10 dark:bg-gray-950/70 dark:text-gray-200"
                  >
                    {change}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
