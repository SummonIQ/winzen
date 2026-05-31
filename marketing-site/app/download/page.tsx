import {
  Download,
  Check,
  Shield,
  Zap,
  Heart,
  Keyboard,
  Eye,
  SquaresExclude,
} from "lucide-react";
import type { Metadata } from "next";

import { HeroBackground } from "@/components/HeroBackground";

export const metadata: Metadata = {
  alternates: { canonical: "/download" },
  description:
    "Download Winzen for macOS and start switching Spaces with visual previews, keyboard shortcuts, and local desktop control.",
  openGraph: {
    description:
      "Download Winzen for macOS and start switching Spaces with visual previews and keyboard shortcuts.",
    title: "Download Winzen",
    type: "website",
    url: "/download",
  },
  title: "Download Winzen",
  twitter: {
    card: "summary_large_image",
    description:
      "Download Winzen for macOS and start switching Spaces with visual previews and keyboard shortcuts.",
    title: "Download Winzen",
  },
};

export default function DownloadPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-indigo-50/30 to-blue-50/20 dark:from-gray-950 dark:via-indigo-950/20 dark:to-blue-950/10">
      {/* Subtle animated background (shared with landing page) */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-grid-slate-200/30 dark:bg-grid-slate-800/20 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
        <div className="absolute inset-0 opacity-20 dark:opacity-14">
          <HeroBackground />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-background/85 via-background/70 to-background" />
      </div>

      {/* Hero */}
      <section className="relative z-10 overflow-hidden pt-48 py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-8 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-700">
              <SquaresExclude className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold tracking-tight sm:text-6xl mb-6">
              Download{" "}
              <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-blue-700 bg-clip-text text-transparent">
                Winzen
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-10">
              Grab the latest build and start navigating macOS Spaces at
              lightning speed.
            </p>

            {/* Download Button */}
            <div className="flex flex-col items-center gap-6">
              <a
                href="/downloads/Winzen.dmg"
                className="group inline-flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-indigo-600 via-blue-600 to-blue-700 px-10 py-5 text-lg font-semibold text-white shadow-2xl shadow-blue-500/25 transition-all hover:shadow-indigo-500/30 hover:scale-[1.02]"
              >
                <Download className="h-6 w-6 transition-transform group-hover:translate-y-0.5" />
                Download for macOS
              </a>
              <p className="text-sm text-muted-foreground">
                Version 0.1.0 • macOS 12.0 or later • Apple Silicon & Intel
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="relative z-10 py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              What&apos;s Included
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to get started with Winzen
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
            {[
              {
                icon: Zap,
                title: "Instant Switching",
                description: "Jump between Spaces in a single keystroke",
              },
              {
                icon: Eye,
                title: "Visual Previews",
                description: "See your desktops before you switch",
              },
              {
                icon: Keyboard,
                title: "Keyboard First",
                description: "Built for power users and muscle memory",
              },
              {
                icon: Shield,
                title: "Safe & Local",
                description: "Your workspace stays on your Mac",
              },
              {
                icon: SquaresExclude,
                title: "Space Organization",
                description: "Name and manage Spaces like a pro",
              },
              {
                icon: Heart,
                title: "Made for macOS",
                description: "Feels native and stays out of your way",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="rounded-xl border border-white/12 dark:border-white/10 bg-white/55 dark:bg-gray-950/25 backdrop-blur-md p-6 text-center transition-all hover:border-primary/50 hover:shadow-lg"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* System Requirements */}
      <section className="relative z-10 py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tight mb-8 text-center">
              System Requirements
            </h2>
            <div className="rounded-2xl border border-white/12 dark:border-white/10 bg-white/55 dark:bg-gray-950/25 backdrop-blur-md p-8">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-600" />
                    Minimum Requirements
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• macOS 12.0 (Monterey) or later</li>
                    <li>• 4GB RAM</li>
                    <li>• 200MB free disk space</li>
                    <li>• Screen Recording permission for previews</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Check className="h-5 w-5 text-indigo-600" />
                    Recommended
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• macOS 14.0 (Sonoma) or later</li>
                    <li>• 8GB RAM or more</li>
                    <li>• 1GB free disk space</li>
                    <li>• Apple Silicon for best performance</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Installation Steps */}
      <section className="relative z-10 py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tight mb-12 text-center">
              How to Install
            </h2>
            <div className="space-y-8">
              {[
                {
                  step: "1",
                  title: "Download Winzen",
                  description:
                    "Click the download button above to get the latest Winzen build for macOS.",
                },
                {
                  step: "2",
                  title: "Open the DMG file",
                  description:
                    "Once downloaded, open Winzen.dmg from your Downloads folder.",
                },
                {
                  step: "3",
                  title: "Drag to Applications",
                  description:
                    "Drag Winzen into your Applications folder to install.",
                },
                {
                  step: "4",
                  title: "Launch & Grant Permissions",
                  description:
                    "Open Winzen and grant Screen Recording (for previews) and Accessibility (for switching) when prompted.",
                },
              ].map((item, index) => (
                <div key={index} className="flex gap-6 items-start">
                  <div className="mt-1 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-700 text-xl font-bold text-white">
                    {item.step}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative z-10 py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tight mb-12 text-center">
              Download Questions
            </h2>
            <div className="space-y-4">
              {[
                {
                  question: "Is Winzen safe to download?",
                  answer:
                    "Yes. Winzen is built for macOS and designed to operate locally. You remain in control of permissions.",
                },
                {
                  question: "Why does Winzen ask for Screen Recording?",
                  answer:
                    "Winzen uses Screen Recording permission to capture desktop previews so you can see each Space before switching.",
                },
                {
                  question: "Why does Winzen ask for Accessibility?",
                  answer:
                    "Accessibility allows Winzen to perform fast Space switching and window management actions.",
                },
                {
                  question: "Will Winzen work on my Mac?",
                  answer:
                    "Winzen works on Macs running macOS 12.0 or later, including both Apple Silicon and Intel processors.",
                },
                {
                  question: "How do I update Winzen?",
                  answer:
                    "Updates will be delivered via the app as new builds become available.",
                },
              ].map((faq, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-white/12 dark:border-white/10 bg-white/55 dark:bg-gray-950/25 backdrop-blur-md p-6"
                >
                  <h3 className="font-semibold mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground text-sm">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-700 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to get started?</h2>
            <p className="text-xl mb-8 text-white/90">
              Download Winzen and start switching Spaces like a pro.
            </p>
            <a
              href="/downloads/Winzen.dmg"
              className="inline-flex items-center justify-center gap-3 rounded-full bg-white px-10 py-5 text-lg font-semibold text-indigo-700 shadow-lg transition-all hover:bg-white/90 hover:scale-[1.02]"
            >
              <Download className="h-6 w-6" />
              Download Now
            </a>
            <p className="mt-6 text-sm text-white/70">
              Public beta • macOS 12.0+ • Apple Silicon & Intel
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
