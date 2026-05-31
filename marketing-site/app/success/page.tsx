import { Check, Download, Sparkles } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "/success" },
  description: "Winzen checkout success and next steps.",
  robots: {
    follow: false,
    index: false,
  },
  title: "Checkout Complete - Winzen",
};

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-gray-950 dark:to-gray-900 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white dark:bg-gray-800 rounded-3xl border-2 border-blue-500 dark:border-blue-600 p-8 md:p-12 text-center shadow-2xl">
          {/* Success Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-indigo-600 to-blue-600 mb-6">
            <Check className="w-10 h-10 text-white" />
          </div>

          <h1 className="text-4xl font-bold mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600">
              Welcome to Winzen Pro!
            </span>
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Your payment was successful. You now have access to all Pro
            features!
          </p>

          {/* What's Next */}
          <div className="bg-indigo-50 dark:bg-indigo-950/30 rounded-xl p-6 mb-8 text-left border border-indigo-200 dark:border-indigo-900">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              What's Next
            </h2>
            <ol className="space-y-3">
              <li className="flex gap-3">
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                  1.
                </span>
                <span className="text-gray-700 dark:text-gray-300">
                  Download Winzen if you haven't already
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                  2.
                </span>
                <span className="text-gray-700 dark:text-gray-300">
                  Check your email for your license key
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                  3.
                </span>
                <span className="text-gray-700 dark:text-gray-300">
                  Enter your license key in Winzen settings
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                  4.
                </span>
                <span className="text-gray-700 dark:text-gray-300">
                  Enjoy unlimited spaces and all Pro features!
                </span>
              </li>
            </ol>
          </div>

          {/* Pro Features */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 mb-8 text-left">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              You Now Have Access To:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                "Unlimited spaces",
                "Auto-screenshots",
                "Window containers",
                "Advanced shortcuts",
                "Priority support",
                "All future updates",
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-all shadow-lg"
            >
              <Download className="w-5 h-5" />
              Download Winzen
            </a>
            <Link
              href="/docs"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:border-indigo-600 hover:text-indigo-600 dark:hover:border-indigo-500 dark:hover:text-indigo-400 transition-all"
            >
              View Documentation
            </Link>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400 mt-8">
            Questions? Email us at{" "}
            <a
              href="mailto:support@winzen.app"
              className="text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              support@winzen.app
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
