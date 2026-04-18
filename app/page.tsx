import Link from 'next/link';
import { ProgressOverview } from '@/components/layout/ProgressOverview';

const MODULES = [
  {
    title: 'Phase 1: The Field',
    blurb: 'Build intuition with a 3D wave where each point carries six values.',
    href: '/guided#phase-1'
  },
  {
    title: 'Phase 2: Relativity',
    blurb: 'Use velocity to see lag, simultaneity shifts, and Doppler behavior.',
    href: '/guided#phase-2'
  },
  {
    title: 'Phase 3: Tensor vs Vector',
    blurb: 'Understand why we transform with 4x4 and display/store six unique values.',
    href: '/guided#phase-3'
  },
  {
    title: 'Phase 4: Architectures',
    blurb: 'Compare binary, analog, ternary, and quantum computation on one shared scenario.',
    href: '/guided#phase-4'
  },
  {
    title: 'Phase 5: Circuit Emulation',
    blurb: 'Go under the hood with transistor and circuit-level models for binary, analog, and ternary.',
    href: '/guided#phase-5'
  },
  {
    title: 'Phase 6: Satellite Link',
    blurb: 'Transmit the six-number state 600 km through vacuum. Link budget, Doppler, and BER across four architectures.',
    href: '/guided#phase-6'
  }
];

export default function HomePage(): JSX.Element {
  return (
    <div className="space-y-6">
      <section className="panel overflow-hidden rounded-3xl p-6">
        <p className="text-xs uppercase tracking-[0.28em] text-accent/80">EM Field Curriculum</p>
        <h2 className="mt-2 max-w-3xl text-4xl font-semibold leading-tight text-white">
          Learn how one electromagnetic reality maps into four computing architectures
        </h2>
        <p className="mt-4 max-w-3xl text-slate-200">
          This site teaches a single throughline: every point in the field is six numbers, and every architecture is a different
          way to store, transform, and transmit those numbers — including through 600 km of vacuum.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/guided"
            className="rounded-full border border-accent/70 bg-accent/15 px-4 py-2 text-sm text-accent hover:bg-accent/20"
          >
            Start guided path
          </Link>
          <Link href="/explore" className="rounded-full border border-white/20 px-4 py-2 text-sm text-slate-100 hover:bg-white/10">
            Jump into free explore
          </Link>
        </div>
      </section>

      <ProgressOverview />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {MODULES.map((module) => (
          <article key={module.title} className="panel rounded-2xl p-4">
            <h3 className="text-lg font-semibold text-white">{module.title}</h3>
            <p className="mt-2 text-sm text-slate-200">{module.blurb}</p>
            <Link href={module.href} className="mt-3 inline-block text-sm text-accent hover:underline">
              Open module
            </Link>
          </article>
        ))}
      </section>

      <section className="panel rounded-2xl p-5">
        <h3 className="text-xl font-semibold text-white">Lesson Notes (MDX)</h3>
        <p className="mt-2 text-sm text-slate-200">
          Narrative lessons are editable in MDX. Open the lesson pages to see the conceptual notes paired with each interactive phase.
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <Link key={n} href={`/lessons/phase-${n}`} className="rounded-full border border-white/20 px-3 py-1.5 hover:bg-white/10">
              Lesson {n}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
