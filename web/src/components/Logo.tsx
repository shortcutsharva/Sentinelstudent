import { ShieldCheck } from 'lucide-react'
import { cn } from 'cn'

export function Logo({ className }: { className?: string }) {
  return (
    <a href="#top" className={cn('group flex items-center gap-2.5', className)}>
      <span className="grid size-8 place-items-center rounded-[10px] bg-gradient-to-br from-brand-orange to-brand-rose shadow-[0_8px_22px_-8px_rgba(234,88,12,0.6)] transition-transform duration-300 group-hover:scale-105">
        <ShieldCheck className="size-4 text-white" />
      </span>
      <span className="text-[0.95rem] font-semibold tracking-tight text-ink">
        Student <span className="text-gradient-warm">Sentinel</span>
      </span>
    </a>
  )
}
