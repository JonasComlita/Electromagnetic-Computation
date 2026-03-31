import Link from 'next/link';
import { ProgressOverview } from '@/components/layout/ProgressOverview';
import { PhaseFieldPanel } from '@/components/phases/PhaseFieldPanel';
import { PhaseRelativityPanel } from '@/components/phases/PhaseRelativityPanel';
import { PhaseTensorPanel } from '@/components/phases/PhaseTensorPanel';
import { PhaseArchitecturePanel } from '@/components/phases/PhaseArchitecturePanel';

export default function GuidedPage(): JSX.Element {
  return (
    <div className="space-y-8">
      <section className="panel rounded-3xl p-6">
        <p className="text-xs uppercase tracking-[0.25em] text-accent/75">Guided Path</p>
        <h2 className="mt-2 text-3xl font-semibold text-white">What &rarr; Why &rarr; How &rarr; Compare</h2>
        <p className="mt-3 max-w-3xl text-slate-200">
          Follow the narrative in order, then branch into free exploration. You can open matching MDX lesson notes at each phase.
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          <Link href="/lessons/phase-1" className="rounded-full border border-white/20 px-3 py-1.5 hover:bg-white/10">
            Lesson: Field
          </Link>
          <Link href="/lessons/phase-2" className="rounded-full border border-white/20 px-3 py-1.5 hover:bg-white/10">
            Lesson: Relativity
          </Link>
          <Link href="/lessons/phase-3" className="rounded-full border border-white/20 px-3 py-1.5 hover:bg-white/10">
            Lesson: Matrix
          </Link>
          <Link href="/lessons/phase-4" className="rounded-full border border-white/20 px-3 py-1.5 hover:bg-white/10">
            Lesson: Architectures
          </Link>
          <Link href="/lessons/phase-5" className="rounded-full border border-white/20 px-3 py-1.5 hover:bg-white/10">
            Lesson: Circuits
          </Link>
        </div>
      </section>

      <ProgressOverview />
      <PhaseFieldPanel />
      <PhaseRelativityPanel />
      <PhaseTensorPanel />
      <PhaseArchitecturePanel />
    </div>
  );
}
