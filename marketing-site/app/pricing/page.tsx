import { Check, Sparkles, Mail, Clock } from "lucide-react";
import type { Metadata } from "next";
import { FEATURES } from "@/config/features";

export const metadata: Metadata = {
  title: "Pricing - Winzen",
  description:
    "Choose the perfect plan for your workflow. Lifetime access with a one-time payment.",
};

const essentialTierFeatures = [
  "Up to 6 desktop spaces",
  "Manual screenshot capture",
  "Keyboard shortcuts (⌘+D)",
  "Custom space names",
  "Native macOS integration",
  "Lifetime updates",
  "Email support",
];

const proTierFeatures = [
  "Everything in Essential, plus:",
  "Unlimited desktop spaces",
  "Auto-screenshot capture for all spaces",
  "Window containers & groups",
  "Advanced keyboard customization",
  "Custom themes (coming soon)",
  "Priority email support",
  "Early access to new features",
  "Lifetime updates",
];

export default function PricingPage() {
  // Show "Coming Soon" page if pricing is not enabled
  if (!FEATURES.PRICING_ENABLED) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-gray-950 dark:to-gray-900">
        {/* Header */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-full mb-8">
            <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
              Currently in Beta
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold mb-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600">
              Coming Soon
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-12">
            Winzen is currently in private beta. We're working hard to bring you
            the best desktop management experience for macOS.
          </p>
        </div>

        {/* Request Access Form */}
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">
              Request Early Access
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-center mb-8">
              Be among the first to experience Winzen when we launch. We'll
              notify you as soon as it's available.
            </p>

            <form className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white"
                  placeholder="Your name"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="usecase"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  How do you plan to use Winzen? (Optional)
                </label>
                <textarea
                  id="usecase"
                  name="usecase"
                  rows={3}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none text-gray-900 dark:text-white"
                  placeholder="Tell us about your workflow..."
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl"
              >
                <Mail className="w-5 h-5" />
                Request Early Access
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                We respect your privacy. Your email will only be used to notify
                you about Winzen's launch.
              </p>
            </div>
          </div>

          {/* What to Expect */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Early Access
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Get priority access when we launch
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-4">
                <Check className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Special Pricing
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Exclusive launch pricing for early adopters
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Updates
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Stay informed about our progress
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Full pricing page when enabled
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-gray-950 dark:to-gray-900">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <h1 className="text-5xl sm:text-6xl font-bold mb-6">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600">
            Simple, Transparent Pricing
          </span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          One-time payment. Lifetime access. No subscriptions, no hidden fees.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Essential Tier */}
          <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-3xl p-8">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Essential
              </h3>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-5xl font-bold text-gray-900 dark:text-white">
                  $49
                </span>
                <span className="text-gray-500">one-time</span>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Perfect for individuals and casual users
              </p>
            </div>

            <ul className="space-y-4 mb-8">
              {essentialTierFeatures.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            <a
              href="/checkout?plan=essential"
              className="block w-full px-6 py-3 border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:border-indigo-600 hover:text-indigo-600 dark:hover:border-indigo-500 dark:hover:text-indigo-400 transition-all text-center"
            >
              Get Essential
            </a>
          </div>

          {/* Pro Tier */}
          <div className="relative bg-gradient-to-br from-white to-indigo-50 dark:from-gray-800 dark:to-indigo-950/30 border-2 border-indigo-600 dark:border-indigo-500 rounded-3xl p-8 shadow-xl">
            {/* Popular Badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <div className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-full text-white text-sm font-medium shadow-lg">
                <Sparkles className="w-4 h-4" />
                Most Popular
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Pro
              </h3>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600">
                  $99
                </span>
                <span className="text-gray-500">one-time</span>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                For power users who demand the best
              </p>
            </div>

            <ul className="space-y-4 mb-8">
              {proTierFeatures.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <span
                    className={`${index === 0 ? "font-semibold text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300"}`}
                  >
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            <a
              href="/checkout?plan=pro"
              className="block w-full px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-all text-center shadow-lg"
            >
              Get Pro - $99
            </a>

            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
              One-time payment • Lifetime access • 30-day money-back guarantee
            </p>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="mt-24 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600">
              Feature Comparison
            </span>
          </h2>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left p-6 font-semibold text-gray-900 dark:text-white">
                    Feature
                  </th>
                  <th className="text-center p-6 font-semibold text-gray-900 dark:text-white">
                    Essential
                  </th>
                  <th className="text-center p-6 font-semibold bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400">
                    Pro
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="p-6 text-gray-700 dark:text-gray-300">
                    Desktop Spaces
                  </td>
                  <td className="p-6 text-center text-gray-600 dark:text-gray-400">
                    Up to 6
                  </td>
                  <td className="p-6 text-center bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-semibold">
                    Unlimited
                  </td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="p-6 text-gray-700 dark:text-gray-300">
                    Screenshot Capture
                  </td>
                  <td className="p-6 text-center text-gray-600 dark:text-gray-400">
                    Manual
                  </td>
                  <td className="p-6 text-center bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-semibold">
                    Automatic
                  </td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="p-6 text-gray-700 dark:text-gray-300">
                    Window Containers
                  </td>
                  <td className="p-6 text-center text-gray-400">—</td>
                  <td className="p-6 text-center bg-indigo-50 dark:bg-indigo-900/20">
                    <Check className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mx-auto" />
                  </td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="p-6 text-gray-700 dark:text-gray-300">
                    Advanced Shortcuts
                  </td>
                  <td className="p-6 text-center text-gray-400">—</td>
                  <td className="p-6 text-center bg-indigo-50 dark:bg-indigo-900/20">
                    <Check className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="p-6 text-gray-700 dark:text-gray-300">
                    Priority Support
                  </td>
                  <td className="p-6 text-center text-gray-600 dark:text-gray-400">
                    Email
                  </td>
                  <td className="p-6 text-center bg-indigo-50 dark:bg-indigo-900/20">
                    <Check className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mx-auto" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-24 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Pricing FAQ</h2>
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Is this really a one-time payment?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Yes! Pay once and own it forever. No subscriptions, no recurring
                charges, no hidden fees. Lifetime access includes all future
                updates.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                We accept all major credit cards, Apple Pay, and Google Pay via
                Stripe.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                What if I'm not satisfied?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                We offer a 30-day money-back guarantee. If you're not completely
                satisfied, we'll refund your purchase, no questions asked.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
