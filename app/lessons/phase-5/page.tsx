import Link from 'next/link';
import { CircuitLevelLab } from '@/components/simulations/CircuitLevelLab';

export default function LessonFivePage(): JSX.Element {
  return (
    <div className="space-y-6">
      <section className="panel rounded-3xl p-6">
        <p className="text-xs uppercase tracking-[0.25em] text-accent/75">Lesson 5</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Transistor and Circuit-Level Emulation</h1>
        <p className="mt-3 max-w-4xl text-slate-200">
          This lesson moves from architecture-level behavior into circuit dynamics. Instead of only comparing final metrics, you now
          inspect waveform evolution and switching behavior driven by transistor-like or RC-like models.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="panel rounded-2xl p-4">
          <h2 className="text-lg font-semibold text-white">Binary CMOS</h2>
          <p className="mt-2 text-sm text-slate-200">
            Simulates pull-up and pull-down conductance competition in inverter chains, plus settled NAND behavior and propagation delay.
          </p>
        </article>
        <article className="panel rounded-2xl p-4">
          <h2 className="text-lg font-semibold text-white">Analog RC</h2>
          <p className="mt-2 text-sm text-slate-200">
            Simulates RC filtering with noise and thermal drift so you can see lag, smoothing, and attenuation emerge from differential
            updates.
          </p>
        </article>
        <article className="panel rounded-2xl p-4">
          <h2 className="text-lg font-semibold text-white">Ternary Device</h2>
          <p className="mt-2 text-sm text-slate-200">
            Simulates a multi-threshold ternary inverter using low, mid, and high pull branches to expose balanced-state transitions.
          </p>
        </article>
      </section>

      <CircuitLevelLab />

      <section className="panel rounded-2xl p-5 text-sm text-slate-200">
        <h3 className="text-lg font-semibold text-white">Where this fits in the curriculum</h3>
        <p className="mt-2">
          Lessons 1-4 explain what field state is and how architectures represent it. Lesson 5 explains how electrical behavior can
          produce those architecture-level effects.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link href="/guided" className="rounded-full border border-white/20 px-3 py-1.5 hover:bg-white/10">
            Back to Guided Path
          </Link>
          <Link href="/compare" className="rounded-full border border-white/20 px-3 py-1.5 hover:bg-white/10">
            Back to Architecture Compare
          </Link>
        </div>
      </section>
    </div>
  );
}
