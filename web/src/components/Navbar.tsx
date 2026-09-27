import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { cn } from 'cn'
import { Logo } from './Logo'

const links = [
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#features', label: 'Features' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '#impact', label: 'Impact' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-colors duration-300',
        scrolled || open
          ? 'border-b border-line bg-white/75 backdrop-blur-xl'
          : 'border-b border-transparent',
      )}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Logo />

        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm text-ink-mid transition-colors hover:bg-stone-900/5 hover:text-ink"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/dashboard"
            className="btn-gradient hidden rounded-lg px-4 py-2 text-sm font-medium sm:inline-flex"
          >
            View Dashboard
          </a>
          <button
            type="button"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="grid size-9 place-items-center rounded-lg border border-line text-ink md:hidden"
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-line bg-white/95 px-5 pb-5 pt-2 md:hidden">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-sm text-ink-mid transition-colors hover:bg-stone-900/5 hover:text-ink"
            >
              {link.label}
            </a>
          ))}
          <a
            href="/dashboard"
            onClick={() => setOpen(false)}
            className="btn-gradient mt-2 flex justify-center rounded-lg px-4 py-2.5 text-sm font-medium"
          >
            View Dashboard
          </a>
        </div>
      )}
    </header>
  )
}
