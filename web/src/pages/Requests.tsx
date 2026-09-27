import { useEffect, useMemo, useState } from 'react'
import { Clock, Inbox } from 'lucide-react'
import { cn } from 'cn'
import type { StudentRequest } from '@/lib/types'
import { fetchStudentRequests } from '@/lib/api'
import { Panel } from '@/components/dashboard/Panel'

/** Requests are polled so a request sent from the app shows up unprompted. */
const REFRESH_MS = 4000

const statusStyles: Record<StudentRequest['status'], string> = {
  new: 'border-brand-orange/25 bg-brand-orange/8 text-brand-orange',
  reviewing: 'border-brand-amber/25 bg-brand-amber/8 text-brand-amber',
  closed: 'border-lime-200 bg-lime-50 text-lime-700',
}

function timeAgo(iso: string): string {
  const seconds = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function Requests() {
  const [requests, setRequests] = useState<StudentRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState<Set<string>>(new Set())

  useEffect(() => {
    let active = true

    const load = () => {
      fetchStudentRequests().then((records) => {
        if (!active) return
        setRequests(records)
        setLoading(false)
      })
    }

    load()
    const timer = setInterval(load, REFRESH_MS)

    return () => {
      active = false
      clearInterval(timer)
    }
  }, [])

  const newCount = useMemo(
    () => requests.filter((request) => request.status === 'new').length,
    [requests],
  )

  const toggle = (id: string) =>
    setOpen((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  return (
    <div className="mx-auto max-w-5xl">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-ink">Requests</h1>
          <p className="mt-1 text-[0.78rem] text-ink-dim">
            Requests students send from the app, delivered here as soon as they hit send.
          </p>
        </div>
        {requests.length > 0 && (
          <span className="rounded-full border border-brand-orange/25 bg-brand-orange/8 px-2.5 py-1 text-[0.7rem] font-medium text-brand-orange tabular-nums">
            {newCount} new · {requests.length} total
          </span>
        )}
      </header>

      {loading && requests.length === 0 ? (
        <div className="glass mt-6 rounded-2xl p-10 text-center text-xs text-ink-dim">
          Loading requests…
        </div>
      ) : (
        <Panel className="mt-6 p-2" bodyClassName="p-3 sm:p-4">
          {requests.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-center">
              <Inbox className="size-6 text-ink-dim" />
              <p className="text-sm font-medium text-ink">No requests yet</p>
              <p className="text-xs text-ink-dim">
                Anything a student sends from the app appears here automatically.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {requests.map((request) => {
                const expanded = open.has(request.id)
                return (
                  <li key={request.id} className="px-2 py-3.5 sm:px-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="size-2 shrink-0 rounded-full bg-brand-orange" />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[0.82rem] font-semibold tracking-tight text-ink tabular-nums">
                            {request.id}
                          </span>
                          <span className="rounded-full border border-brand-orange/25 bg-brand-orange/8 px-2 py-0.5 text-[0.6rem] font-medium text-brand-orange">
                            {request.type}
                          </span>
                          <span
                            className={cn(
                              'rounded-full border px-2 py-0.5 text-[0.6rem] font-medium',
                              statusStyles[request.status],
                            )}
                          >
                            {request.status}
                          </span>
                        </div>
                        <p
                          className={cn(
                            'mt-1 text-[0.74rem] text-ink-mid',
                            !expanded && 'truncate',
                          )}
                        >
                          {request.message}
                        </p>
                      </div>

                      <span className="hidden items-center gap-1 text-[0.65rem] text-ink-dim tabular-nums sm:flex">
                        <Clock className="size-3" />
                        {timeAgo(request.createdAt)}
                      </span>

                      <button
                        type="button"
                        onClick={() => toggle(request.id)}
                        className="shrink-0 rounded-lg border border-line px-3 py-1.5 text-[0.72rem] font-medium text-ink-mid transition-colors hover:bg-stone-50 hover:text-ink"
                      >
                        {expanded ? 'Hide' : 'View'}
                      </button>
                    </div>

                    {expanded && (
                      <div className="mt-3 rounded-xl border border-line bg-stone-50/70 p-4">
                        <p className="text-[0.75rem] leading-relaxed text-ink-mid">
                          {request.message}
                        </p>
                        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-[0.7rem] sm:grid-cols-3">
                          <div>
                            <dt className="text-ink-dim">Received</dt>
                            <dd className="mt-0.5 font-medium text-ink">
                              {new Date(request.createdAt).toLocaleString()}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-ink-dim">Category</dt>
                            <dd className="mt-0.5 font-medium text-ink">{request.type}</dd>
                          </div>
                          <div>
                            <dt className="text-ink-dim">Status</dt>
                            <dd className="mt-0.5 font-medium text-ink">{request.status}</dd>
                          </div>
                        </dl>
                        {request.sessionId ? (
                          <p className="mt-3 text-[0.68rem] text-ink-dim tabular-nums">
                            Linked to chat session {request.sessionId}
                          </p>
                        ) : null}
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </Panel>
      )}
    </div>
  )
}
