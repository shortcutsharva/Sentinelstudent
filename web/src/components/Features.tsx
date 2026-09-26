import { ChartLine, Gauge, ShieldCheck, Activity } from 'lucide-react'
import { Reveal } from './Reveal'
import { SectionHeader } from './SectionHeader'

const features = [
  {
    icon: Activity,
    title: 'Real-time Stress Tracking',
    description: 'Continuous monitoring across academic and behavioral signals — no manual check-ins required.',
    chips: ['Attendance', 'Grade velocity', 'Engagement'],
    iconClass: 'from-brand-orange/15 to-brand-orange/5 text-brand-orange border-brand-orange/20',
  },
  {
    icon: Gauge,
    title: 'Intelligent Risk Prioritization',
    description: 'Severity scoring ranks every case, so the highest-need students surface first.',
    chips: ['Severity L / M / H', 'Queue ranking'],
    iconClass: 'from-brand-rose/15 to-brand-rose/5 text-brand-rose border-brand-rose/20',
  },
  {
    icon: ShieldCheck,
    title: 'Privacy-First & Anonymous Data Handling',
    description: 'Anonymized IDs, encrypted storage, and strict data boundaries built in by design.',
    chips: ['Anonymized IDs', 'Encrypted at rest'],
    iconClass: 'from-brand-amber/15 to-brand-amber/5 text-brand-amber border-brand-amber/20',
  },
  {
    icon: ChartLine,
    title: 'Actionable Analytics Dashboard',
    description: 'Counsellor-ready views of trends, triggers, and outcomes — clarity at a glance.',
    chips: ['Trend views', 'Trigger breakdown'],
    iconClass: 'from-orange-700/15 to-brand-rose/5 text-orange-700 border-orange-700/20',
  },
]

export function Features() {
  return (
    <section id="features" className="relative py-24 sm:py-28">
      <div className="orb right-[8%] top-[12%] h-[360px] w-[360px] bg-brand-amber/10" />

      <div className="relative mx-auto max-w-6xl px-6">
        <Reveal>
          <SectionHeader
            eyebrow="Key features"
            title={
              <>
                Built for <span className="text-gradient">trust, speed, and clarity.</span>
              </>
            }
            sub="Everything a support team needs to spot risk early and act with confidence."
          />
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2">
          {features.map((feature, index) => (
            <Reveal key={feature.title} delay={index * 90}>
              <div className="glass glass-hover group h-full rounded-2xl p-7">
                <span
                  className={`grid size-12 place-items-center rounded-2xl border bg-gradient-to-br ${feature.iconClass} shadow-sm transition-transform duration-300 group-hover:scale-[1.06]`}
                >
                  <feature.icon className="size-5" />
                </span>
                <h3 className="mt-6 text-xl font-semibold tracking-tight text-ink">{feature.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-ink-mid">{feature.description}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {feature.chips.map((chip) => (
                    <span
                      key={chip}
                      className="rounded-full border border-line bg-white/70 px-2.5 py-1 text-[0.7rem] font-medium text-ink-dim transition-colors duration-300 group-hover:text-ink-mid"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
