import { BrainCircuit, MessageSquare, Radar, Send } from 'lucide-react'
import { Reveal } from './Reveal'
import { SectionHeader } from './SectionHeader'

const steps = [
  {
    number: '01',
    icon: Radar,
    title: 'Signal Detection',
    description: 'Passive monitoring of academic & behavioral indicators.',
    accent: 'from-brand-orange to-amber-400',
  },
  {
    number: '02',
    icon: MessageSquare,
    title: 'Student Voice',
    description: 'Frictionless inputs on pressure and scheduling conflicts.',
    accent: 'from-brand-rose to-brand-orange',
  },
  {
    number: '03',
    icon: BrainCircuit,
    title: 'AI Analysis',
    description: 'Real-time severity assessment & risk scoring.',
    accent: 'from-brand-amber to-brand-rose',
  },
  {
    number: '04',
    icon: Send,
    title: 'Priority Alerting',
    description: 'Intelligent dispatch of high-risk cases to counsellors.',
    accent: 'from-orange-700 to-brand-amber',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-24 sm:py-28">
      <div className="orb left-[15%] top-[8%] h-[320px] w-[320px] bg-brand-rose/10" />

      <div className="relative mx-auto max-w-6xl px-6">
        <Reveal>
          <SectionHeader
            eyebrow="The pipeline"
            title={
              <>
                From signal to support,{' '}
                <span className="text-gradient">in four moves.</span>
              </>
            }
            sub="A closed loop between student wellbeing and counsellor response — automated end to end."
          />
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <Reveal key={step.number} delay={index * 90}>
              <div className="glass glass-hover group relative h-full overflow-hidden rounded-2xl p-6">
                <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${step.accent} opacity-60`} style={{ width: `${30 + index * 23}%` }} />
                <div className="flex items-start justify-between">
                  <span className={`bg-gradient-to-r ${step.accent} bg-clip-text text-2xl font-semibold tracking-tight text-transparent`}>
                    {step.number}
                  </span>
                  <span className="grid size-10 place-items-center rounded-xl border border-line bg-white/70 text-ink-mid transition-colors duration-300 group-hover:text-ink">
                    <step.icon className="size-[18px]" />
                  </span>
                </div>
                <h3 className="mt-6 text-lg font-semibold tracking-tight text-ink">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-mid">{step.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
