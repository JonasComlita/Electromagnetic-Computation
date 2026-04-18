'use client';

import Link from 'next/link';
import { CheckpointCard } from '@/components/phases/CheckpointCard';
import { SatelliteLinkPanel } from '@/components/simulations/SatelliteLinkPanel';
import { useSessionStore } from '@/lib/store/useSessionStore';
import type { LessonTier } from '@/lib/types';

const TIER_COPY: Record<LessonTier, string> = {
  beginner:
    'A satellite is a relay point in space. The same six-number field state must survive a 600 km vacuum journey before any architecture can process it. Distance changes everything.',
  student:
    'Free-space path loss attenuates amplitude, orbital velocity creates Doppler frequency shift, and propagation delay adds latency. These three effects condition the signal before each architecture receives it.',
  advanced:
    'The link budget converts physical geometry — altitude, elevation, band, EIRP — into a received SNR. Each architecture operates on the channel-conditioned signal, making satellite a controlled experiment in noise immunity by representation strategy.'
};

export function PhaseSatellitePanel(): JSX.Element {
  const tier = useSessionStore((state) => state.tier);

  return (
    <section id="phase-6" className="space-y-4">
      <header>
        <p className="text-xs uppercase tracking-[0.25em] text-accent/70">Phase 6</p>
        <h3 className="text-2xl font-semibold text-white">Satellite Link: Transmit, Propagate, Receive</h3>
        <p className="mt-2 max-w-3xl text-slate-200">{TIER_COPY[tier]}</p>
      </header>

      <div className="panel rounded-2xl p-4 text-sm text-slate-200">
        <p>
          Want the written walkthrough first? Open{' '}
          <Link href="/lessons/phase-6" className="text-accent hover:underline">
            Lesson 6 notes
          </Link>{' '}
          and then return here to run the link simulator.
        </p>
      </div>

      <SatelliteLinkPanel />

      <CheckpointCard
        phaseId={6}
        title="Satellite Architecture Selection"
        prompt="Given a GEO Ka-band link with 4 dB margin, which architecture would you select for (a) a broadcast TV feed, (b) a secure government link, and (c) a scientific telemetry stream? Justify using the link budget values."
        comparison="You have connected the six-number field state to a real physical channel — path loss, delay, Doppler — and seen how each architecture responds to that channel."
      />
    </section>
  );
}
