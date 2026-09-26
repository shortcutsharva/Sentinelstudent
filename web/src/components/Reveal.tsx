import { useEffect, useRef, type ElementType, type ReactNode } from 'react'
import { cn } from 'cn'

type RevealProps = {
  children: ReactNode
  className?: string
  delay?: number
  as?: ElementType
}

export function Reveal({ children, className, delay = 0, as: Tag = 'div' }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <Tag
      ref={ref}
      className={cn('reveal', className)}
      style={delay ? ({ '--reveal-delay': `${delay}ms` } as React.CSSProperties) : undefined}
    >
      {children}
    </Tag>
  )
}
