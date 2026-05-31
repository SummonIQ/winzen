import {
  Monitor,
  SquaresExclude,
  Zap,
  Eye,
  Keyboard,
  Layout,
  Clock,
  Shield,
  Sparkles,
  ArrowRight,
  Check,
  Users,
  Download,
  Star,
  Quote,
  Plus,
  Minus,
  Code,
  Briefcase,
  Laptop,
  Coffee,
} from "lucide-react";
import { FEATURES } from "@/config/features";
import { HeroBackground } from "@/components/HeroBackground";
import { HeroDownloadCta } from "@/components/HeroDownloadCta";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative min-h-[calc(100vh+96px)] flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-indigo-50/30 to-blue-50/20 dark:from-gray-950 dark:via-indigo-950/20 dark:to-blue-950/10">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-grid-slate-200/50 dark:bg-grid-slate-800/30 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
        <HeroBackground />
        <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-b from-transparent via-white to-white dark:via-gray-900 dark:to-gray-900 pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 sm:py-40 text-center">
          <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-br from-indigo-500/10 via-blue-500/10 to-blue-500/10 dark:from-indigo-500/20 dark:via-blue-500/20 dark:to-blue-500/20 backdrop-blur-sm border border-white/20 dark:border-white/10 shadow-sm shadow-indigo-500/10 dark:shadow-indigo-500/15 mb-10 group hover:shadow-md hover:shadow-indigo-500/20 transition-all">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 group-hover:rotate-12 transition-transform" />
            <span className="text-xs font-semibold bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-700 dark:from-indigo-400 dark:via-blue-400 dark:to-blue-300 bg-clip-text text-transparent">
              The #1 Desktop Switcher for macOS
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight mb-7 leading-[1.07]">
            <span className="text-gray-900 dark:text-white">
              Master Your macOS Workspace
            </span>
          </h1>

          <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed">
            The fastest way to navigate between macOS desktops. Lightning-fast
            switching with beautiful visual previews.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <HeroDownloadCta href="/download" />
            <a
              href="/pricing"
              className="group relative inline-flex items-center gap-2 px-8 py-4 border border-indigo-200/60 dark:border-white/15 bg-white/70 dark:bg-gray-900/40 backdrop-blur-md text-gray-800 dark:text-gray-200 rounded-xl font-semibold overflow-hidden transition-[transform,box-shadow,border-color,background-color] duration-300 hover:bg-white/90 dark:hover:bg-gray-900/55 hover:border-indigo-300/70 dark:hover:border-white/25 hover:scale-[1.02] hover:-translate-y-0.5 shadow-[0_10px_24px_-16px_rgba(0,0,0,0.35)] hover:shadow-[0_18px_40px_-18px_rgba(0,0,0,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 dark:focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 dark:focus-visible:ring-offset-gray-950 before:pointer-events-none before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/0 before:via-white/20 before:to-white/0 before:opacity-0 before:transition-opacity before:duration-300 group-hover:before:opacity-100 after:pointer-events-none after:absolute after:inset-[-60%] after:bg-gradient-to-br after:from-white/0 after:via-white/18 after:to-white/0 after:opacity-0 after:blur-sm after:rotate-12 after:-translate-x-[60%] after:transition-[transform,opacity] after:duration-700 after:ease-out group-hover:after:opacity-80 group-hover:after:translate-x-[60%]"
            >
              <span>View Pricing</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center gap-6 flex-wrap">
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              macOS 12.0+
            </span>
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              Apple Silicon & Intel
            </span>
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              {FEATURES.PRICING_ENABLED ? "One-time Payment" : "Public Beta"}
            </span>
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-b from-white to-slate-50/50 dark:from-gray-900 dark:to-gray-950/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            <div className="text-center group">
              <div className="text-5xl sm:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-700 mb-3 group-hover:scale-105 transition-transform">
                1–2s
              </div>
              <div className="text-gray-600 dark:text-gray-400 text-sm sm:text-base font-medium">
                Per workspace switch
              </div>
            </div>
            <div className="text-center group">
              <div className="text-5xl sm:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-700 mb-3 group-hover:scale-105 transition-transform">
                0
              </div>
              <div className="text-gray-600 dark:text-gray-400 text-sm sm:text-base font-medium">
                Mouse travel needed
              </div>
            </div>
            <div className="text-center group">
              <div className="text-5xl sm:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-700 mb-3 group-hover:scale-105 transition-transform">
                ∞
              </div>
              <div className="text-gray-600 dark:text-gray-400 text-sm sm:text-base font-medium">
                Workspaces you can organize
              </div>
            </div>
            <div className="text-center group">
              <div className="text-5xl sm:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-700 mb-3 group-hover:scale-105 transition-transform">
                &lt;100ms
              </div>
              <div className="text-gray-600 dark:text-gray-400 text-sm sm:text-base font-medium">
                Time to find your space
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section
        id="features"
        className="py-24 bg-gradient-to-b from-slate-50 to-white dark:from-gray-950 dark:to-gray-900"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Everything you need to stay productive
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Powerful features designed to make desktop management effortless
              and intuitive
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="relative overflow-hidden p-8 bg-white/65 dark:bg-gray-800/35 border border-gray-200/45 dark:border-gray-700/45 rounded-2xl hover:bg-white/72 dark:hover:bg-gray-800/45 hover:border-indigo-500/22 dark:hover:border-indigo-500/22 transition-[transform,box-shadow,border-color,background-color] duration-300 group backdrop-blur-sm shadow-[0_10px_24px_-18px_rgba(0,0,0,0.26)] hover:shadow-2xl hover:shadow-indigo-500/12 hover:-translate-y-0.5">
              <div className="pointer-events-none absolute -top-24 -left-24 h-60 w-60 rounded-full bg-indigo-500/22 blur-3xl opacity-65 animate-[cornerGlow_10s_ease-in-out_infinite] transition-[opacity,transform] duration-300 group-hover:opacity-95 group-hover:scale-[1.35]" />
              <div className="relative w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-3 transition-transform shadow-lg shadow-indigo-500/30">
                <Zap className="w-7 h-7 text-white drop-shadow" />
              </div>
              <h3 className="relative text-xl font-bold text-gray-900 dark:text-white mb-3">
                Lightning Fast
              </h3>
              <p className="relative text-gray-600 dark:text-gray-400 leading-relaxed">
                Switch between desktops in milliseconds with ⌘+D. No lag, no
                waiting—just instant navigation.
              </p>
            </div>

            <div className="relative overflow-hidden p-8 bg-white/65 dark:bg-gray-800/35 border border-gray-200/45 dark:border-gray-700/45 rounded-2xl hover:bg-white/72 dark:hover:bg-gray-800/45 hover:border-blue-500/22 dark:hover:border-blue-500/22 transition-[transform,box-shadow,border-color,background-color] duration-300 group backdrop-blur-sm shadow-[0_10px_24px_-18px_rgba(0,0,0,0.26)] hover:shadow-2xl hover:shadow-blue-500/12 hover:-translate-y-0.5">
              <div className="pointer-events-none absolute -top-24 -left-24 h-60 w-60 rounded-full bg-blue-500/22 blur-3xl opacity-65 animate-[cornerGlow_10s_ease-in-out_infinite] transition-[opacity,transform] duration-300 group-hover:opacity-95 group-hover:scale-[1.35]" />
              <div className="relative w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-3 transition-transform shadow-lg shadow-blue-500/30">
                <Eye className="w-7 h-7 text-white drop-shadow" />
              </div>
              <h3 className="relative text-xl font-bold text-gray-900 dark:text-white mb-3">
                Visual Previews
              </h3>
              <p className="relative text-gray-600 dark:text-gray-400 leading-relaxed">
                See live screenshots of all your spaces before switching. Know
                exactly where you're going.
              </p>
            </div>

            <div className="relative overflow-hidden p-8 bg-white/65 dark:bg-gray-800/35 border border-gray-200/45 dark:border-gray-700/45 rounded-2xl hover:bg-white/72 dark:hover:bg-gray-800/45 hover:border-blue-500/22 dark:hover:border-blue-500/22 transition-[transform,box-shadow,border-color,background-color] duration-300 group backdrop-blur-sm shadow-[0_10px_24px_-18px_rgba(0,0,0,0.26)] hover:shadow-2xl hover:shadow-blue-500/12 hover:-translate-y-0.5">
              <div className="pointer-events-none absolute -top-24 -left-24 h-60 w-60 rounded-full bg-blue-500/22 blur-3xl opacity-65 animate-[cornerGlow_10s_ease-in-out_infinite] transition-[opacity,transform] duration-300 group-hover:opacity-95 group-hover:scale-[1.35]" />
              <div className="relative w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-3 transition-transform shadow-lg shadow-blue-500/30">
                <Keyboard className="w-7 h-7 text-white drop-shadow" />
              </div>
              <h3 className="relative text-xl font-bold text-gray-900 dark:text-white mb-3">
                Keyboard First
              </h3>
              <p className="relative text-gray-600 dark:text-gray-400 leading-relaxed">
                Never touch your mouse. Everything is keyboard accessible for
                maximum productivity.
              </p>
            </div>

            <div className="relative overflow-hidden p-8 bg-white/65 dark:bg-gray-800/35 border border-gray-200/45 dark:border-gray-700/45 rounded-2xl hover:bg-white/72 dark:hover:bg-gray-800/45 hover:border-green-500/22 dark:hover:border-green-500/22 transition-[transform,box-shadow,border-color,background-color] duration-300 group backdrop-blur-sm shadow-[0_10px_24px_-18px_rgba(0,0,0,0.26)] hover:shadow-2xl hover:shadow-green-500/12 hover:-translate-y-0.5">
              <div className="pointer-events-none absolute -top-24 -left-24 h-60 w-60 rounded-full bg-green-500/22 blur-3xl opacity-65 animate-[cornerGlow_10s_ease-in-out_infinite] transition-[opacity,transform] duration-300 group-hover:opacity-95 group-hover:scale-[1.35]" />
              <div className="relative w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-3 transition-transform shadow-lg shadow-green-500/30">
                <Layout className="w-7 h-7 text-white drop-shadow" />
              </div>
              <h3 className="relative text-xl font-bold text-gray-900 dark:text-white mb-3">
                Window Containers
              </h3>
              <p className="relative text-gray-600 dark:text-gray-400 leading-relaxed">
                Organize windows into groups and move them between spaces with a
                single command.
              </p>
            </div>

            <div className="relative overflow-hidden p-8 bg-white/65 dark:bg-gray-800/35 border border-gray-200/45 dark:border-gray-700/45 rounded-2xl hover:bg-white/72 dark:hover:bg-gray-800/45 hover:border-orange-500/22 dark:hover:border-orange-500/22 transition-[transform,box-shadow,border-color,background-color] duration-300 group backdrop-blur-sm shadow-[0_10px_24px_-18px_rgba(0,0,0,0.26)] hover:shadow-2xl hover:shadow-orange-500/12 hover:-translate-y-0.5">
              <div className="pointer-events-none absolute -top-24 -left-24 h-60 w-60 rounded-full bg-orange-500/22 blur-3xl opacity-65 animate-[cornerGlow_10s_ease-in-out_infinite] transition-[opacity,transform] duration-300 group-hover:opacity-95 group-hover:scale-[1.35]" />
              <div className="relative w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-3 transition-transform shadow-lg shadow-orange-500/30">
                <Clock className="w-7 h-7 text-white drop-shadow" />
              </div>
              <h3 className="relative text-xl font-bold text-gray-900 dark:text-white mb-3">
                Auto-Capture
              </h3>
              <p className="relative text-gray-600 dark:text-gray-400 leading-relaxed">
                Automatically capture screenshots when switching spaces to
                always see what's where.
              </p>
            </div>

            <div className="relative overflow-hidden p-8 bg-white/65 dark:bg-gray-800/35 border border-gray-200/45 dark:border-gray-700/45 rounded-2xl hover:bg-white/72 dark:hover:bg-gray-800/45 hover:border-indigo-500/22 dark:hover:border-indigo-500/22 transition-[transform,box-shadow,border-color,background-color] duration-300 group backdrop-blur-sm shadow-[0_10px_24px_-18px_rgba(0,0,0,0.26)] hover:shadow-2xl hover:shadow-indigo-500/12 hover:-translate-y-0.5">
              <div className="pointer-events-none absolute -top-24 -left-24 h-60 w-60 rounded-full bg-indigo-500/22 blur-3xl opacity-65 animate-[cornerGlow_10s_ease-in-out_infinite] transition-[opacity,transform] duration-300 group-hover:opacity-95 group-hover:scale-[1.35]" />
              <div className="relative w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-3 transition-transform shadow-lg shadow-indigo-500/30">
                <Shield className="w-7 h-7 text-white drop-shadow" />
              </div>
              <h3 className="relative text-xl font-bold text-gray-900 dark:text-white mb-3">
                Privacy First
              </h3>
              <p className="relative text-gray-600 dark:text-gray-400 leading-relaxed">
                All data stays on your Mac. No cloud, no tracking, no
                analytics—complete privacy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-gradient-to-b from-white to-slate-50/60 dark:from-gray-900 dark:to-gray-950/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              How it works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Three simple steps to supercharge your workflow
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-indigo-600 to-blue-600 text-white text-3xl font-bold mb-6 shadow-lg group-hover:scale-110 transition-transform">
                1
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Press ⌘+D
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                Launch Winzen with a simple keyboard shortcut from anywhere on
                your Mac
              </p>
            </div>

            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-indigo-600 to-blue-600 text-white text-3xl font-bold mb-6 shadow-lg group-hover:scale-110 transition-transform">
                2
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Browse Your Spaces
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                See beautiful live previews of all your desktops in one elegant
                view
              </p>
            </div>

            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-indigo-600 to-blue-600 text-white text-3xl font-bold mb-6 shadow-lg group-hover:scale-110 transition-transform">
                3
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Jump Instantly
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                Press Enter or Tab to switch instantly. That's it—you're
                productive!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-24 bg-gradient-to-b from-slate-50 to-white dark:from-gray-950 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Perfect for every workflow
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Whether you're coding, designing, or managing projects, Winzen
              adapts to your needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="relative overflow-hidden p-8 bg-white/70 dark:bg-gray-800/35 backdrop-blur-sm rounded-2xl border border-gray-200/55 dark:border-gray-700/50 hover:border-indigo-500/45 dark:hover:border-indigo-500/40 transition-[transform,box-shadow,border-color,background-color] duration-300 shadow-[0_10px_24px_-18px_rgba(0,0,0,0.26)] hover:shadow-2xl hover:shadow-indigo-500/12 hover:-translate-y-0.5 group">
              <div className="pointer-events-none absolute -top-24 -left-24 h-60 w-60 rounded-full bg-indigo-500/20 blur-3xl opacity-65 animate-[cornerGlow_10s_ease-in-out_infinite] transition-[opacity,transform] duration-300 group-hover:opacity-95 group-hover:scale-[1.35]" />
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-5">
                <Code className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                For Developers
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                Separate your code editor, documentation, terminal, and browser
                into dedicated spaces. Switch between contexts without losing
                your flow.
              </p>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Jump between codebases instantly</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Keep docs and code side by side</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Organize by project or feature</span>
                </li>
              </ul>
            </div>

            <div className="relative overflow-hidden p-8 bg-white/70 dark:bg-gray-800/35 backdrop-blur-sm rounded-2xl border border-gray-200/55 dark:border-gray-700/50 hover:border-blue-500/45 dark:hover:border-blue-500/40 transition-[transform,box-shadow,border-color,background-color] duration-300 shadow-[0_10px_24px_-18px_rgba(0,0,0,0.26)] hover:shadow-2xl hover:shadow-blue-500/12 hover:-translate-y-0.5 group">
              <div className="pointer-events-none absolute -top-24 -left-24 h-60 w-60 rounded-full bg-blue-500/20 blur-3xl opacity-65 animate-[cornerGlow_10s_ease-in-out_infinite] transition-[opacity,transform] duration-300 group-hover:opacity-95 group-hover:scale-[1.35]" />
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-5">
                <Laptop className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                For Designers
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                Dedicate spaces to Figma, inspiration boards, client feedback,
                and your design tools. Keep your creative flow uninterrupted.
              </p>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Separate projects cleanly</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Quick reference switching</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Visual workspace organization</span>
                </li>
              </ul>
            </div>

            <div className="relative overflow-hidden p-8 bg-white/70 dark:bg-gray-800/35 backdrop-blur-sm rounded-2xl border border-gray-200/55 dark:border-gray-700/50 hover:border-green-500/45 dark:hover:border-green-500/40 transition-[transform,box-shadow,border-color,background-color] duration-300 shadow-[0_10px_24px_-18px_rgba(0,0,0,0.26)] hover:shadow-2xl hover:shadow-green-500/12 hover:-translate-y-0.5 group">
              <div className="pointer-events-none absolute -top-24 -left-24 h-60 w-60 rounded-full bg-green-500/20 blur-3xl opacity-65 animate-[cornerGlow_10s_ease-in-out_infinite] transition-[opacity,transform] duration-300 group-hover:opacity-95 group-hover:scale-[1.35]" />
              <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-5">
                <Briefcase className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                For Managers
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                Keep meetings, planning, communication, and deep work in
                separate spaces. Context-switch without the mental overhead.
              </p>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Meeting-ready spaces</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Project-based organization</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Focus time isolation</span>
                </li>
              </ul>
            </div>

            <div className="relative overflow-hidden p-8 bg-white/70 dark:bg-gray-800/35 backdrop-blur-sm rounded-2xl border border-gray-200/55 dark:border-gray-700/50 hover:border-orange-500/45 dark:hover:border-orange-500/40 transition-[transform,box-shadow,border-color,background-color] duration-300 shadow-[0_10px_24px_-18px_rgba(0,0,0,0.26)] hover:shadow-2xl hover:shadow-orange-500/12 hover:-translate-y-0.5 group">
              <div className="pointer-events-none absolute -top-24 -left-24 h-60 w-60 rounded-full bg-orange-500/20 blur-3xl opacity-65 animate-[cornerGlow_10s_ease-in-out_infinite] transition-[opacity,transform] duration-300 group-hover:opacity-95 group-hover:scale-[1.35]" />
              <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-5">
                <Coffee className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                For Everyone
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                Separate work from personal life. Keep social media, music,
                shopping, and leisure apps in their own space.
              </p>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Work-life balance made easy</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Distraction-free work mode</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Seamless context switching</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-gradient-to-b from-white to-slate-50/60 dark:from-gray-900 dark:to-gray-950/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Loved by Mac users worldwide
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              See what our users have to say about Winzen
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group relative overflow-hidden bg-gradient-to-br from-slate-50/75 to-white/60 dark:from-gray-800/55 dark:to-gray-800/25 rounded-2xl p-8 border border-gray-200/45 dark:border-gray-700/45 backdrop-blur-sm shadow-[0_10px_24px_-18px_rgba(0,0,0,0.26)] hover:shadow-[0_18px_40px_-18px_rgba(0,0,0,0.40)] transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5">
              <div className="pointer-events-none absolute -top-24 -left-24 h-60 w-60 rounded-full bg-indigo-500/20 blur-3xl opacity-65 animate-[cornerGlow_10s_ease-in-out_infinite] transition-[opacity,transform] duration-300 group-hover:opacity-95 group-hover:scale-[1.35]" />
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <Quote className="w-10 h-10 text-indigo-600/20 dark:text-indigo-400/20 mb-4" />
              <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                "Winzen has completely changed how I work. I used to lose track
                of which desktop had my code vs. my documentation. Now it's
                instant—press ⌘+D and I'm exactly where I need to be."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center text-white font-bold">
                  SM
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    Sarah Martinez
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Senior Developer
                  </div>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden bg-gradient-to-br from-slate-50/75 to-white/60 dark:from-gray-800/55 dark:to-gray-800/25 rounded-2xl p-8 border border-gray-200/45 dark:border-gray-700/45 backdrop-blur-sm shadow-[0_10px_24px_-18px_rgba(0,0,0,0.26)] hover:shadow-[0_18px_40px_-18px_rgba(0,0,0,0.40)] transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5">
              <div className="pointer-events-none absolute -top-24 -left-24 h-60 w-60 rounded-full bg-blue-500/20 blur-3xl opacity-65 animate-[cornerGlow_10s_ease-in-out_infinite] transition-[opacity,transform] duration-300 group-hover:opacity-95 group-hover:scale-[1.35]" />
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <Quote className="w-10 h-10 text-indigo-600/20 dark:text-indigo-400/20 mb-4" />
              <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                "As a designer juggling multiple projects, Winzen keeps me sane.
                Visual previews mean I never accidentally switch to the wrong
                workspace. It's like having x-ray vision for my Mac."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center text-white font-bold">
                  JC
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    James Chen
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    UX Designer
                  </div>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden bg-gradient-to-br from-slate-50/75 to-white/60 dark:from-gray-800/55 dark:to-gray-800/25 rounded-2xl p-8 border border-gray-200/45 dark:border-gray-700/45 backdrop-blur-sm shadow-[0_10px_24px_-18px_rgba(0,0,0,0.26)] hover:shadow-[0_18px_40px_-18px_rgba(0,0,0,0.40)] transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5">
              <div className="pointer-events-none absolute -top-24 -left-24 h-60 w-60 rounded-full bg-blue-500/20 blur-3xl opacity-65 animate-[cornerGlow_10s_ease-in-out_infinite] transition-[opacity,transform] duration-300 group-hover:opacity-95 group-hover:scale-[1.35]" />
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <Quote className="w-10 h-10 text-indigo-600/20 dark:text-indigo-400/20 mb-4" />
              <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                "I can't believe I ever managed without this. Switching between
                my 6 desktops used to be a nightmare. Now it's effortless.
                Winzen is the first app I install on any new Mac."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white font-bold">
                  ER
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    Emily Rodriguez
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Product Manager
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-gradient-to-b from-slate-50 to-white dark:from-gray-950 dark:to-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Frequently asked questions
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Everything you need to know about Winzen
            </p>
          </div>

          <div className="space-y-6">
            <details className="group relative overflow-hidden bg-white/70 dark:bg-gray-800/35 backdrop-blur-sm rounded-2xl border border-gray-200/55 dark:border-gray-700/50 hover:border-indigo-500/40 dark:hover:border-indigo-500/35 transition-[box-shadow,border-color,background-color] shadow-[0_10px_24px_-18px_rgba(0,0,0,0.20)] group-open:shadow-[0_18px_40px_-18px_rgba(0,0,0,0.32)] before:pointer-events-none before:absolute before:-top-24 before:-left-24 before:h-60 before:w-60 before:rounded-full before:bg-indigo-500/18 before:blur-3xl before:origin-top-left before:opacity-65 before:animate-[cornerGlow_10s_ease-in-out_infinite] before:transition-[opacity,transform] before:duration-300 group-hover:before:opacity-95 group-hover:before:scale-[1.35]">
              <summary className="flex items-center justify-between cursor-pointer p-6 font-semibold text-lg text-gray-900 dark:text-white">
                <span>What's included with Winzen?</span>
                <Plus className="w-5 h-5 text-gray-500 group-open:hidden" />
                <Minus className="w-5 h-5 text-indigo-600 hidden group-open:block" />
              </summary>
              <div className="px-6 pb-6 text-gray-600 dark:text-gray-400 leading-relaxed">
                Winzen offers two lifetime tiers: Essential ($49) with core
                features for casual users, and Pro ($99) with advanced features
                like auto-capture, window containers, and unlimited spaces. Pay
                once and get lifetime access with all future updates included.
              </div>
            </details>

            <details className="group relative overflow-hidden bg-white/70 dark:bg-gray-800/35 backdrop-blur-sm rounded-2xl border border-gray-200/55 dark:border-gray-700/50 hover:border-indigo-500/40 dark:hover:border-indigo-500/35 transition-[box-shadow,border-color,background-color] shadow-[0_10px_24px_-18px_rgba(0,0,0,0.20)] group-open:shadow-[0_18px_40px_-18px_rgba(0,0,0,0.32)] before:pointer-events-none before:absolute before:-top-24 before:-left-24 before:h-60 before:w-60 before:rounded-full before:bg-indigo-500/18 before:blur-3xl before:origin-top-left before:opacity-65 before:animate-[cornerGlow_10s_ease-in-out_infinite] before:transition-[opacity,transform] before:duration-300 group-hover:before:opacity-95 group-hover:before:scale-[1.35]">
              <summary className="flex items-center justify-between cursor-pointer p-6 font-semibold text-lg text-gray-900 dark:text-white">
                <span>Does it work on Apple Silicon Macs?</span>
                <Plus className="w-5 h-5 text-gray-500 group-open:hidden" />
                <Minus className="w-5 h-5 text-indigo-600 hidden group-open:block" />
              </summary>
              <div className="px-6 pb-6 text-gray-600 dark:text-gray-400 leading-relaxed">
                Absolutely! Winzen is fully optimized for both Apple Silicon
                (M1, M2, M3) and Intel Macs. It runs natively on Apple Silicon
                for maximum performance and efficiency.
              </div>
            </details>

            <details className="group relative overflow-hidden bg-white/70 dark:bg-gray-800/35 backdrop-blur-sm rounded-2xl border border-gray-200/55 dark:border-gray-700/50 hover:border-indigo-500/40 dark:hover:border-indigo-500/35 transition-[box-shadow,border-color,background-color] shadow-[0_10px_24px_-18px_rgba(0,0,0,0.20)] group-open:shadow-[0_18px_40px_-18px_rgba(0,0,0,0.32)] before:pointer-events-none before:absolute before:-top-24 before:-left-24 before:h-60 before:w-60 before:rounded-full before:bg-indigo-500/18 before:blur-3xl before:origin-top-left before:opacity-65 before:animate-[cornerGlow_10s_ease-in-out_infinite] before:transition-[opacity,transform] before:duration-300 group-hover:before:opacity-95 group-hover:before:scale-[1.35]">
              <summary className="flex items-center justify-between cursor-pointer p-6 font-semibold text-lg text-gray-900 dark:text-white">
                <span>What macOS versions are supported?</span>
                <Plus className="w-5 h-5 text-gray-500 group-open:hidden" />
                <Minus className="w-5 h-5 text-indigo-600 hidden group-open:block" />
              </summary>
              <div className="px-6 pb-6 text-gray-600 dark:text-gray-400 leading-relaxed">
                Winzen requires macOS 12.0 (Monterey) or later. This includes
                Monterey, Ventura, and Sonoma. We continuously update Winzen to
                support the latest macOS features.
              </div>
            </details>

            <details className="group relative overflow-hidden bg-white/70 dark:bg-gray-800/35 backdrop-blur-sm rounded-2xl border border-gray-200/55 dark:border-gray-700/50 hover:border-indigo-500/40 dark:hover:border-indigo-500/35 transition-[box-shadow,border-color,background-color] shadow-[0_10px_24px_-18px_rgba(0,0,0,0.20)] group-open:shadow-[0_18px_40px_-18px_rgba(0,0,0,0.32)] before:pointer-events-none before:absolute before:-top-24 before:-left-24 before:h-60 before:w-60 before:rounded-full before:bg-indigo-500/18 before:blur-3xl before:origin-top-left before:opacity-65 before:animate-[cornerGlow_10s_ease-in-out_infinite] before:transition-[opacity,transform] before:duration-300 group-hover:before:opacity-95 group-hover:before:scale-[1.35]">
              <summary className="flex items-center justify-between cursor-pointer p-6 font-semibold text-lg text-gray-900 dark:text-white">
                <span>How is my data handled?</span>
                <Plus className="w-5 h-5 text-gray-500 group-open:hidden" />
                <Minus className="w-5 h-5 text-indigo-600 hidden group-open:block" />
              </summary>
              <div className="px-6 pb-6 text-gray-600 dark:text-gray-400 leading-relaxed">
                Privacy is our top priority. All screenshots and data stay on
                your Mac—nothing is ever sent to the cloud or our servers. We
                don't track your usage, collect analytics, or store any personal
                information. Your workspace is yours alone.
              </div>
            </details>

            <details className="group relative overflow-hidden bg-white/70 dark:bg-gray-800/35 backdrop-blur-sm rounded-2xl border border-gray-200/55 dark:border-gray-700/50 hover:border-indigo-500/40 dark:hover:border-indigo-500/35 transition-[box-shadow,border-color,background-color] shadow-[0_10px_24px_-18px_rgba(0,0,0,0.20)] group-open:shadow-[0_18px_40px_-18px_rgba(0,0,0,0.32)] before:pointer-events-none before:absolute before:-top-24 before:-left-24 before:h-60 before:w-60 before:rounded-full before:bg-indigo-500/18 before:blur-3xl before:origin-top-left before:opacity-65 before:animate-[cornerGlow_10s_ease-in-out_infinite] before:transition-[opacity,transform] before:duration-300 group-hover:before:opacity-95 group-hover:before:scale-[1.35]">
              <summary className="flex items-center justify-between cursor-pointer p-6 font-semibold text-lg text-gray-900 dark:text-white">
                <span>Can I customize keyboard shortcuts?</span>
                <Plus className="w-5 h-5 text-gray-500 group-open:hidden" />
                <Minus className="w-5 h-5 text-indigo-600 hidden group-open:block" />
              </summary>
              <div className="px-6 pb-6 text-gray-600 dark:text-gray-400 leading-relaxed">
                Yes! While ⌘+D is the default shortcut, you can customize it to
                any key combination you prefer. Pro users get access to even
                more advanced shortcut customization options.
              </div>
            </details>

            <details className="group relative overflow-hidden bg-white/70 dark:bg-gray-800/35 backdrop-blur-sm rounded-2xl border border-gray-200/55 dark:border-gray-700/50 hover:border-indigo-500/40 dark:hover:border-indigo-500/35 transition-[box-shadow,border-color,background-color] shadow-[0_10px_24px_-18px_rgba(0,0,0,0.20)] group-open:shadow-[0_18px_40px_-18px_rgba(0,0,0,0.32)] before:pointer-events-none before:absolute before:-top-24 before:-left-24 before:h-60 before:w-60 before:rounded-full before:bg-indigo-500/18 before:blur-3xl before:origin-top-left before:opacity-65 before:animate-[cornerGlow_10s_ease-in-out_infinite] before:transition-[opacity,transform] before:duration-300 group-hover:before:opacity-95 group-hover:before:scale-[1.35]">
              <summary className="flex items-center justify-between cursor-pointer p-6 font-semibold text-lg text-gray-900 dark:text-white">
                <span>What's the difference between Essential and Pro?</span>
                <Plus className="w-5 h-5 text-gray-500 group-open:hidden" />
                <Minus className="w-5 h-5 text-indigo-600 hidden group-open:block" />
              </summary>
              <div className="px-6 pb-6 text-gray-600 dark:text-gray-400 leading-relaxed">
                Essential includes core features like fast switching, visual
                previews, and keyboard navigation (up to 6 spaces). Pro adds
                automatic screenshot capture, unlimited spaces, window container
                management, advanced customization, and priority support. Check
                our pricing page for a detailed comparison.
              </div>
            </details>
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Still have questions?
            </p>
            <a
              href="/docs"
              className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold"
            >
              Check out our documentation
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        id="download"
        className="py-24 bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-700 dark:from-indigo-900 dark:via-blue-900 dark:to-blue-950 relative overflow-hidden"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Sparkles className="w-16 h-16 text-white/80 mx-auto mb-8 animate-pulse" />
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Ready to transform your workflow?
          </h2>
          <p className="text-xl sm:text-2xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed">
            Join thousands of Mac users who've supercharged their productivity
            with Winzen
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <HeroDownloadCta
              href="/download"
              startLabel={
                FEATURES.PRICING_ENABLED
                  ? "Get Started Today"
                  : "Request Beta Access"
              }
              endLabel="Download Now"
              badgeText=""
              ariaLabel="Download Winzen"
              showHoverOverlay={false}
              className="group relative inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-700 rounded-xl font-bold overflow-hidden transition-[transform,box-shadow,background-color] duration-300 shadow-[0_16px_44px_-28px_rgba(0,0,0,0.46),0_10px_26px_-18px_rgba(37,99,235,0.40)] hover:shadow-[0_26px_64px_-34px_rgba(0,0,0,0.52),0_18px_44px_-24px_rgba(79,70,229,0.34)] hover:bg-white/95 hover:scale-[1.03] hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-800 before:pointer-events-none before:absolute before:inset-0 before:bg-gradient-to-br before:from-blue-500/10 before:via-transparent before:to-transparent before:opacity-0 before:transition-opacity before:duration-300 group-hover:before:opacity-100 after:pointer-events-none after:absolute after:inset-[-60%] after:bg-gradient-to-br after:from-blue-500/0 after:via-blue-500/16 after:to-blue-500/0 after:opacity-0 after:blur-sm after:rotate-12 after:-translate-x-[60%] after:transition-[transform,opacity] after:duration-700 after:ease-out group-hover:after:opacity-80 group-hover:after:translate-x-[60%]"
              iconClassName="w-5 h-5"
              startLabelClassName="text-indigo-700"
              strikeLabelClassName="text-indigo-700/55 scale-[1.01]"
              strikeLineClassName="bg-indigo-700 shadow-[0_0_10px_rgba(99,102,241,0.55)]"
              trailing={
                <span className="relative z-10 text-xs font-normal opacity-75 px-2 py-0.5 bg-indigo-100 rounded-full">
                  {FEATURES.PRICING_ENABLED ? "From $49" : "Limited Spots"}
                </span>
              }
            />
            <a
              href={FEATURES.PRICING_ENABLED ? "/pricing" : "#features"}
              className="group relative inline-flex items-center gap-2 px-8 py-4 border-2 border-white/90 text-white rounded-xl font-bold bg-white/0 hover:bg-white/15 backdrop-blur-sm overflow-hidden transition-[transform,box-shadow,background-color] duration-300 text-base hover:scale-[1.03] hover:-translate-y-0.5 shadow-[0_16px_44px_-32px_rgba(0,0,0,0.32)] hover:shadow-[0_26px_70px_-38px_rgba(0,0,0,0.42)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-800 before:pointer-events-none before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/0 before:via-white/22 before:to-white/0 before:opacity-0 before:transition-opacity before:duration-300 group-hover:before:opacity-100 after:pointer-events-none after:absolute after:inset-[-60%] after:bg-gradient-to-br after:from-white/0 after:via-white/16 after:to-white/0 after:opacity-0 after:blur-sm after:rotate-12 after:-translate-x-[60%] after:transition-[transform,opacity] after:duration-700 after:ease-out group-hover:after:opacity-80 group-hover:after:translate-x-[60%]"
            >
              {FEATURES.PRICING_ENABLED ? "Compare Plans" : "Learn More"}
              <ArrowRight className="w-4.5 h-4.5" />
            </a>
          </div>
          <div className="flex items-center justify-center gap-6 text-sm text-white/80 flex-wrap">
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              {FEATURES.PRICING_ENABLED
                ? "Lifetime access"
                : "Early adopter pricing"}
            </span>
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              macOS 12.0+
            </span>
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              {FEATURES.PRICING_ENABLED
                ? "30-day money-back guarantee"
                : "Priority support"}
            </span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed max-w-md">
                The fastest and most intuitive way to navigate between macOS
                desktops. Lightning-fast switching with beautiful visual
                previews.
              </p>
            </div>

            {/* Product */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Product
              </h3>
              <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                <li>
                  <a
                    href="#features"
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="/pricing"
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="/download"
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    Download
                  </a>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Company
              </h3>
              <div className="text-sm text-gray-600 dark:text-gray-400">—</div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © 2025 SummonIQ. All rights reserved.
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
              Made with <span className="text-red-500">♥</span> for macOS users
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
