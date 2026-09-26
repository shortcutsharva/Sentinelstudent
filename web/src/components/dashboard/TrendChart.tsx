import { useState } from 'react'
import { cn } from 'cn'

type Metric = 'stress' | 'engagement' | 'workload'

const METRICS: Record<Metric, { label: string; values: number[]; color: string; delta: string; deltaUp: boolean }> = {
  stress: { label: 'Stress Index', values: [42, 48, 55, 62, 74, 58, 46], color: '#E11D48', delta: '8% vs last week', deltaUp: false },
  engagement: { label: 'Engagement', values: [78, 74, 71, 66, 61, 70, 76], color: '#EA580C', delta: '5% vs last week', deltaUp: true },
  workload: { label: 'Workload', values: [55, 62, 70, 82, 88, 64, 50], color: '#D97706', delta: '3% vs last week', deltaUp: false },
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const VB_W = 620
const VB_H = 240
const PAD_X = 30
const PAD_TOP = 20
const PAD_BOTTOM = 36

function pointAt(index: number, value: number, total: number) {
  const x = PAD_X + (index * (VB_W - PAD_X * 2)) / (total - 1)
  const y = VB_H - PAD_BOTTOM - (value / 100) * (VB_H - PAD_TOP - PAD_BOTTOM)
  return { x, y }
}

function smoothPath(points: { x: number; y: number }[]) {
  if (points.length < 2) return ''
  let d = `M ${points[0].x} ${points[0].y}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[i + 2] ?? p2
    const cp1x = p1.x + (p2.x - p0.x) / 6
    const cp1y = p1.y + (p2.y - p0.y) / 6
    const cp2x = p2.x - (p3.x - p1.x) / 6
    const cp2y = p2.y - (p3.y - p1.y) / 6
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`
  }
  return d
}

export function TrendChart() {
  const [metric, setMetric] = useState<Metric>('stress')
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)

  const active = METRICS[metric]
  const points = active.values.map((value, i) => pointAt(i, value, active.values.length))
  const line = smoothPath(points)
  const baseline = VB_H - PAD_BOTTOM
  const area = `${line} L ${points[points.length - 1].x} ${baseline} L ${points[0].x} ${baseline} Z`

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-ink">Weekly Stress Trend</h3>
          <p className="mt-0.5 text-xs text-ink-dim">
            <span className={active.deltaUp ? 'text-lime-700' : 'text-rose-600'}>
              {active.deltaUp ? '↑' : '↓'} {active.delta}
            </span>
          </p>
        </div>
        <div className="flex gap-1 rounded-full border border-line bg-stone-100/70 p-1">
          {(Object.keys(METRICS) as Metric[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setMetric(key)}
              className={cn(
                'rounded-full px-2.5 py-1 text-[0.7rem] font-medium text-ink-dim transition-colors duration-200',
                metric === key ? 'chip-active' : 'hover:text-ink-mid',
              )}
            >
              {METRICS[key].label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative mt-4" onPointerLeave={() => setHoverIndex(null)}>
        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          className="w-full"
          role="img"
          aria-label={`${active.label} trend over the week`}
          onPointerMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            const ratio = (e.clientX - rect.left) / rect.width
            const index = Math.round(ratio * (DAYS.length - 1))
            setHoverIndex(Math.min(DAYS.length - 1, Math.max(0, index)))
          }}
        >
          <defs>
            <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={active.color} stopOpacity="0.24" />
              <stop offset="100%" stopColor={active.color} stopOpacity="0" />
            </linearGradient>
          </defs>

          {[0, 25, 50, 75, 100].map((tick) => {
            const y = PAD_TOP + ((100 - tick) / 100) * (VB_H - PAD_TOP - PAD_BOTTOM)
            return (
              <g key={tick}>
                <line x1={PAD_X} x2={VB_W - PAD_X} y1={y} y2={y} stroke="rgba(28,25,23,0.08)" strokeWidth="1" />
                <text x={PAD_X - 10} y={y + 3.5} textAnchor="end" fontSize="10" fill="#A8A29E">
                  {tick}
                </text>
              </g>
            )
          })}

          <path d={area} fill="url(#chartFill)" />

          <path
            key={metric}
            className="chart-line is-drawn"
            pathLength={100}
            d={line}
            fill="none"
            stroke={active.color}
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {points.map((p, i) => (
            <g key={i}>
              <circle
                cx={p.x}
                cy={p.y}
                r={hoverIndex === i ? 5.5 : 3}
                fill="#FFFFFF"
                stroke={active.color}
                strokeWidth="2"
                className="transition-all duration-200"
              />
              <text x={p.x} y={VB_H - PAD_BOTTOM + 20} textAnchor="middle" fontSize="10" fill="#A8A29E">
                {DAYS[i]}
              </text>
            </g>
          ))}

          {hoverIndex !== null && (
            <line
              x1={points[hoverIndex].x}
              x2={points[hoverIndex].x}
              y1={PAD_TOP}
              y2={baseline}
              stroke="rgba(28,25,23,0.2)"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
          )}
        </svg>

        {hoverIndex !== null && (
          <div
            className="glass pointer-events-none absolute -top-1 rounded-lg px-2.5 py-1.5 text-[0.7rem] whitespace-nowrap"
            style={{ left: `${(points[hoverIndex].x / VB_W) * 100}%`, transform: 'translate(-50%, -100%)' }}
          >
            <span className="text-ink-dim">{DAYS[hoverIndex]}</span>
            <span className="ml-1.5 font-semibold text-ink">{active.values[hoverIndex]}</span>
            <span className="ml-1 text-ink-dim">{active.label.toLowerCase()}</span>
          </div>
        )}
      </div>
    </div>
  )
}
