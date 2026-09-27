import type { DeviatingSignal } from '@/lib/types'
import { cn } from 'cn'

/**
 * Horizontal bars for the student's current-week deviations.
 *
 * Bar length is the z-score relative to this student's largest deviation, NOT
 * the pipeline's per-signal `risk`. That risk is a logistic transform that
 * saturates above z≈2 (90% at z=2, 97% at z=2.5), and this list only ever
 * contains signals with z >= 2 — so every bar pinned near 100% carried no
 * information. Relative z makes each signal's share of the deviation legible;
 * the exact z-score stays visible as the numeric readout.
 */
export function SignalBarGraph({ signals }: { signals: DeviatingSignal[] }) {
  if (signals.length === 0) {
    return (
      <p className="py-6 text-center text-xs text-ink-dim">
        No meaningful deviation from baseline this week.
      </p>
    )
  }

  const maxZ = signals.reduce((max, signal) => Math.max(max, signal.z), 0) || 1

  return (
    <ul className="space-y-2.5">
      {signals.map((signal) => (
        <li key={signal.signal}>
          <div className="flex items-baseline justify-between gap-3">
            <span className="truncate text-[0.72rem] text-ink-mid">{signal.signal}</span>
            <span
              className={cn(
                'shrink-0 text-[0.68rem] font-medium tabular-nums',
                signal.strong ? 'text-brand-rose' : 'text-ink-dim',
              )}
            >
              z {signal.z.toFixed(1)}
            </span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-stone-100">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                signal.strong
                  ? 'bg-gradient-to-r from-brand-rose to-brand-rose/50'
                  : 'bg-gradient-to-r from-brand-amber to-brand-amber/50',
              )}
              style={{ width: `${Math.max(4, (signal.z / maxZ) * 100)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}
