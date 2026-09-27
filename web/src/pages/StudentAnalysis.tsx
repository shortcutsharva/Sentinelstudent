import { useEffect, useMemo, useRef, useState } from 'react'
import { AlertTriangle, CalendarDays, Mail, Search, TrendingDown, TrendingUp, UserRound, X } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { cn } from 'cn'
import { normalizeStudentId, rankSignals, summarizePriorities } from '@/lib/api'
import type { HeatmapPoint, SignalTransition, Student, TrajectoryEvent } from '@/lib/types'
import { useDashboardData } from '@/lib/useDashboardData'
import { Panel } from '@/components/dashboard/Panel'
import { SignalBarGraph } from '@/components/dashboard/SignalBarGraph'
import { TimelineChart } from '@/components/dashboard/TimelineChart'
import {
  SeverityChip,
  confidenceStyles,
  severityStyles,
  trajectoryLabels,
  trajectoryStyles,
} from '@/components/dashboard/severity'

const FEATURE_LABELS: Record<string, string> = {
  class_participation: 'Class participation',
  arrival_irregularity: 'Arrival irregularity',
  early_departures: 'Early departures',
  extracurricular_activity: 'Extracurricular activity',
  library_resource_usage: 'Library/resource usage',
  lms_session_duration: 'LMS session duration',
  academic_help_requests: 'Academic-help requests',
  meal_usage: 'Meal usage',
  transport_irregularity: 'Transport irregularity',
  schedule_changes: 'Schedule changes',
  digital_timing_shift: 'Digital timing shift',
}

const LOWER_IS_CONCERNING = new Set([
  'class_participation',
  'extracurricular_activity',
  'library_resource_usage',
  'lms_session_duration',
  'meal_usage',
])

