/**
 * Supabase-backed dashboard data source.
 *
 * This module runs ONLY on the server (Vite dev middleware and the preview
 * server). `student_weekly_analysis` has row-level security enabled with no
 * public read policy, and the service-role key must never reach the browser —
 * so the client fetches `/api/dashboard` and this file does the privileged read.
 *
 * Credentials come from SUPABASE_URL / SUPABASE_SECRET_KEY, which Vite exposes
 * to config only via `loadEnv(mode, cwd, '')` in the vite.config.ts plugins.
 * Values are never logged or returned to the client.
 */

import { createClient } from '@supabase/supabase-js'
import type { DashboardData, DeviatingSignal, Severity, SignalOnset, Student, WeekPoint } from '../src/lib/types.ts'

export const TABLE = 'student_weekly_analysis'

/** Matches Z_THRESHOLD in risk_score_calculation.py. */
const MEANINGFUL_Z = 2.0
/** Matches STRONG_Z_THRESHOLD. */
const STRONG_Z = 2.5
/** Matches BASELINE_WEEKS. */
const BASELINE_WEEKS = 4

const EXPECTED_WEEKS = 9

const FEATURE_LABELS: Record<string, string> = {
  class_participation: 'Class participation',
  arrival_irregularity: 'Arrival irregularity',
  early_departures: 'Early departures',
  extracurricular_activity: 'Extracurricular activity',
  library_resource_usage: 'Library usage',
  lms_session_duration: 'LMS session duration',
  academic_help_requests: 'Academic help requests',
  meal_usage: 'Meal usage',
  transport_irregularity: 'Transport irregularity',
  schedule_changes: 'Schedule changes',
  digital_timing_shift: 'Digital timing shift',
}

interface AnalysisRow {
  student_id: string
  week: number
  analysis: Record<string, unknown>
}

function round(value: unknown, digits = 1): number {
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) ? Number(parsed.toFixed(digits)) : 0
}

