import { useMemo, useState } from 'react'
import { Clock, Search, ShieldCheck } from 'lucide-react'
import { cn } from 'cn'
import { Reveal } from '../Reveal'
import { SectionHeader } from '../SectionHeader'
import { TrendChart } from './TrendChart'

type Severity = 'High' | 'Medium' | 'Low'

const severityStyles: Record<Severity, { chip: string; dot: string; text: string }> = {
  High: { chip: 'border-rose-200 bg-rose-50 text-rose-700', dot: 'bg-brand-rose', text: 'text-brand-rose' },
  Medium: { chip: 'border-amber-200 bg-amber-50 text-amber-700', dot: 'bg-brand-amber', text: 'text-brand-amber' },
  Low: { chip: 'border-lime-200 bg-lime-50 text-lime-700', dot: 'bg-lime-600', text: 'text-lime-700' },
}

const riskStats = [
  { label: 'High Risk', severity: 'High' as const, value: 12, share: 7, delta: '+3 today', deltaClass: 'text-rose-700 border-rose-200 bg-rose-50' },
  { label: 'Medium Risk', severity: 'Medium' as const, value: 34, share: 19, delta: '−2 today', deltaClass: 'text-amber-700 border-amber-200 bg-amber-50' },
  { label: 'Low Risk', severity: 'Low' as const, value: 128, share: 74, delta: '+11 today', deltaClass: 'text-lime-700 border-lime-200 bg-lime-50' },
]

const alerts = [
  { id: 'STU-2X41', severity: 'High' as const, score: 92, trigger: 'Deadline cluster + attendance dip', time: '2m ago' },
  { id: 'STU-9Q13', severity: 'High' as const, score: 87, trigger: 'Sleep-loss signal · late submissions', time: '8m ago' },
  { id: 'STU-4T77', severity: 'Medium' as const, score: 64, trigger: 'Scheduling conflict self-report', time: '15m ago' },
  { id: 'STU-1K28', severity: 'Medium' as const, score: 58, trigger: 'Grade drop across 2 subjects', time: '22m ago' },
  { id: 'STU-5H30', severity: 'High' as const, score: 84, trigger: 'Exam anxiety self-report', time: '31m ago' },
  { id: 'STU-7B05', severity: 'Low' as const, score: 31, trigger: 'Workload check-in submitted', time: '44m ago' },
  { id: 'STU-8D92', severity: 'Medium' as const, score: 61, trigger: 'Recurring lateness pattern', time: '52m ago' },
  { id: 'STU-3M64', severity: 'Low' as const, score: 24, trigger: 'Peer support request', time: '1h ago' },
]

const triggers = [
  { label: 'Deadline cluster', pct: 34 },
  { label: 'Sleep disruption', pct: 26 },
  { label: 'Schedule conflict', pct: 18 },
  { label: 'Attendance dip', pct: 12 },
]

const filters: Array<'All' | Severity> = ['All', 'High', 'Medium', 'Low']