export function StudentAnalysis() {
  const { status, data } = useDashboardData()
  const [params, setParams] = useSearchParams()
  const [action, setAction] = useState<'mentor' | 'parent' | 'session' | null>(null)

  /** Deep link from Requests (?student=STU-031) pre-fills the search on mount. */
  const [query, setQuery] = useState(() => params.get('student') ?? '')

  const students = useMemo(() => data?.students ?? [], [data])

  const clear = () => {
    setQuery('')
    setParams({}, { replace: true })
  }

  /** Live filter: "7", "STU-007" and "007" all resolve to the same student. */
  const matches = useMemo(() => {
    const term = query.trim()
    if (!term) return students

    const normalized = normalizeStudentId(term)
    if (normalized) {
      return students.filter((student) => student.id === normalized)
    }

    const lowered = term.toLowerCase()
    return students.filter(
      (student) =>
        student.id.toLowerCase().includes(lowered) ||
        student.name?.toLowerCase().includes(lowered) ||
        student.contributors.some((contributor) => contributor.toLowerCase().includes(lowered)),
    )
  }, [query, students])

  const searching = query.trim().length > 0
  const selected: Student | undefined = searching ? matches[0] : undefined

  return (
    <div className="mx-auto max-w-6xl">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-ink">Student Analysis</h1>
          <p className="mt-1 text-[0.78rem] text-ink-dim">
            Nine-week behavioural trajectory for each monitored student.
          </p>
        </div>
        {data && (
          <span
            className={cn(
              'flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.62rem] font-medium tracking-[0.12em]',
              data.generatedFrom.startsWith('supabase:')
                ? 'border-lime-200 bg-lime-50 text-lime-700'
                : 'border-amber-200 bg-amber-50 text-amber-700',
            )}
          >
            <span
              className={cn(
                'size-1 rounded-full',
                data.generatedFrom.startsWith('supabase:') ? 'bg-lime-600' : 'bg-brand-amber',
              )}
            />
            {data.generatedFrom.startsWith('supabase:') ? 'LIVE' : 'ALLEN DEMO SNAPSHOT'} · {data.studentCount} STUDENTS
          </span>
        )}
      </header>

      {/* Search */}
      <div className="mt-6">
        <label htmlFor="student-search" className="sr-only">
          Search student by ID
        </label>
        <div
          className={cn(
            'flex items-center gap-2.5 rounded-xl border bg-surface px-4 py-3 transition-colors',
            searching ? 'border-brand-orange/40' : 'border-line',
          )}
        >
          <Search className="size-4 shrink-0 text-ink-dim" />
          <input
            id="student-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by student name or number — e.g. Aarav or 7"
            className="w-full bg-transparent text-sm text-ink placeholder:text-ink-dim focus:outline-none"
          />
          {searching && (
            <button
              type="button"
              onClick={clear}
              aria-label="Clear search"
              className="grid size-6 shrink-0 place-items-center rounded-full text-ink-dim transition-colors hover:bg-stone-100 hover:text-ink"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {searching && status === 'ready' && (
          <p className="mt-2 text-[0.7rem] text-ink-dim">
            {matches.length === 0
              ? `No student matches “${query.trim()}”. Try a student number such as 7 or 21.`
              : `${matches.length} match${matches.length === 1 ? '' : 'es'} — showing ${selected?.id}.`}
          </p>
        )}
      </div>

      {searching && selected && (
        <section className="mt-5 rounded-xl border border-line bg-surface p-4" aria-label="Selected student actions">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-ink">{selected.name ?? 'Student'}</p>
              <p className="mt-0.5 text-xs text-ink-dim">{selected.id} · fictional demo profile</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setAction('mentor')} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-line px-3 py-2 text-xs font-medium text-ink transition-colors hover:bg-stone-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-orange">
                <UserRound className="size-3.5" /> Contact mentor
              </button>
              <button type="button" onClick={() => setAction('parent')} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-line px-3 py-2 text-xs font-medium text-ink transition-colors hover:bg-stone-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-orange">
                <Mail className="size-3.5" /> Contact parent
              </button>
              <button type="button" onClick={() => setAction('session')} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-brand-orange px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-brand-orange/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-orange">
                <CalendarDays className="size-3.5" /> Schedule session
              </button>
            </div>
          </div>
        </section>
      )}

      {searching && selected && action && (
        <StudentActionDialog
          action={action}
          student={selected}
          onClose={() => setAction(null)}
        />
      )}

      {status === 'loading' && <Skeleton />}

      {status === 'error' && (
        <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
          Could not load student data. Check that <code className="font-mono text-[0.78rem]">SUPABASE_URL</code> and{' '}
          <code className="font-mono text-[0.78rem]">SUPABASE_SECRET_KEY</code> are set in{' '}
          <code className="font-mono text-[0.78rem]">web/.env</code>, then restart the dev server.
        </div>
      )}

      {status === 'ready' && data && (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <SignalPanel student={selected} />
          <StressOverview student={selected} baselineWeeks={data.baselineWeeks} />

          <PriorityPanel students={students} />
          <Panel title="9-week timeline">
            {selected ? (
              <TimelineChart weeks={selected.weeks} baselineWeeks={data.baselineWeeks} />
            ) : (
              <p className="py-10 text-center text-xs text-ink-dim">No student selected.</p>
            )}
          </Panel>

          <CascadePanel student={selected} events={data.events ?? []} className="lg:col-span-2" />
          <CohortSignals students={students} className="lg:col-span-2" />
          <TransitionPanel transitions={data.transitions ?? []} className="lg:col-span-2" />
          <HeatmapPanel points={data.heatmap ?? []} student={selected} currentWeek={data.currentWeek} className="lg:col-span-2" />
        </div>
      )}
    </div>
  )
}

type StudentAction = 'mentor' | 'parent' | 'session'

function StudentActionDialog({
  action,
  student,
  onClose,
}: {
  action: StudentAction
  student: Student
  onClose: () => void
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [duration, setDuration] = useState('30')
  const [mode, setMode] = useState<'In person' | 'Video'>('In person')

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    dialog.showModal()
    return () => dialog.close()
  }, [])

  const contactName = action === 'mentor' ? student.mentorName : student.parentName
  const heading = action === 'mentor' ? 'Contact mentor' : action === 'parent' ? 'Contact parent' : 'Schedule session'

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="student-action-title"
      onClose={onClose}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      className="m-auto w-[min(100%-2rem,32rem)] rounded-2xl border border-line bg-surface p-0 text-ink shadow-2xl backdrop:bg-ink/35"
    >
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[0.65rem] font-medium uppercase tracking-[0.12em] text-ink-dim">{student.name} · {student.id}</p>
            <h2 id="student-action-title" className="mt-1 text-lg font-semibold">{heading}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close dialog" className="grid size-9 shrink-0 place-items-center rounded-lg text-ink-dim hover:bg-stone-100 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-orange">
            <X className="size-4" />
          </button>
        </div>

        {action !== 'session' ? (
          <div className="mt-5">
            <p className="text-sm font-medium text-ink">{contactName}</p>
            <p className="mt-1 text-xs text-ink-dim">{action === 'mentor' ? 'Student mentor' : 'Parent / guardian'} · fictional demo contact</p>
            <p className="mt-3 text-sm font-medium tabular-nums text-ink">
              {action === 'mentor' ? '+91 00000 00001' : '+91 00000 00002'}
              <span className="ml-2 text-xs font-normal text-ink-dim">fake number · not callable</span>
            </p>
            <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs leading-relaxed text-amber-800">
              Demo only — no message is sent. Real contact details are not connected.
            </p>
            <button type="button" onClick={onClose} className="mt-5 min-h-10 rounded-lg bg-brand-orange px-4 py-2 text-xs font-medium text-white hover:bg-brand-orange/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-orange">Done</button>
          </div>
        ) : confirmed ? (
          <div className="mt-5">
            <p className="text-sm font-medium text-ink">Session details prepared for {student.name}.</p>
            <p className="mt-2 text-xs leading-relaxed text-ink-mid">{date} at {time} · {duration} minutes · {mode}</p>
            <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs leading-relaxed text-amber-800">
              Demo only — this session is not saved to the schedule.
            </p>
            <button type="button" onClick={onClose} className="mt-5 min-h-10 rounded-lg bg-brand-orange px-4 py-2 text-xs font-medium text-white hover:bg-brand-orange/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-orange">Done</button>
          </div>
        ) : (
          <form
            className="mt-5 space-y-4"
            onSubmit={(event) => {
              event.preventDefault()
              setConfirmed(true)
            }}
          >
            <p className="text-xs text-ink-dim">Choose proposed session details. This will not create a real booking.</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1.5 text-xs font-medium text-ink-mid">
                Date
                <input required type="date" value={date} onChange={(event) => setDate(event.target.value)} className="min-h-10 rounded-lg border border-line bg-white px-3 text-sm text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-orange" />
              </label>
              <label className="grid gap-1.5 text-xs font-medium text-ink-mid">
                Time
                <input required type="time" value={time} onChange={(event) => setTime(event.target.value)} className="min-h-10 rounded-lg border border-line bg-white px-3 text-sm text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-orange" />
              </label>
              <label className="grid gap-1.5 text-xs font-medium text-ink-mid">
                Duration
                <select value={duration} onChange={(event) => setDuration(event.target.value)} className="min-h-10 rounded-lg border border-line bg-white px-3 text-sm text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-orange">
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">60 minutes</option>
                </select>
              </label>
              <label className="grid gap-1.5 text-xs font-medium text-ink-mid">
                Meeting mode
                <select value={mode} onChange={(event) => setMode(event.target.value as 'In person' | 'Video')} className="min-h-10 rounded-lg border border-line bg-white px-3 text-sm text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-orange">
                  <option>In person</option>
                  <option>Video</option>
                </select>
              </label>
            </div>
            <div className="flex flex-wrap justify-end gap-2 pt-1">
              <button type="button" onClick={onClose} className="min-h-10 rounded-lg border border-line px-4 py-2 text-xs font-medium text-ink-mid hover:bg-stone-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-orange">Cancel</button>
              <button type="submit" className="min-h-10 rounded-lg bg-brand-orange px-4 py-2 text-xs font-medium text-white hover:bg-brand-orange/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-orange">Review session</button>
            </div>
          </form>
        )}
      </div>
    </dialog>
  )
}

