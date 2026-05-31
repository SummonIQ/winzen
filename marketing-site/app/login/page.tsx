import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata: Metadata = {
  title: "Sign In - Winzen",
  description: "Sign in to your Winzen account.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const resolvedSearchParams = await searchParams;
  const nextParam = resolvedSearchParams.next;
  const redirectTo =
    (Array.isArray(nextParam) ? nextParam[0] : nextParam) || "/account";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 px-4 py-24 dark:from-gray-950 dark:via-gray-950 dark:to-blue-950/20">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-12 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-xl pt-10">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">
            Account access
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
            Your account becomes the control plane for Winzen.
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
            Sign in here, then use the same identity in the desktop app for
            upgrades, future sync, and entitlement checks.
          </p>
        </div>

        <AuthForm mode="login" redirectTo={redirectTo} />
      </div>
    </div>
  );
}
