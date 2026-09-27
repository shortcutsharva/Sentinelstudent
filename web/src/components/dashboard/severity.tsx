import { cn } from 'cn'
import type { Confidence, Severity, TrajectoryState } from '@/lib/types'

/**
 * Severity runs LOW -> VERY HIGH in the pipeline; the dashboard shows five
 * bands but groups them into three priority tiers (high / medium / low),
 * matching the wireframe's priority summary.
 */
export const severityStyles: Record<
  Severity,
  { chip: string; dot: string; text: string; bar: string; hex: string }
> = {
  'VERY HIGH': {
    chip: 'border-rose-200 bg-rose-50 text-rose-700',
    dot: 'bg-brand-rose',
    text: 'text-brand-rose',
    bar: 'from-brand-rose to-brand-rose/55',
    hex: '#E11D48',
  },
  HIGH: {
    chip: 'border-rose-200 bg-rose-50 text-rose-700',
    dot: 'bg-brand-rose',
    text: 'text-brand-rose',
    bar: 'from-brand-rose to-brand-rose/55',
    hex: '#E11D48',
  },
  MODERATE: {
    chip: 'border-amber-200 bg-amber-50 text-amber-700',
    dot: 'bg-brand-amber',
    text: 'text-brand-amber',
    bar: 'from-brand-amber to-brand-amber/55',
    hex: '#D97706',
  },
  WATCH: {
    chip: 'border-brand-orange/25 bg-brand-orange/8 text-brand-orange',
    dot: 'bg-brand-orange',
    text: 'text-brand-orange',
    bar: 'from-brand-orange to-brand-orange/55',
    hex: '#EA580C',
  },
  LOW: {
    chip: 'border-lime-200 bg-lime-50 text-lime-700',
    dot: 'bg-lime-600',
    text: 'text-lime-700',
    bar: 'from-lime-600 to-lime-600/55',
    hex: '#65A30D',
  },
}

export const severityOrder: Severity[] = ['VERY HIGH', 'HIGH', 'MODERATE', 'WATCH', 'LOW']

export const trajectoryStyles: Record<TrajectoryState, string> = {
  'RAPIDLY ESCALATING': 'border-rose-200 bg-rose-50 text-rose-700',
  ESCALATING: 'border-amber-200 bg-amber-50 text-amber-700',
  EMERGING: 'border-brand-orange/25 bg-brand-orange/8 text-brand-orange',
  STABLE: 'border-lime-200 bg-lime-50 text-lime-700',
}

export const confidenceStyles: Record<Confidence, string> = {
  HIGH: 'text-brand-rose',
  MEDIUM: 'text-brand-amber',
  LOW: 'text-ink-dim',
}

/** Trajectory reads more naturally as a sentence in the UI. */
export const trajectoryLabels: Record<TrajectoryState, string> = {
  'RAPIDLY ESCALATING': 'Rapidly escalating',
  ESCALATING: 'Escalating',
  EMERGING: 'Emerging',
  STABLE: 'Stable',
}

export function SeverityChip({ severity, className }: { severity: Severity; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[0.65rem] font-medium tracking-wide',
        severityStyles[severity].chip,
        className,
      )}
    >
      <span className={cn('size-1.5 rounded-full', severityStyles[severity].dot)} />
      {severity}
    </span>
  )
}