export function DashboardPreview() {
  const [filter, setFilter] = useState<'All' | Severity>('All')

  const visibleAlerts = useMemo(
    () => (filter === 'All' ? alerts : alerts.filter((alert) => alert.severity === filter)),
    [filter],
  )

  return (
    <section id="dashboard" className="relative py-24 sm:py-28">
      <div className="orb left-1/2 top-[6%] h-[420px] w-[820px] -translate-x-1/2 bg-brand-rose/10" />
      <div className="orb bottom-[4%] right-[2%] h-[320px] w-[320px] bg-brand-orange/10" />

      <div className="relative mx-auto max-w-6xl px-6">
        <Reveal>
          <SectionHeader
            eyebrow="Live product preview"
            title={
              <>
                The counsellor console, <span className="text-gradient">at a glance.</span>
              </>
            }
            sub="Risk distribution, live alerts, and weekly trends — one prioritized view of every student who needs support."
          />
        </Reveal>

        <Reveal delay={120}>
          <div className="glass mt-14 rounded-[28px] p-2 sm:p-2.5">
            <div className="overflow-hidden rounded-[20px] border border-line bg-white/85">
              {/* Window chrome */}
              <div className="flex items-center gap-3 border-b border-line bg-white/70 px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <span className="grid size-7 place-items-center rounded-lg bg-gradient-to-br from-brand-orange to-brand-rose">
                    <ShieldCheck className="size-3.5 text-white" />
                  </span>
                  <div className="leading-tight">
                    <div className="text-xs font-semibold text-ink">Counsellor Console</div>
                    <div className="text-[0.62rem] text-ink-dim">Spring Term · North Wing</div>
                  </div>
                </div>

                <div className="mx-auto hidden w-full max-w-xs items-center gap-2 rounded-full border border-line bg-stone-100/70 px-3 py-1.5 md:flex">
                  <Search className="size-3.5 text-ink-dim" />
                  <span className="text-[0.68rem] text-ink-dim">Search anonymized ID…</span>
                  <kbd className="ml-auto rounded border border-line bg-white/70 px-1.5 py-px text-[0.6rem] text-ink-dim">⌘K</kbd>
                </div>

                <div className="ml-auto flex items-center gap-3">
                  <span className="flex items-center gap-1.5 rounded-full border border-lime-200 bg-lime-50 px-2.5 py-1 text-[0.62rem] font-medium tracking-[0.12em] text-lime-700">
                    <span className="relative flex size-1.5">
                      <span className="absolute inline-flex size-full rounded-full bg-lime-600 animate-pulse-ring" />
                      <span className="relative inline-flex size-1.5 rounded-full bg-lime-600" />
                    </span>
                    LIVE
                  </span>
                  <div className="flex -space-x-2">
                    {['AM', 'JT', '+3'].map((initials, i) => (
                      <span
                        key={initials}
                        className={cn(
                          'grid size-7 place-items-center rounded-full border-2 border-white text-[0.6rem] font-medium text-white',
                          i === 0 && 'bg-gradient-to-br from-brand-orange to-brand-orange/70',
                          i === 1 && 'bg-gradient-to-br from-brand-rose to-brand-rose/70',
                          i === 2 && 'bg-stone-100 text-ink-mid',
                        )}
                      >
                        {initials}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-4 sm:p-6">
                <div className="grid gap-4 sm:grid-cols-3">
                  {riskStats.map((stat) => (
                    <div key={stat.label} className="glass rounded-2xl p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-medium text-ink-mid">
                          <span className={cn('size-1.5 rounded-full', severityStyles[stat.severity].dot)} />
                          {stat.label}
                        </div>
                        <span className={cn('rounded-full border px-2 py-0.5 text-[0.62rem] font-medium', stat.deltaClass)}>
                          {stat.delta}
                        </span>
                      </div>
                      <div className="mt-3 flex items-end gap-2">
                        <span className="text-[2rem] font-semibold leading-none tracking-tight text-ink tabular-nums">
                          {stat.value}
                        </span>
                        <span className="mb-1 text-[0.68rem] text-ink-dim">of 174 monitored</span>
                      </div>
                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-stone-100">
                        <div
                          className={cn(
                            'h-full rounded-full',
                            stat.severity === 'High' && 'bg-gradient-to-r from-brand-rose to-brand-rose/60',
                            stat.severity === 'Medium' && 'bg-gradient-to-r from-brand-amber to-brand-amber/60',
                            stat.severity === 'Low' && 'bg-gradient-to-r from-lime-600 to-lime-600/60',
                          )}
                          style={{ width: `${stat.share}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-[1.45fr_1fr]">
                  {/* Alert queue */}
                  <div className="glass rounded-2xl p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <h3 className="text-sm font-semibold text-ink">Live Alert Queue</h3>
                        <span className="flex items-center gap-1.5 rounded-full border border-lime-200 bg-lime-50 px-2 py-0.5 text-[0.62rem] font-medium tracking-[0.12em] text-lime-700">
                          <span className="size-1 rounded-full bg-lime-600" />
                          LIVE
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 rounded-full border border-line bg-stone-100/70 p-1">
                        {filters.map((item) => (
                          <button
                            key={item}
                            type="button"
                            onClick={() => setFilter(item)}
                            className={cn(
                              'rounded-full px-2.5 py-1 text-[0.7rem] font-medium text-ink-dim transition-colors duration-200',
                              filter === item ? 'chip-active' : 'hover:text-ink-mid',
                            )}
                          >
                            {item}
                            <span className="ml-1 text-[0.62rem] text-ink-dim">
                              {item === 'All' ? alerts.length : alerts.filter((a) => a.severity === item).length}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mt-3 max-h-[326px] overflow-y-auto thin-scroll">
                      {visibleAlerts.map((alert, index) => (
                        <div
                          key={alert.id}
                          className="flex items-center gap-3 rounded-xl px-2 py-3 transition-colors duration-200 hover:bg-stone-50 [&:not(:last-child)]:border-b [&:not(:last-child)]:border-line"
                        >
                          <span className="relative flex size-2 shrink-0">
                            {index === 0 && filter === 'All' && (
                              <span
                                className={cn(
                                  'absolute inline-flex size-full rounded-full opacity-75 animate-pulse-ring',
                                  severityStyles[alert.severity].dot,
                                )}
                              />
                            )}
                            <span className={cn('relative inline-flex size-2 rounded-full', severityStyles[alert.severity].dot)} />
                          </span>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[0.8rem] font-semibold tracking-tight text-ink tabular-nums">{alert.id}</span>
                              <span className={cn('text-[0.68rem] font-medium tabular-nums', severityStyles[alert.severity].text)}>
                                Stress {alert.score}
                              </span>
                            </div>
                            <div className="truncate text-[0.72rem] text-ink-dim">{alert.trigger}</div>
                          </div>

                          <div className="ml-auto flex items-center gap-3">
                            <span
                              className={cn(
                                'rounded-full border px-2 py-0.5 text-[0.62rem] font-medium',
                                severityStyles[alert.severity].chip,
                              )}
                            >
                              {alert.severity}
                            </span>
                            <span className="hidden items-center gap-1 text-[0.65rem] text-ink-dim tabular-nums sm:flex">
                              <Clock className="size-3" />
                              {alert.time}
                            </span>
                          </div>
                        </div>
                      ))}
                      {visibleAlerts.length === 0 && (
                        <div className="py-10 text-center text-xs text-ink-dim">No alerts in this tier — all clear.</div>
                      )}
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-line pt-3 text-[0.65rem] text-ink-dim">
                      <span>2,304 signals synced · model run 12s ago</span>
                      <button type="button" className="text-brand-orange transition-colors hover:text-brand-rose">
                        Open full queue →
                      </button>
                    </div>
                  </div>

                  {/* Right column */}
                  <div className="flex flex-col gap-4">
                    <div className="glass rounded-2xl p-5">
                      <TrendChart />
                    </div>

                    <div className="glass rounded-2xl p-5">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-ink">Top Triggers</h3>
                        <span className="text-[0.65rem] text-ink-dim">Last 7 days</span>
                      </div>
                      <div className="mt-4 space-y-3">
                        {triggers.map((trigger) => (
                          <div key={trigger.label}>
                            <div className="flex items-center justify-between text-[0.72rem]">
                              <span className="text-ink-mid">{trigger.label}</span>
                              <span className="font-medium text-ink tabular-nums">{trigger.pct}%</span>
                            </div>
                            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-stone-100">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-brand-orange to-brand-rose transition-all duration-500"
                                style={{ width: `${(trigger.pct / 34) * 100}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
