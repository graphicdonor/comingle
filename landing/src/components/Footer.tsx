import { BRAND, FOOTER_LINKS } from "@/data/content";

const SOCIALS = [
  { label: "Twitter", href: "#" },
  { label: "Instagram", href: "#" },
  { label: "GitHub", href: "#" },
];

export function Footer() {
  return (
    <footer className="relative border-t border-line bg-ink px-5 py-16 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-2">
            <span className="font-display text-lg font-semibold tracking-tight text-bone">{BRAND}</span>
            <p className="mt-3 max-w-xs text-sm text-mist">Small actions create stronger communities.</p>
          </div>

          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="font-mono text-[10px] uppercase tracking-[0.18em] text-fog">{heading}</h4>
              <ul className="mt-4 space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-sm text-mist transition-colors hover:text-bone">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-6 border-t border-line pt-8 sm:flex-row sm:items-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-fog">
            © {new Date().getFullYear()} {BRAND}. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            {SOCIALS.map((social) => (
              <a
                key={social.label}
                href={social.href}
                className="font-mono text-[11px] uppercase tracking-[0.14em] text-mist transition-colors hover:text-bone"
              >
                {social.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
