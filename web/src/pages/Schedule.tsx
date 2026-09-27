import { useMemo } from 'react'
import { CalendarDays, Clock3, MapPin, Video } from 'lucide-react'
import { cn } from 'cn'
import type { Severity, Student } from '@/lib/types'
import { useDashboardData } from '@/lib/useDashboardData'
import { Panel } from '@/components/dashboard/Panel'
import { severityStyles } from '@/components/dashboard/severity'

type DayKey = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri'

interface WeekDay {
  key: DayKey
  /** e.g. "28 Sep" */
  date: string
  isToday: boolean
  isPast: boolean
}

type SessionStatus = 'Upcoming' | 'In progress' | 'Completed' | 'No-show' | 'Cancelled'

interface Session {
  id: string
  title: string
  dayIndex: number
  /** Minutes from midnight. */
  start: number
  durationMin: number
  /** e.g. "09:00 – 09:45" */
  time: string
  mode: 'In person' | 'Video'
  room: string
  status: SessionStatus
  student?: Student
  severity?: Severity
  admin?: boolean
}

const DAY_KEYS: DayKey[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** Uneven, real-world slots — gaps between sessions vary, afternoons are lighter. */
const SLOTS = [540, 585, 660, 705, 810, 855, 930, 975]

/**
 * Recurring work that a counsellor actually has — these claim their slots before
 * students are placed, so nobody double-books the walk-in block.
 */
const ADMIN_BLOCKS = [
  { id: 'admin-notes', title: 'Case notes & filing', dayIndex: 2, slot: 7, durationMin: 45, room: 'Office' },
  { id: 'admin-walkin', title: 'Walk-in hours', dayIndex: 3, slot: 5, durationMin: 45, room: 'Room 12' },
]

const TITLES: Record<Severity, string[]> = {
  'VERY HIGH': ['Urgent check-in', 'Safety & stress review'],
  HIGH: ['Risk follow-up', 'Stress debrief'],
  MODERATE: ['Wellbeing check-in', 'Academic plan review'],
  WATCH: ['Early support check-in', 'Workload triage'],
  LOW: ['Study planning chat', 'Term check-in'],
}

const statusStyles: Record<SessionStatus, string> = {
  Upcoming: 'border-line bg-stone-100 text-ink-mid',
  'In progress': 'border-brand-orange/25 bg-brand-orange/8 text-brand-orange',
  Completed: 'border-lime-200 bg-lime-50 text-lime-700',
  'No-show': 'border-rose-200 bg-rose-50 text-rose-700',
  Cancelled: 'border-stone-300/70 bg-stone-200/60 text-ink-dim',
}

/** FNV-1a — deterministic, so renders stay stable while looking non-uniform. */
function hash(value: string): number {
  let result = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index)
    result = Math.imul(result, 16777619)
  }
  return result >>> 0
}

function formatClock(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
}

function formatRange(start: number, durationMin: number): string {
  return `${formatClock(start)} – ${formatClock(start + durationMin)}`
}

/** Monday of the working week; on a weekend, jump to the coming Monday. */
function buildWeek(reference: Date): WeekDay[] {
  const weekday = reference.getDay()
  const daysToMonday = weekday === 0 ? 1 : weekday === 6 ? 2 : 1 - weekday
  const monday = new Date(reference)
  monday.setDate(reference.getDate() + daysToMonday)
  monday.setHours(0, 0, 0, 0)

  return DAY_KEYS.map((key, index) => {
    const date = new Date(monday)
    date.setDate(monday.getDate() + index)
    const isToday =
      date.getDate() === reference.getDate() &&
      date.getMonth() === reference.getMonth() &&
      date.getFullYear() === reference.getFullYear()
    return {
      key,
      date: `${date.getDate()} ${MONTHS[date.getMonth()]}`,
      isToday,
      isPast: !isToday && date.getTime() < reference.getTime(),
    }
  })
}

function statusFor(
  dayIndex: number,
  start: number,
  durationMin: number,
  todayIndex: number,
  nowMin: number,
  seed: number,
): SessionStatus {
  const isPastDay = todayIndex >= 0 && dayIndex < todayIndex
  const isToday = dayIndex === todayIndex
  const hasEnded = nowMin >= start + durationMin
  const hasStarted = nowMin >= start

  if (isPastDay || (isToday && hasEnded)) {
    if (seed % 11 === 0) return 'Cancelled'
    if (seed % 7 === 0) return 'No-show'
    return 'Completed'
  }
  if (isToday && hasStarted) return 'In progress'
  return 'Upcoming'
}

/**
 * Sessions come from the students the pipeline actually flagged, but the booking
 * itself is laid out like a real week: uneven day load, mixed slot lengths,
 * rooms/modes, statuses resolved against the current clock.
 */