function SignalPanel({ student }: { student?: Student }) {
  return (
    <Panel
      title="Deviating signals"
      action={student && <span className="text-[0.68rem] text-ink-dim">week 9 vs baseline</span>}
    >
      {student ? (
        <>
          <SignalBarGraph signals={student.signals} />
          <p className="mt-4 border-t border-line pt-3 text-[0.72rem] leading-relaxed text-ink-mid">
            {student.explanation}
          </p>
        </>
      ) : (
        <p className="py-10 text-center text-xs text-ink-dim">No student selected.</p>
      )}
    </Panel>
  )
}

/** Gauge-style current-risk summary: score, severity, trajectory and lead time. */
function StressOverview({ student, baselineWeeks }: { student?: Student; baselineWeeks: number }) {
  if (!student) {
    return (
      <Panel title="Stress overview">
        <p className="py-10 text-center text-xs text-ink-dim">No student selected.</p>
      </Panel>
    )
  }

  const style = severityStyles[student.severity]
  const rising = student.velocity > 0

  return (
    <Panel title="Stress overview">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-baseline gap-2">
            <span className={cn('text-[2.6rem] font-semibold leading-none tabular-nums', style.text)}>
              {Math.round(student.risk)}
            </span>
            <span className="text-sm text-ink-dim">/ 100</span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <SeverityChip severity={student.severity} />
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[0.65rem] font-medium',
                trajectoryStyles[student.trajectory],
              )}
            >
              {rising ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
              {trajectoryLabels[student.trajectory]}
            </span>
          </div>
        </div>

        <div className="text-right text-[0.7rem] text-ink-dim">
          <div className={cn('font-medium tabular-nums', rising ? 'text-brand-rose' : 'text-lime-700')}>
            {rising ? '+' : ''}
            {student.velocity.toFixed(2)}/wk
          </div>
          <div className="mt-0.5">velocity</div>
        </div>
      </div>

      <div className="mt-5 h-2 overflow-hidden rounded-full bg-stone-100">
        <div
          className={cn('h-full rounded-full bg-gradient-to-r transition-all duration-700', style.bar)}
          style={{ width: `${student.risk}%` }}
        />
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 text-[0.72rem] sm:grid-cols-3">
        <Metric label="Population anomaly" value={`${student.anomaly.toFixed(0)}%`} />
        <Metric
          label="Confidence"
          value={student.confidence}
          className={confidenceStyles[student.confidence]}
        />
        <Metric label="Signals deviating" value={`${student.signalCount}`} />
        <Metric
          label="First deviation"
          value={student.firstDeviationWeek > 0 ? `Week ${student.firstDeviationWeek}` : 'None'}
        />
        <Metric label="Early-warning lead" value={`${student.leadTimeWeeks} wk`} />
        <Metric label="Earliest signal" value={student.earliestSignal} />
      </dl>

      <p className="mt-4 flex items-start gap-2 rounded-lg border border-line bg-stone-50 px-3 py-2.5 text-[0.68rem] leading-relaxed text-ink-dim">
        <AlertTriangle className="mt-px size-3.5 shrink-0 text-brand-amber" />
        <span>
          Behavioural change signal, not a diagnosis. Weeks 1&ndash;{baselineWeeks} form the personal
          baseline; {student.detectionType.replace(/_/g, ' ').toLowerCase()}.
        </span>
      </p>
    </Panel>
  )
}

