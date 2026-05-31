import type { Metadata } from "next";
import "./globals.css";
import { DevPanelWrapper } from "@/components/dev-tools/dev-panel-wrapper";
import { Header } from "@/components/Header";
import { SiteFooter } from "@/components/sections/footer";
import { AnalyticsSetup } from "@/components/providers/analytics-setup";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://winzen.appsummon.com"),
  title: "Winzen - Master Your macOS Workspace",
  description:
    "Transform how you manage your macOS desktops. Switch between spaces effortlessly, organize your windows intelligently, and achieve peak productivity with elegant simplicity.",
  alternates: {
    canonical: "/",
  },
  keywords: [
    "macOS",
    "window management",
    "desktop manager",
    "productivity",
    "Mission Control",
    "spaces",
  ],
  authors: [{ name: "Winzen Team" }],
  openGraph: {
    title: "Winzen - Master Your macOS Workspace",
    description:
      "Transform how you manage your macOS desktops with beautiful visual previews and keyboard shortcuts.",
    siteName: "Winzen",
    type: "website",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    description:
      "Transform how you manage your macOS desktops with beautiful visual previews and keyboard shortcuts.",
    title: "Winzen - Master Your macOS Workspace",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-slate-50 antialiased dark:bg-gray-950">
        <AnalyticsSetup>
          <Header />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </AnalyticsSetup>
        <DevPanelWrapper />
      </body>
    </html>
  );
}
