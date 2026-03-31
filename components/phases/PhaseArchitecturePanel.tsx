'use client';

import { CheckpointCard } from '@/components/phases/CheckpointCard';
import { ArchitectureComparePanel } from '@/components/simulations/ArchitectureComparePanel';
import { useSessionStore } from '@/lib/store/useSessionStore';
import type { LessonTier } from '@/lib/types';

const TIER_COPY: Record<LessonTier, string> = {
  beginner:
    'You are now comparing four ways to encode and update the same physical state. This is where physics meets computer architecture.',
  student:
    'This phase highlights representational cost: quantization, drift, ternary symmetry, and qubit-phase behavior under shared input.',
  advanced:
    'Treat this as a controlled benchmark where adapter semantics expose architecture-level tradeoffs against one EM scenario.'
};

export function PhaseArchitecturePanel(): JSX.Element {
  const tier = useSessionStore((state) => state.tier);

  return (
    <section id="phase-4" className="space-y-4">
      <header>
        <p className="text-xs uppercase tracking-[0.25em] text-accent/70">Phase 4</p>
        <h3 className="text-2xl font-semibold text-white">The Architectures</h3>
        <p className="mt-2 max-w-3xl text-slate-200">{TIER_COPY[tier]}</p>
      </header>

      <ArchitectureComparePanel title="Architecture Simulator Suite" />

      <CheckpointCard
        phaseId={4}
        title="Architecture Tradeoffs"
        prompt="Pick one scenario and justify which architecture is best for speed, interpretability, and physical intuition."
        comparison="You moved from field physics to implementation strategy across four computational paradigms."
      />
    </section>
  );
}
