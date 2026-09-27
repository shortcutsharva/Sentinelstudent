import { Reveal } from '../Reveal'
import { SectionHeader } from '../SectionHeader'

export function DashboardPreview() {
  return (
    <section id="dashboard" className="relative py-24 sm:py-28">
      <div className="orb left-1/2 top-[6%] h-[420px] w-[820px] -translate-x-1/2 bg-brand-rose/10" />
      <div className="orb bottom-[4%] right-[2%] h-[320px] w-[320px] bg-brand-orange/10" />

      <div className="relative mx-auto max-w-6xl px-6">
        <Reveal>
          <SectionHeader
            eyebrow="Live product preview"
            title={
              <>
                The counsellor console, <span className="text-gradient">at a glance.</span>
              </>
            }
            sub="Risk distribution, live alerts, and weekly trends — one prioritized view of every student who needs support."
          />
        </Reveal>

        <Reveal delay={120}>
          <div className="glass mt-14 overflow-hidden rounded-[28px] p-2 sm:p-2.5">
            <img
              src="/Screenshot 2026-09-27 143701.png"
              alt="Student analysis dashboard showing behavioural signals, stress overview, and student support metrics"
              className="block h-auto w-full rounded-[20px] border border-line"
            />
          </div>
        </Reveal>
      </div>
    </section>
  )
}