function buildSessions(students: Student[], week: WeekDay[], now: Date): Session[] {
  const todayIndex = week.findIndex((day) => day.isToday)
  const nowMin = now.getHours() * 60 + now.getMinutes()
  const booked = new Set<string>()
  const sessions: Session[] = []

  for (const block of ADMIN_BLOCKS) {
    booked.add(`${block.dayIndex}-${block.slot}`)
    const start = SLOTS[block.slot]
    sessions.push({
      id: block.id,
      title: block.title,
      dayIndex: block.dayIndex,
      start,
      durationMin: block.durationMin,
      time: formatRange(start, block.durationMin),
      mode: 'In person',
      room: block.room,
      status: statusFor(block.dayIndex, start, block.durationMin, todayIndex, nowMin, block.slot),
      admin: true,
    })
  }

  const prioritised = [...students]
    .filter((student) => student.leadTimeWeeks > 0)
    .sort((a, b) => b.risk - a.risk)
    .slice(0, 11)

  for (const student of prioritised) {
    const seed = hash(`${student.id}${student.severity}`)
    let slotIndex = seed % SLOTS.length
    let dayIndex = (seed >>> 3) % DAY_KEYS.length
    let attempts = 0

    while (booked.has(`${dayIndex}-${slotIndex}`) && attempts < 40) {
      slotIndex = (slotIndex + 1) % SLOTS.length
      if (slotIndex === 0) dayIndex = (dayIndex + 1) % DAY_KEYS.length
      attempts += 1
    }
    if (booked.has(`${dayIndex}-${slotIndex}`)) continue
    booked.add(`${dayIndex}-${slotIndex}`)

    const start = SLOTS[slotIndex]
    const durationMin = (seed >>> 5) % 3 === 0 ? 45 : 30
    const mode = seed % 3 === 0 ? 'Video' : 'In person'
    const variants = TITLES[student.severity]

    sessions.push({
      id: `${student.id}-${dayIndex}-${slotIndex}`,
      title: variants[(seed >>> 7) % variants.length],
      dayIndex,
      start,
      durationMin,
      time: formatRange(start, durationMin),
      mode,
      room: mode === 'Video' ? 'Video link' : `Room ${10 + ((seed >>> 9) % 6)}`,
      status: statusFor(dayIndex, start, durationMin, todayIndex, nowMin, seed),
      student,
      severity: student.severity,
    })
  }

  return sessions.sort((a, b) => a.dayIndex - b.dayIndex || a.start - b.start)
}

function StatusChip({ status, className }: { status: SessionStatus; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center whitespace-nowrap rounded-full border px-2 py-px text-[0.6rem] font-medium',
        statusStyles[status],
        className,
      )}
    >
      {status}
    </span>
  )
}

