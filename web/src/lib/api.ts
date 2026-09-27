import axios from 'axios'
import type { DashboardData, PriorityTier, Severity, Student, StudentRequest } from './types'
import { enrichStudentRoster } from './mockRoster'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
})

const http = axios.create({ baseURL: import.meta.env.BASE_URL })

let cache: Promise<DashboardData> | null = null

/**
 * Live data comes from the server-side `/api/dashboard` route, which reads
 * Supabase using the service-role key. The browser never holds that key, so a
 * static snapshot in /public is kept as a fallback for offline demos; the
 * `generatedFrom` tells the UI which student source is in play.
 */
function withFictionalRoster(data: DashboardData): DashboardData {
  const students = enrichStudentRoster(data.students)
  return { ...data, students }
}

export function fetchDashboardData(): Promise<DashboardData> {
  cache ??= Promise.all([
    http.get<DashboardData>('data/dashboard.json'),
    http.get<DashboardData>('api/dashboard').catch(() => null),
  ])
    .then(([snapshot, live]) => {
      const data = live?.data ?? snapshot.data
      const aggregate = snapshot.data
      return withFictionalRoster({
        ...data,
        events: aggregate.events,
        transitions: aggregate.transitions,
        heatmap: aggregate.heatmap,
      })
    })
    .catch((error) => {
      cache = null
      throw error
    })

  return cache
}

/** Mirrors `normalize_student_id` in supabase_student_lookup.py: "7" -> "STU-007". */
export function normalizeStudentId(value: string): string | null {
  const match = /^(?:stu-)?(\d+)$/i.exec(value.trim())
  if (!match) return null
  return `STU-${Number(match[1]).toString().padStart(3, '0')}`
}

/**
 * Student requests posted by the mobile app live in the shared local API
 * (`server/index.mjs` on :3000). When it is not running the dashboard still
 * renders — this just resolves to an empty list.
 */
export function fetchStudentRequests(): Promise<StudentRequest[]> {
  return api
    .get<StudentRequest[]>('/support/requests')
    .then((response) => response.data)
    .catch(() => [])
}

export const SEVERITY_TIERS: Record<Severity, PriorityTier> = {
  LOW: 'low',
  WATCH: 'low',
  MODERATE: 'medium',
  HIGH: 'high',
  'VERY HIGH': 'high',
}

/** Cohort-wide risk distribution, used by the priority summary card. */
export function summarizePriorities(students: Student[]) {
  const counts: Record<PriorityTier, number> = { high: 0, medium: 0, low: 0 }

  for (const student of students) {
    counts[SEVERITY_TIERS[student.severity]] += 1
  }

  const total = students.length || 1

  return {
    counts,
    shares: {
      high: Math.round((counts.high / total) * 100),
      medium: Math.round((counts.medium / total) * 100),
      low: Math.round((counts.low / total) * 100),
    } satisfies Record<PriorityTier, number>,
    total,
  }
}

/** Highest-signal contributors across the cohort, for the bar graph. */
export function rankSignals(students: Student[]) {
  const totals = new Map<string, number>()

  for (const student of students) {
    for (const signal of student.signals) {
      totals.set(signal.signal, (totals.get(signal.signal) ?? 0) + 1)
    }
  }

  return [...totals.entries()]
    .map(([signal, count]) => ({ signal, count }))
    .sort((a, b) => b.count - a.count || a.signal.localeCompare(b.signal))
}
