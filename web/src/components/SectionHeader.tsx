import type { ReactNode } from 'react'
import { cn } from 'cn'

type SectionHeaderProps = {
  eyebrow: string
  title: ReactNode
  sub?: string
  align?: 'center' | 'left'
}

export function SectionHeader({ eyebrow, title, sub, align = 'center' }: SectionHeaderProps) {
  return (
    <div className={cn('max-w-2xl', align === 'center' ? 'mx-auto text-center' : 'text-left')}>
      <div className="text-gradient-warm text-xs font-semibold uppercase tracking-[0.22em]">{eyebrow}</div>
      <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-[2.6rem]">
        {title}
      </h2>
      {sub && <p className="mt-4 text-base leading-relaxed text-ink-mid sm:text-lg">{sub}</p>}
    </div>
  )
}
