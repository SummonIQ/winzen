"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { useAnalytics } from "@summoniq/signalsplash-client-sdk/react";
import { signIn, signUp, useSession } from "@/lib/auth/client";

type AuthMode = "login" | "signup";

type AuthFormProps = {
  mode: AuthMode;
  redirectTo: string;
};

export function AuthForm({ mode, redirectTo }: AuthFormProps) {
  const router = useRouter();
  const { data: session, isPending: sessionPending } = useSession();
  const { identify, track } = useAnalytics();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const isSignup = mode === "signup";

  useEffect(() => {
    if (!sessionPending && session?.user) {
      router.replace(redirectTo);
    }
  }, [redirectTo, router, session?.user, sessionPending]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (isSignup && password !== confirmPassword) {
      setError("Passwords do not match.");
      track(isSignup ? "signup_failed" : "login_failed", {
        method: "email",
        reason: "password_mismatch",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = isSignup
        ? await signUp.email({
            email,
            password,
            name: [firstName, lastName].filter(Boolean).join(" "),
          })
        : await signIn.email({
            email,
            password,
          });

      if (response.error) {
        setError(response.error.message || "Authentication failed.");
        setIsSubmitting(false);
        track(isSignup ? "signup_failed" : "login_failed", {
          method: "email",
          reason: response.error.code ?? "auth_error",
        });
        return;
      }

      const userId = (response.data as { user?: { id?: string; email?: string | null; name?: string | null } } | null)?.user?.id;
      const userEmail = (response.data as { user?: { email?: string | null } } | null)?.user?.email ?? email;
      if (userId) {
        identify(userId, {
          email: userEmail,
          firstName: firstName || undefined,
          lastName: lastName || undefined,
          name: [firstName, lastName].filter(Boolean).join(" ") || undefined,
        });
      }
      track(isSignup ? "signup_completed" : "login_success", {
        method: "email",
      });

      router.push(redirectTo);
      router.refresh();
    } catch (caughtError) {
      setError("Unable to reach the authentication service.");
      setIsSubmitting(false);
      track(isSignup ? "signup_failed" : "login_failed", {
        method: "email",
        reason: "unexpected_error",
      });
    }
  }

  return (
    <div className="w-full max-w-md rounded-3xl border border-gray-200/70 bg-white/80 p-8 shadow-[0_30px_80px_-45px_rgba(15,23,42,0.45)] backdrop-blur dark:border-white/10 dark:bg-gray-900/70">
      <div className="mb-8">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">
          {isSignup ? "Create account" : "Welcome back"}
        </p>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {isSignup ? "Start using Winzen across devices" : "Sign in to Winzen"}
        </h1>
        <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300">
          {isSignup
            ? "Create your account now so your desktop app can identify you for upgrades, backups, and future sync."
            : "Use the same account for the website, checkout flows, and future desktop entitlements."}
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {isSignup ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
                First name
              </span>
              <input
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                autoComplete="given-name"
                placeholder="Ada"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
                Last name
              </span>
              <input
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                autoComplete="family-name"
                placeholder="Lovelace"
              />
            </label>
          </div>
        ) : null}

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
            Email
          </span>
          <input
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
            placeholder="you@example.com"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
            Password
          </span>
          <input
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete={isSignup ? "new-password" : "current-password"}
            minLength={8}
            required
            placeholder="At least 8 characters"
          />
        </label>

        {isSignup ? (
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
              Confirm password
            </span>
            <input
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
              minLength={8}
              required
              placeholder="Repeat password"
            />
          </label>
        ) : null}

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-5 py-3.5 font-semibold text-white transition hover:from-indigo-500 hover:to-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {isSignup ? "Create account" : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-sm text-gray-600 dark:text-gray-300">
        {isSignup ? "Already have an account?" : "Need an account?"}{" "}
        <Link
          href={isSignup ? `/login?next=${encodeURIComponent(redirectTo)}` : `/signup?next=${encodeURIComponent(redirectTo)}`}
          className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          {isSignup ? "Sign in" : "Create one"}
        </Link>
      </p>
    </div>
  );
}
