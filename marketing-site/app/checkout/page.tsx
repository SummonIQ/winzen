import type { Metadata } from "next";
import { CheckoutClient } from "@/components/checkout/CheckoutClient";

export const metadata: Metadata = {
  alternates: { canonical: "/checkout" },
  description:
    "Choose a Winzen plan and start checkout for macOS Spaces management.",
  robots: {
    follow: false,
    index: false,
  },
  title: "Checkout - Winzen",
};

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string | string[] }>;
}) {
  const resolvedSearchParams = await searchParams;
  const planParam = resolvedSearchParams.plan;
  const planId = Array.isArray(planParam) ? planParam[0] : planParam;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-gray-950 dark:to-gray-900 py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600">
              Get Winzen
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Choose your plan and get lifetime access
          </p>
        </div>

        <CheckoutClient initialPlanId={planId === "essential" ? "essential" : "pro"} />
      </div>
    </div>
  );
}
