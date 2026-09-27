import type { WeekPoint } from '@/lib/types'
import { cn } from 'cn'
import { severityStyles } from './severity'

const WIDTH = 620
const HEIGHT = 240
const PADDING = { top: 16, right: 16, bottom: 28, left: 30 }

const plotWidth = WIDTH - PADDING.left - PADDING.right
const plotHeight = HEIGHT - PADDING.top - PADDING.bottom

function xFor(week: number, total: number) {
  const step = plotWidth / (total - 1)
  return PADDING.left + step * (week - 1)
}

function yFor(risk: number) {
  return PADDING.top + plotHeight * (1 - risk / 100)
}

function toPath(points: WeekPoint[], key: 'risk' | 'rolling') {
  return points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${xFor(point.week, points.length)} ${yFor(point[key])}`)
    .join(' ')
}

/** Nine-week risk trajectory with the 3-week rolling mean and the first-deviation marker. */
export function TimelineChart({ weeks, baselineWeeks }: { weeks: WeekPoint[]; baselineWeeks: number }) {
  if (weeks.length === 0) return null

  const deviation = weeks.find((week) => week.isFirstDeviation)
  const areaPath = `${toPath(weeks, 'risk')} L ${xFor(weeks.at(-1)!.week, weeks.length)} ${PADDING.top + plotHeight} L ${PADDING.left} ${PADDING.top + plotHeight} Z`
  // The band covers weeks 1..baselineWeeks, so it must stop halfway to the
  // following week — ending on that week's own x left the deviation week
  // shaded as if it were still part of the baseline.
  const step = plotWidth / (weeks.length - 1)
  const baselineX = xFor(baselineWeeks, weeks.length) + step / 2

  return (
    <figure className="m-0">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-auto w-full"
        role="img"
        aria-label="Nine-week behavioural risk trajectory"
      >
        <defs>
          <linearGradient id="timeline-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1769aa" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#1769aa" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="timeline-line" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#1769aa" />
            <stop offset="55%" stopColor="#228ac5" />
            <stop offset="100%" stopColor="#66b6df" />
          </linearGradient>
        </defs>

        {/* Horizontal gridlines at 0 / 25 / 50 / 75 / 100 */}
        {[0, 25, 50, 75, 100].map((value) => (
          <g key={value}>
            <line
              x1={PADDING.left}
              x2={WIDTH - PADDING.right}
              y1={yFor(value)}
              y2={yFor(value)}
              stroke="rgba(28,25,23,0.08)"
              strokeDasharray={value === 0 ? undefined : '3 4'}
            />
            <text x={PADDING.left - 8} y={yFor(value) + 3.5} textAnchor="end" className="fill-ink-dim text-[9px]">
              {value}
            </text>
          </g>
        ))}

        {/* Baseline band: weeks 1-4 establish the personal baseline */}
        <rect
          x={PADDING.left}
          y={PADDING.top}
          width={baselineX - PADDING.left}
          height={plotHeight}
          fill="rgba(28,25,23,0.035)"
        />
        <text x={PADDING.left + 6} y={PADDING.top + 11} className="fill-ink-dim text-[9px]">
          baseline
        </text>

        {/* First deviation and convergence markers */}
        {weeks.map((week) => {
          const events = week.timelineEvent ?? ''
          const firstDetection = week.isFirstDeviation || events.includes('FIRST_DETECTION')
          const convergence = events.includes('CONVERGENCE')
          if (!firstDetection && !convergence) return null
          return (
            <g key={`event-${week.week}`}>
              <line
                x1={xFor(week.week, weeks.length)}
                x2={xFor(week.week, weeks.length)}
                y1={PADDING.top}
                y2={PADDING.top + plotHeight}
                stroke={convergence ? '#D97706' : '#E11D48'}
                strokeWidth="1.25"
                strokeDasharray="4 3"
              />
              <circle
                cx={xFor(week.week, weeks.length)}
                cy={yFor(week.risk)}
                r="4"
                fill="#fff"
                stroke={convergence ? '#D97706' : '#E11D48'}
                strokeWidth="2"
              >
                <title>{[firstDetection && 'First detection', convergence && 'Signal convergence'].filter(Boolean).join(' · ')} · Week {week.week}</title>
              </circle>
            </g>
          )
        })}

        <path d={areaPath} fill="url(#timeline-area)" />
        <path d={toPath(weeks, 'rolling')} fill="none" stroke="rgba(28,25,23,0.22)" strokeWidth="1.5" strokeDasharray="4 3" />
        <path
          d={toPath(weeks, 'risk')}
          fill="none"
          stroke="url(#timeline-line)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {weeks.map((week) => (
          <circle
            key={week.week}
            cx={xFor(week.week, weeks.length)}
            cy={yFor(week.risk)}
            r="3"
            fill={severityStyles[week.severity].hex}
            className="stroke-white"
            strokeWidth="1.5"
          />
        ))}

        {weeks.map((week) => (
          <text
            key={week.week}
            x={xFor(week.week, weeks.length)}
            y={HEIGHT - 9}
            textAnchor="middle"
            className={cn('fill-ink-dim text-[9px]', week.isFirstDeviation && 'fill-brand-rose font-semibold')}
          >
            W{week.week}
          </text>
        ))}
      </svg>

      <figcaption className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[0.65rem] text-ink-dim">
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-4 rounded-full bg-gradient-to-r from-brand-orange to-brand-rose" />
          Weekly risk
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-4 rounded-full border-t border-dashed border-ink/40" />
          3-week rolling
        </span>
        {deviation && (
          <span className="flex items-center gap-1.5 text-brand-rose">
            <span className="h-0.5 w-4 rounded-full border-t border-dashed border-brand-rose" />
            First deviation · W{deviation.week}
          </span>
        )}
      </figcaption>
    </figure>
  )
}
