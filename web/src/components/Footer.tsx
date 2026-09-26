import { Logo } from './Logo'

const quickLinks = [
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#features', label: 'Features' },
  { href: '#dashboard', label: 'Dashboard' },
  { href: '#impact', label: 'Impact' },
]

export function Footer() {
  return (
    <footer className="relative overflow-hidden pb-10 pt-16">
      <div className="hairline-top mx-auto max-w-6xl" />

      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 pt-12 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-4 text-sm leading-relaxed text-ink-dim">
            Early detection. Smarter support. Healthier students.
          </p>
        </div>

        <div className="flex gap-14">
          <div>
            <div className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-ink-dim">Quick Links</div>
            <ul className="mt-4 space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-ink-mid transition-colors duration-200 hover:text-ink"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-ink-dim">Principles</div>
            <ul className="mt-4 space-y-2.5 text-sm text-ink-mid">
              <li>Privacy-first</li>
              <li>Anonymized by design</li>
              <li>Counsellor-in-the-loop</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-12 flex max-w-6xl flex-col gap-2 border-t border-line px-6 pt-6 text-xs text-ink-dim sm:flex-row sm:items-center sm:justify-between">
        <p>© 2026 Student Sentinel. All rights reserved.</p>
        <p>Student Support Intelligence System</p>
      </div>
    </footer>
  )
}