function Metric({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div>
      <dt className="text-ink-dim">{label}</dt>
      <dd className={cn('mt-0.5 font-medium text-ink', className)}>{value}</dd>
    </div>
  )
}

/** Cohort split into the three priority tiers from the wireframe. */
function PriorityPanel({ students }: { students: Student[] }) {
  const { counts, shares } = summarizePriorities(students)
  const tiers = [
    { key: 'high' as const, label: 'High', count: counts.high, share: shares.high, dot: 'bg-brand-rose' },
    { key: 'medium' as const, label: 'Medium', count: counts.medium, share: shares.medium, dot: 'bg-brand-amber' },
    { key: 'low' as const, label: 'Low', count: counts.low, share: shares.low, dot: 'bg-lime-600' },
  ]

  return (
    <Panel title="Priority level" action={<span className="text-[0.68rem] text-ink-dim">{students.length} students</span>}>
      <ul className="space-y-3.5">
        {tiers.map((tier) => (
          <li key={tier.key}>
            <div className="flex items-center justify-between text-[0.75rem]">
              <span className="flex items-center gap-2 text-ink-mid">
                <span className={cn('size-1.5 rounded-full', tier.dot)} />
                {tier.label}
              </span>
              <span className="font-medium text-ink tabular-nums">
                {tier.count}
                <span className="ml-1.5 text-[0.68rem] font-normal text-ink-dim">{tier.share}%</span>
              </span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-stone-100">
              <div
                className={cn(
                  'h-full rounded-full bg-gradient-to-r',
                  tier.key === 'high' && 'from-brand-rose to-brand-rose/55',
                  tier.key === 'medium' && 'from-brand-amber to-brand-amber/55',
                  tier.key === 'low' && 'from-lime-600 to-lime-600/55',
                )}
                style={{ width: `${Math.max(tier.share, 1.5)}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  )
}

/** Which signals are driving risk across the whole cohort. */
function CohortSignals({ students, className }: { students: Student[]; className?: string }) {
  const ranked = rankSignals(students).slice(0, 8)
  const max = ranked[0]?.count ?? 1

  return (
    <Panel
      title="Most common signals across the cohort"
      className={className}
      action={<span className="text-[0.68rem] text-ink-dim">students deviating</span>}
    >
      <div className="grid gap-x-8 gap-y-2.5 sm:grid-cols-2">
        {ranked.map((entry) => (
          <div key={entry.signal}>
            <div className="flex items-baseline justify-between gap-3 text-[0.75rem]">
              <span className="truncate text-ink-mid">{entry.signal}</span>
              <span className="shrink-0 font-medium text-ink tabular-nums">{entry.count}</span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-stone-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-orange to-brand-rose transition-all duration-500"
                style={{ width: `${(entry.count / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Panel>
  )
}

function CascadePanel({
  student,
  events,
  className,
}: {
  student?: Student
  events: TrajectoryEvent[]
  className?: string
}) {
  if (!student) {
    return <Panel title="Behavioural cascade" className={className}><p className="py-8 text-center text-xs text-ink-dim">Search for a student to review their signal sequence.</p></Panel>
  }

  const studentEvents = events.filter((event) => event.studentId === student.id)
  const observedOnsetOrder = student.signalOnsetOrder ?? []
  const firstWeek = student.firstDeviationWeek > 0 ? student.firstDeviationWeek : 1
  const lastWeek = student.weeks.at(-1)?.week ?? 9
  const sampleOnsetOrder = student.signals.slice(0, 5).map((signal, index, signals) => ({
    signal: signal.signal.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, ''),
    label: signal.signal,
    week: firstWeek + Math.floor((index * Math.max(0, lastWeek - firstWeek)) / Math.max(1, signals.length - 1)),
  }))
  const hasSampleOnsetOrder = observedOnsetOrder.length === 0 && sampleOnsetOrder.length > 0
  const onsetOrder = observedOnsetOrder.length ? observedOnsetOrder : sampleOnsetOrder
  const cascadeStart = student.cascadeStartWeek ?? firstWeek
  const cascadeEnd = student.cascadeEndWeek ?? lastWeek

  return (
    <Panel title="Behavioural cascade" className={className} action={student.phase && <span className="rounded-full border border-line px-2.5 py-1 text-[0.65rem] font-medium text-ink-mid">{student.phase}</span>}>
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <div>
          <p className="text-xs leading-relaxed text-ink-mid">{student.whyNow || (hasSampleOnsetOrder ? 'Illustrative sequence based on current deviating signals; onset weeks are sample values.' : student.explanation)}</p>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-[0.7rem]">
            <Metric label="Cascade depth" value={`${student.cascadeDepth ?? (hasSampleOnsetOrder ? onsetOrder.length : 0)} signals`} />
            <Metric label="Cascade duration" value={`${student.cascadeDuration ?? (hasSampleOnsetOrder ? Math.max(1, cascadeEnd - cascadeStart + 1) : 0)} weeks`} />
            <Metric label="Leading signal" value={student.leadingSignal || onsetOrder[0]?.label || 'None'} />
            <Metric label="Convergence" value={(student.convergenceWeek ?? -1) > 0 ? `Week ${student.convergenceWeek}` : 'Not detected'} />
            <Metric label="Early-warning window" value={`${student.earlyWarningWindow ?? student.leadTimeWeeks} weeks`} />
            <Metric label="First deviation" value={student.firstDeviationWeek > 0 ? `Week ${student.firstDeviationWeek}` : 'None'} />
          </dl>
        </div>
        <div>
          <p className="text-[0.65rem] font-medium uppercase tracking-[0.1em] text-ink-dim">Signal onset order{hasSampleOnsetOrder ? ' · illustrative' : ''}</p>
          {onsetOrder.length ? (
            <ol className="mt-2 space-y-2">
              {onsetOrder.map((item, index) => (
                <li key={`${item.signal}-${item.week}`} className="flex items-center gap-3 text-xs">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-stone-100 text-[0.65rem] font-medium text-ink-dim">{index + 1}</span>
                  <span className="min-w-0 flex-1 truncate text-ink-mid">{item.label}</span>
                  <span className="shrink-0 tabular-nums text-ink-dim">W{item.week}</span>
                </li>
              ))}
            </ol>
          ) : <p className="mt-3 text-xs text-ink-dim">No meaningful signal cascade detected.</p>}
        </div>
      </div>
      <div className="mt-4 border-t border-line pt-3">
        <p className="text-[0.65rem] font-medium uppercase tracking-[0.1em] text-ink-dim">Timeline events</p>
        {studentEvents.length ? (
          <ul className="mt-2 flex flex-wrap gap-2">
            {studentEvents.map((event) => (
              <li key={`${event.type}-${event.week}`} title={event.description} className="rounded-lg border border-line bg-stone-50 px-2.5 py-1.5 text-[0.65rem] text-ink-mid">W{event.week} · {event.label}</li>
            ))}
          </ul>
        ) : <p className="mt-2 text-xs text-ink-dim">No event records are available from the live analysis source.</p>}
      </div>
      <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[0.65rem] leading-relaxed text-amber-800">Behavioral anomaly indicators only — not a diagnosis or evidence of causality. Review signals in context.</p>
    </Panel>
  )
}

function TransitionPanel({ transitions, className }: { transitions: SignalTransition[]; className?: string }) {
  const topTransitions = transitions.slice(0, 8)
  return (
    <Panel title="Signal transition patterns" className={className} action={<span className="text-[0.65rem] text-ink-dim">cohort-level · temporal, not causal</span>}>
      {topTransitions.length ? (
        <div className="grid gap-2 sm:grid-cols-2">
          {topTransitions.map((transition) => (
            <div key={`${transition.fromSignal}-${transition.toSignal}`} className="rounded-lg border border-line bg-stone-50 px-3 py-2.5">
              <p className="text-xs font-medium text-ink">{transition.fromLabel} <span className="text-ink-dim">→</span> {transition.toLabel}</p>
              <p className="mt-1 text-[0.65rem] text-ink-dim">Observed in {transition.studentCount} students · median lag {transition.medianLagWeeks} wk</p>
            </div>
          ))}
        </div>
      ) : <p className="py-8 text-center text-xs text-ink-dim">Aggregate transition data is available in snapshot mode only.</p>}
    </Panel>
  )
}

function HeatmapPanel({
  points,
  student,
  currentWeek,
  className,
}: {
  points: HeatmapPoint[]
  student?: Student
  currentWeek: number
  className?: string
}) {
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null)
  const week = selectedWeek ?? currentWeek
  const snapshotSignals = points.filter((point) => point.studentId === student?.id && point.week === week)
  const liveWeek = student?.weeks.find((point) => point.week === week)
  const liveSignals = student && liveWeek?.measurements
    ? Object.entries(liveWeek.measurements).map(([signal, value]) => {
        const label = FEATURE_LABELS[signal] ?? signal.replace(/_/g, ' ')
        const baselineValues = student.weeks.filter((point) => point.week <= 4).map((point) => point.measurements?.[signal]).filter((entry): entry is number => entry !== undefined)
        const mean = baselineValues.reduce((sum, entry) => sum + entry, 0) / (baselineValues.length || 1)
        const variance = baselineValues.reduce((sum, entry) => sum + (entry - mean) ** 2, 0) / (baselineValues.length || 1)
        const std = Math.sqrt(variance) || Math.max(Math.abs(mean) * 0.05, 0.05)
        const direction = LOWER_IS_CONCERNING.has(signal) ? -1 : 1
        const z = direction * (value - mean) / std
        const risk = Math.max(0, Math.min(100, 100 * (1 - Math.exp(-0.35 * Math.max(0, z) ** 2))))
        return { studentId: student.id, week, signal, label, z, risk, deviation: z >= 2 }
      })
    : []
  const signals = snapshotSignals.length ? snapshotSignals : liveSignals.filter((point) => point.z >= 2)
  const studentId = student?.id

  return (
    <Panel title="Signal heatmap" className={className} action={
      studentId && points.length > 0 ? (
        <label className="flex items-center gap-2 text-[0.65rem] text-ink-dim">Week
          <select value={week} onChange={(event) => setSelectedWeek(Number(event.target.value))} className="rounded-md border border-line bg-white px-2 py-1 text-xs text-ink">
            {Array.from({ length: currentWeek }, (_, index) => currentWeek - index).map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>
      ) : null
    }>
      {!studentId ? <p className="py-8 text-center text-xs text-ink-dim">Search for a student to view their signal heatmap.</p> : signals.length ? (
        <div className="grid gap-x-5 gap-y-3 sm:grid-cols-2">
          {signals.map((point) => (
            <div key={point.signal}>
              <div className="flex items-baseline justify-between gap-3 text-[0.7rem]">
                <span className="truncate text-ink-mid">{point.label}</span>
                <span className="shrink-0 tabular-nums text-ink-dim">z {point.z.toFixed(1)}</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-stone-100">
                <div className={cn('h-full rounded-full', point.deviation ? 'bg-brand-rose' : 'bg-lime-600/50')} style={{ width: `${Math.max(2, Math.min(point.risk, 100))}%` }} />
              </div>
            </div>
          ))}
        </div>
      ) : <p className="py-8 text-center text-xs text-ink-dim">No heatmap points for this student/week in the live analysis source.</p>}
    </Panel>
  )
}

function Skeleton() {
  return (
    <div className="mt-6 grid gap-4 lg:grid-cols-2">
      {[0, 1, 2, 3].map((index) => (
        <div key={index} className="glass relative overflow-hidden rounded-2xl p-5">
          <div className="h-3 w-28 rounded bg-stone-200" />
          <div className="mt-4 space-y-2.5">
            <div className="h-2 w-full rounded bg-stone-100" />
            <div className="h-2 w-4/5 rounded bg-stone-100" />
            <div className="h-2 w-3/5 rounded bg-stone-100" />
          </div>
          <span className="absolute inset-y-0 -left-full w-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent" />
        </div>
      ))}
    </div>
  )
}
