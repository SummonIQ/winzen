import Link from "next/link";

const footerLinks = [
  { href: "/pricing", label: "Pricing" },
  { href: "/download", label: "Download" },
  { href: "/changelog", label: "Changelog" },
  { href: "/docs", label: "Docs" },
  { href: "/about", label: "About" },
  { href: "/account", label: "Account" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-gray-200/70 bg-white/80 backdrop-blur dark:border-white/10 dark:bg-gray-950/80">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:px-8">
        <div className="max-w-md">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">
            Winzen
          </p>
          <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300">
            The marketing site now acts as the public control plane for
            authentication, account identity, and future subscription flows.
          </p>
        </div>

        <nav className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-gray-600 dark:text-gray-300">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition hover:text-indigo-600 dark:hover:text-indigo-300"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
