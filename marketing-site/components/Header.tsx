"use client";

import Link from "next/link";
import { LogIn, SquaresExclude } from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { useSession } from "@/lib/auth/client";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const edgeOpacity = 0.7;
  const edgeBlur = 16;
  const edgeBrightness = 200;
  const bottomEdgeThicknessPx = 1;

  const isSignedIn = Boolean(session?.user);

  const navLinkClass = (active: boolean) =>
    `text-sm font-medium transition-colors ${
      active
        ? "text-indigo-600 dark:text-indigo-400"
        : "text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400"
    }`;

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="relative">
        <div
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            height: "200%",
            background:
              "linear-gradient(to bottom, rgb(var(--bg) / 1) 0%, rgb(var(--bg) / 0) 50%)",
            backdropFilter: "blur(22px) saturate(160%) brightness(1.15)",
            WebkitBackdropFilter: "blur(22px) saturate(160%) brightness(1.15)",
            maskImage:
              "linear-gradient(to bottom, black 0%, black 50%, transparent 50%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, black 0%, black 50%, transparent 50%, transparent 100%)",
          }}
        />

        <div className="relative z-10 mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 py-3">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center overflow-hidden">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/15 to-black/15" />
              <SquaresExclude className="relative z-10 w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-lg text-gray-900 dark:text-white">
              Winzen
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/#features"
              className={navLinkClass(pathname === "/")}
            >
              Features
            </Link>
            <Link
              href="/pricing"
              className={navLinkClass(pathname === "/pricing")}
            >
              Pricing
            </Link>
            <Link href="/changelog" className={navLinkClass(pathname === "/changelog")}>
              Changelog
            </Link>
            <Link href="/download" className={navLinkClass(pathname === "/download")}>
              Download
            </Link>
            {isSignedIn ? (
              <>
                <Link href="/account" className={navLinkClass(pathname === "/account")}>
                  Account
                </Link>
                <SignOutButton className="text-sm font-medium text-gray-600 transition hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400" />
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400"
                >
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Link>
                <Link
                  href="/download"
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Get Winzen
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6 text-gray-600 dark:text-gray-300"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {mobileMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-4">
            <div className="py-4 border-t border-gray-200 dark:border-gray-800">
              <div className="flex flex-col gap-4">
                <Link
                  href="/#features"
                  className={navLinkClass(pathname === "/")}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Features
                </Link>
                <Link
                  href="/pricing"
                  className={navLinkClass(pathname === "/pricing")}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Pricing
                </Link>
                <Link
                  href="/changelog"
                  className={navLinkClass(pathname === "/changelog")}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Changelog
                </Link>
                <Link
                  href="/download"
                  className={navLinkClass(pathname === "/download")}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Download
                </Link>
                {isSignedIn ? (
                  <>
                    <Link
                      href="/account"
                      className={navLinkClass(pathname === "/account")}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Account
                    </Link>
                    <SignOutButton className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100" />
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="rounded-lg bg-blue-600 px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-blue-700"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        <div
          className="pointer-events-none absolute -top-px left-0 right-0 z-20 h-0.5"
          style={{
            opacity: edgeOpacity,
            backdropFilter: `blur(${edgeBlur}px) saturate(250%) brightness(${edgeBrightness}%) contrast(120%)`,
            WebkitBackdropFilter: `blur(${edgeBlur}px) saturate(250%) brightness(${edgeBrightness}%) contrast(120%)`,
            maskImage:
              "linear-gradient(to top, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to top, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%)",
            filter: "blur(0.25px)",
          }}
        />

        <div
          className="pointer-events-none absolute inset-0 z-20"
          style={{
            height: "100%",
            transform: "translateY(100%)",
            background: "rgb(45 40 80 / 0.12)",
            backdropFilter:
              "blur(16px) brightness(180%) saturate(130%) contrast(110%)",
            WebkitBackdropFilter:
              "blur(16px) brightness(180%) saturate(130%) contrast(110%)",
            pointerEvents: "none",
            ["--thickness" as any]: `${bottomEdgeThicknessPx}px`,
            maskImage:
              "linear-gradient(to bottom, black 0, black var(--thickness), transparent var(--thickness))",
            WebkitMaskImage:
              "linear-gradient(to bottom, black 0, black var(--thickness), transparent var(--thickness))",
          }}
        />
      </div>
    </header>
  );
}
