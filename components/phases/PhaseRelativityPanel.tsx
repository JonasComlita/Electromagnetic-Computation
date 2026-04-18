'use client';

import { useMemo } from 'react';
import { CheckpointCard } from '@/components/phases/CheckpointCard';
import { trackEvent } from '@/lib/analytics';
import {
  conceptualCurvature,
  dopplerFactor,
  gamma,
  simultaneityOffset,
  transformFieldWithBoost
} from '@/lib/math/relativity';
import { useSessionStore } from '@/lib/store/useSessionStore';
import type { LessonTier } from '@/lib/types';

const TIER_COPY: Record<LessonTier, string> = {
  beginner:
    'Motion changes what the observer sees. Increase velocity and watch lag and compression emerge in a physically intuitive way.',
  student:
    'This panel applies Lorentz-style intuition: Doppler scaling, simultaneity offset, and contraction all follow from relative velocity.',
  advanced:
    'We stay SR-computational while exposing a conceptual GR curvature overlay for pedagogy, not metric solving.'
};

export function PhaseRelativityPanel(): JSX.Element {
  const tier = useSessionStore((state) => state.tier);
  const frame = useSessionStore((state) => state.frame);
  const patchFrame = useSessionStore((state) => state.patchFrame);
  const observerMode = useSessionStore((state) => state.observerMode);
  const setObserverMode = useSessionStore((state) => state.setObserverMode);
  const emState = useSessionStore((state) => state.emState);
  const setEMState = useSessionStore((state) => state.setEMState);

  const g = useMemo(() => gamma(frame.velocityVc), [frame.velocityVc]);
  const doppler = useMemo(() => dopplerFactor(frame.velocityVc), [frame.velocityVc]);
  const simultaneity = useMemo(() => simultaneityOffset(frame.velocityVc), [frame.velocityVc]);
  const contraction = useMemo(() => 1 / g, [g]);
  const curve = useMemo(
    () => Array.from({ length: 28 }, (_, idx) => conceptualCurvature(frame.velocityVc, idx / 27)),
    [frame.velocityVc]
  );
  const velocityLimit = tier === 'beginner' ? 0.8 : 0.95;

  function applyBoostNow(): void {
    setEMState(transformFieldWithBoost(emState, frame.velocityVc));
    trackEvent('simulator_step', { simulator: 'relativity', velocity: frame.velocityVc });
  }

  return (
    <section id="phase-2" className="space-y-4">
      <header>
        <p className="text-xs uppercase tracking-[0.25em] text-accent/70">Phase 2</p>
        <h3 className="text-2xl font-semibold text-white">The Geometry: Relativity and Lag</h3>
        <p className="mt-2 max-w-3xl text-slate-200">{TIER_COPY[tier]}</p>
      </header>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="panel rounded-2xl p-4">
          <h4 className="text-lg font-semibold text-white">Moving Observer</h4>
          <label className="mt-4 block text-sm text-slate-300">
            Velocity (v/c): <span className="mono-data text-accent">{frame.velocityVc.toFixed(2)}</span>
            <input
              className="mt-1 w-full"
              type="range"
              min={-velocityLimit}
              max={velocityLimit}
              step={0.01}
              value={frame.velocityVc}
              onChange={(event) => patchFrame({ velocityVc: Number(event.target.value) })}
            />
          </label>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setObserverMode('rest')}
              className={`rounded-full px-3 py-1.5 text-sm ${
                observerMode === 'rest'
                  ? 'border border-accent/70 bg-accent/20 text-accent'
                  : 'border border-white/20 text-slate-200 hover:bg-white/10'
              }`}
            >
              Rest Frame
            </button>
            <button
              type="button"
              onClick={() => setObserverMode('moving')}
              className={`rounded-full px-3 py-1.5 text-sm ${
                observerMode === 'moving'
                  ? 'border border-accent/70 bg-accent/20 text-accent'
                  : 'border border-white/20 text-slate-200 hover:bg-white/10'
              }`}
            >
              Moving Frame
            </button>
            <button
              type="button"
              onClick={applyBoostNow}
              className="rounded-full border border-warm/70 bg-warm/15 px-3 py-1.5 text-sm text-warm"
            >
              Apply Lorentz Boost
            </button>
          </div>
        </div>

        <div className="panel rounded-2xl p-4">
          <h4 className="text-lg font-semibold text-white">Derived Effects</h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-200">
            <li>
              Doppler scale: <span className="mono-data text-accent">{doppler.toFixed(3)}</span>
            </li>
            <li>
              Simultaneity lag: <span className="mono-data text-accent">{simultaneity.toFixed(3)}</span>
            </li>
            {tier !== 'beginner' && (
              <li>
                Gamma factor: <span className="mono-data text-accent">{g.toFixed(3)}</span>
              </li>
            )}
            {tier === 'advanced' && (
              <li>
                Length contraction ratio: <span className="mono-data text-accent">{contraction.toFixed(3)}</span>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="panel rounded-2xl p-4">
        <p className="text-sm text-slate-300">Conceptual GR curvature preview (teaching visual, not numerical GR solver)</p>
        <div className="mt-3 grid h-24 grid-cols-14 items-end gap-1 md:grid-cols-28">
          {curve.map((entry, index) => {
            const normalized = ((entry + 1) / 2) * 100;
            return (
              <div
                key={`${index}-${entry}`}
                className="rounded-sm bg-accent/75"
                style={{ height: `${Math.max(4, Math.min(100, normalized))}%`, opacity: 0.55 + Math.abs(entry) * 0.45 }}
              />
            );
          })}
        </div>
      </div>

      <CheckpointCard
        phaseId={2}
        title="Observer Shift"
        prompt="Describe how changing velocity modifies phase relationships between electric and magnetic components."
        comparison="The same six values now depend on reference frame, not just position."
      />
    </section>
  );
}