function toInt(value: unknown, fallback = 0): number {
  const parsed = typeof value === 'number' ? value : Number.parseInt(String(value), 10)
  return Number.isFinite(parsed) ? parsed : fallback
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

/** Current-week deviations, highest z-score first, mirroring the pipeline's filter. */
function collectSignals(analysis: Record<string, unknown>): DeviatingSignal[] {
  const signals: DeviatingSignal[] = []

  for (const [column, label] of Object.entries(FEATURE_LABELS)) {
    const z = Number(analysis[`${column}_z`])
    if (!Number.isFinite(z) || z < MEANINGFUL_Z) continue

    signals.push({
      signal: label,
      z: round(z),
      risk: round(analysis[`${column}_risk`]),
      strong: z >= STRONG_Z,
    })
  }

  return signals.sort((a, b) => b.z - a.z)
}

/**
 * The weekly record already carries the trajectory and the card fields, so the
 * nine-week series is reconstructed from the rows themselves. `first_deviation_week`
 * is present on every row, which is how the pipeline stores it.
 */
function toWeek(row: AnalysisRow): WeekPoint {
  const analysis = row.analysis

  return {
    week: toInt(row.week),
    risk: round(analysis.weekly_risk),
    rolling: round(analysis.rolling_risk_3w),
    severity: asString(analysis.severity, 'LOW') as Severity,
    velocity: round(analysis.risk_velocity, 2),
    trajectory: asString(analysis.trajectory_state, 'STABLE') as WeekPoint['trajectory'],
    signals: toInt(analysis.meaningful_signal_count),
    isFirstDeviation: toInt(analysis.first_deviation_week, -1) === toInt(row.week),
    phase: asString(analysis.trajectory_phase),
    cascadeActive: analysis.cascade_active === true,
    timelineEvent: [
      toInt(analysis.first_deviation_week, -1) === toInt(row.week) && toInt(analysis.first_deviation_week, -1) > 0 ? 'FIRST_DETECTION' : '',
      toInt(analysis.convergence_week, -1) === toInt(row.week) && toInt(analysis.convergence_week, -1) > 0 ? 'CONVERGENCE' : '',
      asString(analysis.timeline_event),
    ].filter(Boolean).join(' + '),
    measurements: Object.fromEntries(
      Object.keys(FEATURE_LABELS).flatMap((feature) => {
        const value = Number(analysis[feature])
        return Number.isFinite(value) ? [[feature, round(value, 2)]] : []
      }),
    ),
  }
}

function onsetOrder(value: unknown): SignalOnset[] {
  if (Array.isArray(value)) {
    return value.flatMap((item) => {
      if (typeof item !== 'object' || item === null) return []
      const onset = item as Record<string, unknown>
      return [{
        signal: asString(onset.signal),
        label: asString(onset.label),
        week: toInt(onset.week),
      }]
    })
  }
  if (typeof value === 'string') {
    try {
      return onsetOrder(JSON.parse(value))
    } catch {
      return []
    }
  }
  return []
}

function toStudent(rows: AnalysisRow[]): Student | null {
  const ordered = [...rows].sort((a, b) => toInt(a.week) - toInt(b.week))
  if (ordered.length === 0) return null

  const current = ordered.at(-1)!
  const analysis = current.analysis

  const firstDeviationWeek = toInt(analysis.first_deviation_week, -1)
  const currentWeek = toInt(current.week)
  const contributors = asString(analysis.meaningful_signals)
    .split('|')
    .map((part) => FEATURE_LABELS[part.trim()] ?? part.trim())
    .filter(Boolean)

  return {
    id: asString(current.student_id),
    // Rank is derived below once the cohort is sorted by risk.
    rank: 0,
    risk: round(analysis.weekly_risk),
    severity: asString(analysis.severity, 'LOW') as Severity,
    trajectory: asString(analysis.trajectory_state, 'STABLE') as Student['trajectory'],
    velocity: round(analysis.risk_velocity, 2),
    acceleration: round(analysis.risk_acceleration, 2),
    anomaly: round(analysis.population_anomaly),
    confidence: confidenceFor(analysis),
    signalCount: toInt(analysis.meaningful_signal_count),
    firstDeviationWeek,
    earliestSignal: asString(analysis.earliest_signal, 'NONE'),
    detectionType: asString(analysis.deviation_detection_type, 'NONE'),
    leadTimeWeeks:
      firstDeviationWeek > 0 ? Math.max(0, currentWeek - firstDeviationWeek) : 0,
    weeksAboveWatch: ordered.filter((row) => Number(row.analysis.weekly_risk) >= 20).length,
    weeksAboveModerate: ordered.filter((row) => Number(row.analysis.weekly_risk) >= 40).length,
    weeksAboveHigh: ordered.filter((row) => Number(row.analysis.weekly_risk) >= 60).length,
    contributors: contributors.length > 0 ? contributors.slice(0, 3) : collectSignals(analysis).slice(0, 3).map((s) => s.signal),
    explanation: asString(analysis.explanation, buildExplanation(analysis)),
    phase: asString(analysis.trajectory_phase),
    cascadeStartWeek: toInt(analysis.cascade_start_week, -1),
    cascadeEndWeek: toInt(analysis.cascade_end_week, -1),
    cascadeDuration: toInt(analysis.cascade_duration),
    cascadeDepth: toInt(analysis.cascade_depth),
    leadingSignal: asString(analysis.leading_signal, 'NONE'),
    secondSignal: asString(analysis.second_signal, 'NONE'),
    convergenceWeek: toInt(analysis.convergence_week, -1),
    convergenceStrength: round(analysis.convergence_strength),
    earlyWarningWindow: toInt(analysis.early_warning_window),
    signalOnsetOrder: onsetOrder(analysis.signal_onset_order),
    whyNow: asString(analysis.why_now),
    signals: collectSignals(analysis),
    weeks: ordered.map((row) => toWeek(row)),
  }
}

/** Mirrors the confidence rule in build_student_cards(). */
function confidenceFor(analysis: Record<string, unknown>): Student['confidence'] {
  const signalCount = toInt(analysis.meaningful_signal_count)
  const anomaly = Number(analysis.population_anomaly) || 0
  if (signalCount >= 3 && anomaly >= 60) return 'HIGH'
  if (signalCount >= 2 || anomaly >= 50) return 'MEDIUM'
  return 'LOW'
}

/** Mirrors generate_explanation(): top three deviating signals by z-score. */
function buildExplanation(analysis: Record<string, unknown>): string {
  const top = collectSignals(analysis)
    .slice(0, 3)
    .map((signal) => `${signal.signal} (z=${signal.z.toFixed(1)})`)

  if (top.length === 0) return 'No major independent behavioral deviations detected.'
  return `Main deviations: ${top.join('; ')}.`
}

export async function loadDashboardData(
  supabaseUrl: string,
  supabaseKey: string,
): Promise<DashboardData> {
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data, error } = await supabase
    .from(TABLE)
    .select('student_id,week,analysis')
    .order('student_id', { ascending: true })
    .order('week', { ascending: true })

  if (error) {
    throw new Error(`Supabase query failed: ${error.message}`)
  }

  const rows = (data ?? []) as AnalysisRow[]

  const grouped = new Map<string, AnalysisRow[]>()
  for (const row of rows) {
    const bucket = grouped.get(row.student_id)
    if (bucket) bucket.push(row)
    else grouped.set(row.student_id, [row])
  }

  const students = [...grouped.values()]
    .map(toStudent)
    .filter((student): student is Student => student !== null)
    .sort((a, b) => b.risk - a.risk)
    .map((student, index) => ({ ...student, rank: index + 1 }))

  const currentWeek = students.reduce((max, student) => {
    const last = student.weeks.at(-1)?.week ?? 0
    return Math.max(max, last)
  }, 0)

  return {
    generatedFrom: `supabase:${TABLE}`,
    currentWeek: currentWeek || EXPECTED_WEEKS,
    baselineWeeks: BASELINE_WEEKS,
    studentCount: students.length,
    students,
  }
}
