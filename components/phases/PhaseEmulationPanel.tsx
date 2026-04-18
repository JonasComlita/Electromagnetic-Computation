'use client';

import Link from 'next/link';
import { CheckpointCard } from '@/components/phases/CheckpointCard';
import { CircuitLevelLab } from '@/components/simulations/CircuitLevelLab';
import { useSessionStore } from '@/lib/store/useSessionStore';
import type { LessonTier } from '@/lib/types';

const TIER_COPY: Record<LessonTier, string> = {
  beginner:
    'This phase shows the physical side of computation. You can see how transistor-like and RC-like behavior creates the outputs you saw in architecture comparisons.',
  student:
    'Use this lab to connect architecture-level metrics to circuit-level causes: switching delay, filtering lag, threshold behavior, and drift sensitivity.',
  advanced:
    'Treat this panel as a conceptual device-level model tying logic abstractions to continuous dynamics and threshold conduction regimes.'
};

export function PhaseEmulationPanel(): JSX.Element {
  const tier = useSessionStore((state) => state.tier);

  return (
    <section id="phase-5" className="space-y-4">
      <header>
        <p className="text-xs uppercase tracking-[0.25em] text-accent/70">Phase 5</p>
        <h3 className="text-2xl font-semibold text-white">Circuit and Transistor Emulation</h3>
        <p className="mt-2 max-w-3xl text-slate-200">{TIER_COPY[tier]}</p>
      </header>

      <div className="panel rounded-2xl p-4 text-sm text-slate-200">
        <p>
          Want the written walkthrough first? Open{' '}
          <Link href="/lessons/phase-5" className="text-accent hover:underline">
            Lesson 5 notes
          </Link>{' '}
          and then return here to run the lab.
        </p>
      </div>

      <CircuitLevelLab />

      <CheckpointCard
        phaseId={5}
        title="Circuit-Level Reasoning"
        prompt="Explain which circuit parameters most affect stability, lag, and switching behavior across binary, analog, and ternary models."
        comparison="You have connected architecture-level outcomes to underlying circuit dynamics."
      />
    </section>
  );
}
