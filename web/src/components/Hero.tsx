import { ArrowRight, Play } from 'lucide-react'

const floatingSignals = [
  {
    label: 'Stress index',
    detail: '↓ 12% this week',
    dot: 'bg-brand-orange',
    position: 'right-[10%] bottom-[16%]',
    delay: '2.1s',
  },
]

const trustStats = [
  { value: '24k+', label: 'Signals analysed daily' },
  { value: '< 60s', label: 'Alert dispatch time' },
  { value: '100%', label: 'Anonymised student data' },
]

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pb-28 pt-36 sm:pt-44">
      <div className="orb left-[-12%] top-[-12%] h-[420px] w-[420px] bg-brand-orange/12" />
      <div className="orb right-[-10%] top-[4%] h-[520px] w-[520px] bg-brand-rose/10" />
      <div className="orb bottom-[-24%] left-1/2 h-[380px] w-[720px] -translate-x-1/2 bg-brand-amber/10" />
      <div className="grid-bg absolute inset-0" />

      {floatingSignals.map((signal) => (
        <div
          key={signal.label}
          className={`animate-float absolute hidden lg:flex items-center gap-2.5 rounded-2xl border border-line bg-white/80 px-3.5 py-2.5 shadow-sm backdrop-blur-md ${signal.position}`}
          style={{ animationDelay: signal.delay }}
        >
          <span className="relative flex size-2">
            <span className={`absolute inline-flex size-full rounded-full opacity-75 ${signal.dot} animate-pulse-ring`} />
            <span className={`relative inline-flex size-2 rounded-full ${signal.dot}`} />
          </span>
          <span className="text-xs">
            <span className="block font-medium text-ink">{signal.label}</span>
            <span className="block text-ink-dim">{signal.detail}</span>
          </span>
        </div>
      ))}

      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <div className="reveal is-visible badge-glow mx-auto inline-flex items-center gap-2 rounded-full border border-line bg-white/80 px-3.5 py-1.5 text-xs font-medium text-ink-mid">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex size-full rounded-full bg-brand-amber animate-pulse-ring" />
            <span className="relative inline-flex size-1.5 rounded-full bg-brand-amber" />
          </span>
          AI-powered student support intelligence
        </div>

        <h1 className="mt-7 text-[2.65rem] font-semibold leading-[1.05] tracking-tight text-ink sm:text-6xl lg:text-[4.4rem]">
          Early Detection. Smarter Support.{' '}
          <span className="text-gradient">Healthier Students.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-ink-mid sm:text-lg">
          An AI-powered intelligence platform identifying early student stress signals and empowering
          counsellors with actionable, prioritized insights.
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href="/dashboard"
            className="btn-gradient group inline-flex w-full items-center justify-center gap-2 rounded-xl px-7 py-3.5 text-[0.95rem] font-medium sm:w-auto"
          >
            View Dashboard
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
          </a>
          <a
            href="#how-it-works"
            className="glass glass-hover group inline-flex w-full items-center justify-center gap-2.5 rounded-xl px-7 py-3.5 text-[0.95rem] font-medium text-ink hover:translate-y-0 sm:w-auto"
          >
            <span className="grid size-5 place-items-center rounded-full bg-brand-orange/10">
              <Play className="size-2.5 translate-x-px fill-current text-brand-orange" />
            </span>
            Learn How It Works
          </a>
        </div>

        <div className="mx-auto mt-14 grid max-w-2xl grid-cols-3 divide-x divide-line rounded-2xl border border-line bg-white/70 py-5 backdrop-blur-sm">
          {trustStats.map((stat) => (
            <div key={stat.label} className="px-3">
              <div className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">{stat.value}</div>
              <div className="mt-1 text-[0.68rem] uppercase tracking-[0.14em] text-ink-dim">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
