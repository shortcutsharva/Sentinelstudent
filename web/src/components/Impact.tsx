import { HeartPulse, Lock, Zap } from 'lucide-react'
import { Reveal } from './Reveal'
import { SectionHeader } from './SectionHeader'

const impacts = [
  {
    icon: HeartPulse,
    stat: '3 wks earlier',
    title: 'Proactive Care',
    description: 'Catch burnout before academic collapse.',
    gradient: 'from-brand-rose/15 to-brand-amber/5',
    statClass: 'text-gradient-warm',
  },
  {
    icon: Zap,
    stat: '2.4× faster',
    title: 'Triage Efficiency',
    description: 'Help counsellors focus on students who need help first.',
    gradient: 'from-brand-orange/15 to-brand-amber/5',
    statClass: 'text-gradient-warm',
  },
  {
    icon: Lock,
    stat: '0 PII exposed',
    title: 'Privacy Preserved',
    description: 'Ethical AI built with strict student privacy boundaries.',
    gradient: 'from-brand-amber/15 to-brand-rose/5',
    statClass: 'text-gradient-warm',
  },
]

export function Impact() {
  return (
    <section id="impact" className="relative py-24 sm:py-28">
      <div className="orb left-[6%] bottom-[6%] h-[340px] w-[340px] bg-brand-amber/10" />

      <div className="relative mx-auto max-w-6xl px-6">
        <Reveal>
          <SectionHeader
            eyebrow="Why it matters"
            title={
              <>
                Care that arrives <span className="text-gradient">before the crisis.</span>
              </>
            }
            sub="Better outcomes for students, less guesswork for the adults supporting them."
          />
        </Reveal>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {impacts.map((impact, index) => (
            <Reveal key={impact.title} delay={index * 90}>
              <div className="glass glass-hover group relative h-full overflow-hidden rounded-2xl p-7">
                <div
                  className={`absolute inset-x-0 top-0 h-28 bg-gradient-to-b ${impact.gradient} opacity-70`}
                />
                <div className="relative flex items-start justify-between">
                  <div>
                    <div className={`text-2xl font-semibold tracking-tight ${impact.statClass}`}>{impact.stat}</div>
                    <div className="mt-1 text-[0.65rem] uppercase tracking-[0.18em] text-ink-dim">Measured impact</div>
                  </div>
                  <span className="grid size-11 place-items-center rounded-2xl border border-line bg-white/80 text-ink transition-transform duration-300 group-hover:scale-[1.06]">
                    <impact.icon className="size-5" />
                  </span>
                </div>
                <h3 className="relative mt-8 text-xl font-semibold tracking-tight text-ink">{impact.title}</h3>
                <p className="relative mt-2.5 text-sm leading-relaxed text-ink-mid">{impact.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
