"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";

const plans = {
  essential: {
    name: "Winzen Essential",
    price: "$49",
    period: "one-time",
    savings: null,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ESSENTIAL!,
    features: [
      "Up to 6 desktop spaces",
      "Manual screenshot capture",
      "Keyboard shortcuts (⌘+D)",
      "Custom space names",
      "Native macOS integration",
      "Lifetime updates",
      "Email support",
      "30-day money-back guarantee",
    ],
  },
  pro: {
    name: "Winzen Pro",
    price: "$99",
    period: "one-time",
    savings: "Most popular",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO!,
    features: [
      "Everything in Essential, plus:",
      "Unlimited desktop spaces",
      "Auto-screenshot capture",
      "Window containers & groups",
      "Advanced keyboard customization",
      "Priority email support",
      "Early access to new features",
      "Lifetime updates",
      "30-day money-back guarantee",
    ],
  },
} as const;

type CheckoutClientProps = {
  initialPlanId: keyof typeof plans;
};

export function CheckoutClient({ initialPlanId }: CheckoutClientProps) {
  const planId = initialPlanId in plans ? initialPlanId : "pro";
  const plan = plans[planId];

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId: plan.priceId,
          planName: plan.name,
        }),
      });

      const { url, error: responseError } = await response.json();

      if (responseError) {
        setError(responseError);
        setLoading(false);
        return;
      }

      if (!url) {
        setError("Checkout session did not return a URL.");
        setLoading(false);
        return;
      }

      window.location.assign(url);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white dark:bg-gray-800 border-2 border-indigo-600 dark:border-indigo-500 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          {plan.name}
        </h2>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600">
            {plan.price}
          </span>
          <span className="text-gray-500">{plan.period}</span>
        </div>

        {plan.savings ? (
          <p className="text-green-600 dark:text-green-400 font-medium mb-6">
            {plan.savings}
          </p>
        ) : null}

        <ul className="space-y-3 mb-8">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <Check className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <span
                className={`${index === 0 && planId === "pro" ? "font-semibold text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300"}`}
              >
                {feature}
              </span>
            </li>
          ))}
        </ul>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>Subtotal</span>
            <span>{plan.price}</span>
          </div>
          <div className="flex items-center justify-between text-lg font-bold text-gray-900 dark:text-white">
            <span>Total</span>
            <span>
              {plan.price}{" "}
              <span className="text-sm font-normal text-gray-500">
                {plan.period}
              </span>
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Payment Details
        </h3>

        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full mb-4 px-6 py-4 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>Proceed to Secure Checkout</>
          )}
        </button>

        {error ? (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        ) : null}

        <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-start gap-2">
            <Check className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <span>Secure payment powered by Stripe</span>
          </div>
          <div className="flex items-start gap-2">
            <Check className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <span>30-day money-back guarantee</span>
          </div>
          <div className="flex items-start gap-2">
            <Check className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <span>Lifetime access with all future updates</span>
          </div>
          <div className="flex items-start gap-2">
            <Check className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <span>Instant activation after payment</span>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            By proceeding, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>

        <div className="mt-6 p-4 bg-slate-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-700 dark:text-gray-300 text-center mb-3">
            Choose your plan:
          </p>
          <div className="flex gap-2">
            <a
              href="/checkout?plan=essential"
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium text-center transition-all ${
                planId === "essential"
                  ? "bg-indigo-600 text-white"
                  : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
              }`}
            >
              Essential - $49
            </a>
            <a
              href="/checkout?plan=pro"
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium text-center transition-all ${
                planId === "pro"
                  ? "bg-indigo-600 text-white"
                  : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
              }`}
            >
              Pro - $99
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
