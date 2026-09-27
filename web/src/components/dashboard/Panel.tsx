import type { ReactNode } from 'react'
import { cn } from 'cn'

/** White rounded surface used for every dashboard panel. */
export function Panel({
  title,
  action,
  className,
  bodyClassName,
  children,
}: {
  title?: ReactNode
  action?: ReactNode
  className?: string
  bodyClassName?: string
  children: ReactNode
}) {
  return (
    <section className={cn('glass rounded-2xl p-5', className)}>
      {(title || action) && (
        <header className="flex items-center justify-between gap-3">
          {title ? <h2 className="text-sm font-semibold tracking-tight text-ink">{title}</h2> : null}
          {action}
        </header>
      )}
      <div className={cn(title || action ? 'mt-4' : undefined, bodyClassName)}>{children}</div>
    </section>
  )
}