export function Schedule() {
  const { status, data } = useDashboardData()

  const { week, sessions, range, counts } = useMemo(() => {
    const builtWeek = buildWeek(new Date())
    const builtSessions = data ? buildSessions(data.students, builtWeek, new Date()) : []
    const tally: Record<SessionStatus, number> = {
      Upcoming: 0,
      'In progress': 0,
      Completed: 0,
      'No-show': 0,
      Cancelled: 0,
    }
    for (const session of builtSessions) tally[session.status] += 1

    return {
      week: builtWeek,
      sessions: builtSessions,
      range: `${builtWeek[0].key} ${builtWeek[0].date} – ${builtWeek[4].key} ${builtWeek[4].date}`,
      counts: tally,
    }
  }, [data])

  const statusesWithCount = (Object.keys(counts) as SessionStatus[]).filter(
    (key) => counts[key] > 0,
  )

  return (
    <div className="mx-auto max-w-5xl">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-ink">Scheduled Sessions</h1>
          <p className="mt-1 text-[0.78rem] text-ink-dim">
            {status === 'ready' ? `Week of ${range} · prioritised by risk` : 'Loading the counselling week…'}
          </p>
        </div>
        {data && (
          <div className="flex flex-wrap gap-1.5">
            <span className="flex items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-1 text-[0.62rem] font-medium text-ink-mid">
              <CalendarDays className="size-3" />
              {range}
            </span>
            <span className="rounded-full border border-line bg-surface px-2.5 py-1 text-[0.62rem] font-medium text-ink-mid tabular-nums">
              {sessions.length} SESSIONS
            </span>
          </div>
        )}
      </header>

      {status === 'loading' && (
        <div className="glass mt-6 rounded-2xl p-10 text-center text-xs text-ink-dim">Loading schedule…</div>
      )}

      {status === 'ready' && sessions.length === 0 && (
        <Panel className="mt-6">
          <div className="flex flex-col items-center gap-2 py-14 text-center">
            <CalendarDays className="size-6 text-ink-dim" />
            <p className="text-sm font-medium text-ink">No sessions scheduled</p>
            <p className="text-xs text-ink-dim">No students currently need a flagged check-in.</p>
          </div>
        </Panel>
      )}

      {status === 'ready' && sessions.length > 0 && (
        <>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {statusesWithCount.map((key) => (
              <span
                key={key}
                className={cn(
                  'rounded-full border px-2.5 py-0.5 text-[0.65rem] font-medium',
                  statusStyles[key],
                )}
              >
                {counts[key]} {key.toLowerCase()}
              </span>
            ))}
          </div>

          {/* Week grid */}
          <Panel className="mt-4 overflow-hidden p-0" bodyClassName="p-0">
            <div className="grid grid-cols-[repeat(5,minmax(0,1fr))] border-b border-line">
              {week.map((day) => (
                <div key={day.key} className="px-3 py-2.5 text-center">
                  <span className="text-[0.7rem] font-semibold text-ink-mid tabular-nums">
                    {day.key} {day.date}
                  </span>
                  {day.isToday && (
                    <span className="ml-1.5 rounded-full bg-brand-orange px-1.5 py-px align-middle text-[0.55rem] font-bold text-white">
                      TODAY
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-[repeat(5,minmax(0,1fr))]">
              {week.map((day, dayIndex) => (
                <div
                  key={day.key}
                  className={cn(
                    'min-h-[190px] border-l border-line first:border-l-0',
                    day.isToday && 'bg-brand-orange/5',
                    day.isPast && 'bg-stone-50/60',
                  )}
                >
                  {sessions
                    .filter((session) => session.dayIndex === dayIndex)
                    .map((session) => (
                      <article
                        key={session.id}
                        className={cn(
                          'group m-1.5 rounded-lg border border-line bg-surface p-2 transition-all duration-200 hover:border-brand-orange/30 hover:shadow-[0_6px_18px_-10px_rgba(234,88,12,0.45)]',
                          session.admin && 'border-dashed',
                        )}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="flex items-center gap-1 text-[0.62rem] font-medium text-ink-mid tabular-nums">
                            <Clock3 className="size-2.5" />
                            {session.time}
                          </span>
                          <StatusChip status={session.status} />
                        </div>
                        <span
                          className={cn(
                            'mt-1.5 block h-0.5 w-7 rounded-full',
                            session.severity
                              ? severityStyles[session.severity].dot
                              : 'bg-stone-300',
                          )}
                        />
                        <p className="mt-1 text-[0.7rem] font-medium leading-tight text-ink">
                          {session.title}
                        </p>
                        <p className="mt-0.5 text-[0.65rem] text-ink-dim tabular-nums">
                          {session.student ? `${session.student.name ?? 'Student'} · ${session.student.id}` : 'Counsellor block'}
                        </p>
                        <p className="mt-1 flex items-center gap-1 text-[0.6rem] text-ink-dim">
                          {session.mode === 'Video' ? (
                            <Video className="size-2.5" />
                          ) : (
                            <MapPin className="size-2.5" />
                          )}
                          {session.room}
                        </p>
                      </article>
                    ))}
                </div>
              ))}
            </div>
          </Panel>

          {/* Table view */}
          <Panel title="All sessions" className="mt-4" bodyClassName="px-0 pb-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-left">
                <thead>
                  <tr className="border-y border-line bg-stone-50/70">
                    {['Session', 'When', 'Student', 'Status', 'Priority'].map((heading) => (
                      <th
                        key={heading}
                        className="px-4 py-2.5 text-[0.68rem] font-semibold uppercase tracking-wider text-ink-dim"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((session) => (
                    <tr
                      key={session.id}
                      className="border-b border-line transition-colors last:border-b-0 hover:bg-stone-50/60"
                    >
                      <td className="px-4 py-3">
                        <div className="text-[0.78rem] font-medium text-ink">{session.title}</div>
                        <div className="mt-0.5 flex items-center gap-1.5 text-[0.65rem] text-ink-dim">
                          {session.mode === 'Video' ? (
                            <Video className="size-3" />
                          ) : (
                            <MapPin className="size-3" />
                          )}
                          {session.room} · {session.durationMin} min
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[0.75rem] text-ink-mid tabular-nums">
                        <div>
                          {week[session.dayIndex].key} {week[session.dayIndex].date}
                        </div>
                        <div className="text-[0.65rem] text-ink-dim">{session.time}</div>
                      </td>
                      <td className="px-4 py-3 text-[0.75rem] text-ink tabular-nums">
                        {session.student ? (
                          <>
                            <span className="font-medium">{session.student.name ?? 'Student'}</span>
                            <span className="ml-1.5 text-ink-dim">{session.student.id}</span>
                          </>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <StatusChip status={session.status} className="text-[0.65rem]" />
                      </td>
                      <td className="px-4 py-3">
                        {session.severity ? (
                          <span
                            className={cn(
                              'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[0.65rem] font-medium',
                              severityStyles[session.severity].chip,
                            )}
                          >
                            {session.severity}
                          </span>
                        ) : (
                          <span className="text-[0.65rem] text-ink-dim">Admin</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </>
      )}
    </div>
  )
}
