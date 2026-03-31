'use client';

import { useEffect, useMemo, useState } from 'react';
import { CheckpointCard } from '@/components/phases/CheckpointCard';
import { WaveFieldCanvas } from '@/components/simulations/WaveFieldCanvas';
import { trackEvent } from '@/lib/analytics';
import { pluckField, stepWave } from '@/lib/math/wave';
import { useSessionStore } from '@/lib/store/useSessionStore';
import type { LessonTier } from '@/lib/types';

const TIER_COPY: Record<LessonTier, string> = {
  beginner:
    'A wave is not a single line. At each point, the electric and magnetic vectors co-evolve. Use controls to feel this movement.',
  student:
    'Treat this as a local six-value state machine. Frequency and phase shift determine how Ex..Bz evolve through time.',
  advanced:
    'Observe frame-driven modulation over the six-component field basis. This panel seeds the state for later Lorentz and architecture transforms.'
};

export function PhaseFieldPanel(): JSX.Element {
  const tier = useSessionStore((state) => state.tier);
  const emState = useSessionStore((state) => state.emState);
  const frame = useSessionStore((state) => state.frame);
  const setEMState = useSessionStore((state) => state.setEMState);
  const patchFrame = useSessionStore((state) => state.patchFrame);
  const [running, setRunning] = useState(true);
  const dt = tier === 'advanced' ? 0.02 : tier === 'student' ? 0.04 : 0.06;

  useEffect(() => {
    if (!running) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      const store = useSessionStore.getState();
      const elapsed = performance.now() / 1000;
      const next = stepWave(store.emState, store.frame, dt, elapsed);
      store.setEMState(next);
    }, 40);

    return () => window.clearInterval(interval);
  }, [dt, running]);

  const lagDegrees = useMemo(() => Math.round((frame.phaseOffset / Math.PI) * 180), [frame.phaseOffset]);

  function handlePluck(): void {
    setEMState(pluckField(emState, 0.45));
    trackEvent('simulator_step', { simulator: 'field', action: 'pluck' });
  }

  return (
    <section id="phase-1" className="space-y-4">
      <header>
        <p className="text-xs uppercase tracking-[0.25em] text-accent/70">Phase 1</p>
        <h3 className="text-2xl font-semibold text-white">The Medium: Electromagnetic Waves</h3>
        <p className="mt-2 max-w-3xl text-slate-200">{TIER_COPY[tier]}</p>
      </header>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <WaveFieldCanvas
          frequency={frame.frequency}
          amplitude={frame.amplitude}
          velocityVc={frame.velocityVc}
          phaseOffset={frame.phaseOffset}
          onPluck={handlePluck}
        />
        <div className="panel rounded-2xl p-4">
          <h4 className="text-lg font-semibold text-white">Wave Controls</h4>
          <label className="mt-4 block text-sm text-slate-300">
            Frequency: <span className="mono-data text-accent">{frame.frequency.toFixed(2)}</span>
            <input
              className="mt-1 w-full"
              type="range"
              min={0.2}
              max={2.5}
              step={0.05}
              value={frame.frequency}
              onChange={(event) => patchFrame({ frequency: Number(event.target.value) })}
            />
          </label>
          <label className="mt-3 block text-sm text-slate-300">
            Amplitude: <span className="mono-data text-accent">{frame.amplitude.toFixed(2)}</span>
            <input
              className="mt-1 w-full"
              type="range"
              min={0.2}
              max={2.4}
              step={0.05}
              value={frame.amplitude}
              onChange={(event) => patchFrame({ amplitude: Number(event.target.value) })}
            />
          </label>
          {tier !== 'beginner' && (
            <label className="mt-3 block text-sm text-slate-300">
              Phase Lag: <span className="mono-data text-accent">{lagDegrees} deg</span>
              <input
                className="mt-1 w-full"
                type="range"
                min={-3.14}
                max={3.14}
                step={0.05}
                value={frame.phaseOffset}
                onChange={(event) => patchFrame({ phaseOffset: Number(event.target.value) })}
              />
            </label>
          )}

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => setRunning((prev) => !prev)}
              className="rounded-full border border-white/30 px-3 py-1.5 text-sm text-slate-100 hover:bg-white/10"
            >
              {running ? 'Pause' : 'Resume'}
            </button>
            <button
              type="button"
              onClick={handlePluck}
              className="rounded-full border border-warm/60 bg-warm/15 px-3 py-1.5 text-sm text-warm"
            >
              Add impulse
            </button>
          </div>
          <p className="mt-3 text-xs text-slate-400">
            Detail level: <span className="capitalize text-accent">{tier}</span> (dt {dt.toFixed(2)})
          </p>
        </div>
      </div>

      <CheckpointCard
        phaseId={1}
        title="Field Intuition"
        prompt="Explain why a wave at one point in space still needs six values, not one amplitude."
        comparison="You moved from viewing a wave as a line to treating it as a local 6-value vector state."
      />
    </section>
  );
}
