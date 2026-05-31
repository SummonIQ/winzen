import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Docs - Winzen",
  description: "Implementation notes and planning docs for Winzen.",
};

const docLinks = [
  {
    href: "/pricing",
    label: "Pricing",
    description: "Current plan and checkout entry point.",
  },
  {
    href: "/changelog",
    label: "Changelog",
    description: "Public-facing release history and progress.",
  },
  {
    href: "/account",
    label: "Account",
    description: "Authenticated identity and entitlement view.",
  },
];

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 px-4 py-24 dark:from-gray-950 dark:via-gray-950 dark:to-gray-900">
      <div className="mx-auto max-w-4xl">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">
          Docs
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
          Product and implementation entry points.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-gray-600 dark:text-gray-300">
          The formal planning documents live in the repo. The public docs page
          now points at the main site surfaces tied to those implementation
          tracks.
        </p>

        <div className="mt-10 space-y-4">
          {docLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block rounded-3xl border border-gray-200/70 bg-white/90 p-6 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.45)] transition hover:border-indigo-300 hover:shadow-[0_30px_70px_-40px_rgba(79,70,229,0.35)] dark:border-white/10 dark:bg-gray-900/70 dark:hover:border-indigo-500/30"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {link.label}
                  </h2>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                    {link.description}
                  </p>
                </div>
                <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                  Open
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
