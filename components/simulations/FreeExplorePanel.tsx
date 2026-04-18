'use client';

import { useEffect, useState } from 'react';
import { WaveFieldCanvas } from '@/components/simulations/WaveFieldCanvas';
import { pluckField, stepWave } from '@/lib/math/wave';
import { useSessionStore } from '@/lib/store/useSessionStore';

function randomSigned(scale = 1): number {
  return (Math.random() * 2 - 1) * scale;
}

export function FreeExplorePanel(): JSX.Element {
  const frame = useSessionStore((state) => state.frame);
  const patchFrame = useSessionStore((state) => state.patchFrame);
  const emState = useSessionStore((state) => state.emState);
  const setEMState = useSessionStore((state) => state.setEMState);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    if (!running) {
      return undefined;
    }
    const interval = window.setInterval(() => {
      const store = useSessionStore.getState();
      const elapsed = performance.now() / 1000;
      store.setEMState(stepWave(store.emState, store.frame, 0.05, elapsed));
    }, 40);
    return () => window.clearInterval(interval);
  }, [running]);

  function randomizeField(): void {
    setEMState({
      ex: randomSigned(1.2),
      ey: randomSigned(1.2),
      ez: randomSigned(1.2),
      bx: randomSigned(1.2),
      by: randomSigned(1.2),
      bz: randomSigned(1.2)
    });
  }

  function pluck(): void {
    setEMState(pluckField(emState, 0.45));
  }

  return (
    <section className="space-y-4">
      <WaveFieldCanvas
        frequency={frame.frequency}
        amplitude={frame.amplitude}
        velocityVc={frame.velocityVc}
        phaseOffset={frame.phaseOffset}
        onPluck={pluck}
      />

      <div className="grid gap-4 lg:grid-cols-[1.25fr_1fr]">
        <div className="panel rounded-2xl p-4">
          <h3 className="text-lg font-semibold text-white">Explore Controls</h3>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <label className="text-sm text-slate-300">
              Frequency {frame.frequency.toFixed(2)}
              <input
                className="mt-1 w-full"
                type="range"
                min={0.1}
                max={3}
                step={0.05}
                value={frame.frequency}
                onChange={(event) => patchFrame({ frequency: Number(event.target.value) })}
              />
            </label>
            <label className="text-sm text-slate-300">
              Amplitude {frame.amplitude.toFixed(2)}
              <input
                className="mt-1 w-full"
                type="range"
                min={0.1}
                max={3}
                step={0.05}
                value={frame.amplitude}
                onChange={(event) => patchFrame({ amplitude: Number(event.target.value) })}
              />
            </label>
            <label className="text-sm text-slate-300">
              Velocity (v/c) {frame.velocityVc.toFixed(2)}
              <input
                className="mt-1 w-full"
                type="range"
                min={-0.95}
                max={0.95}
                step={0.01}
                value={frame.velocityVc}
                onChange={(event) => patchFrame({ velocityVc: Number(event.target.value) })}
              />
            </label>
            <label className="text-sm text-slate-300">
              Phase {frame.phaseOffset.toFixed(2)}
              <input
                className="mt-1 w-full"
                type="range"
                min={-3.14}
                max={3.14}
                step={0.01}
                value={frame.phaseOffset}
                onChange={(event) => patchFrame({ phaseOffset: Number(event.target.value) })}
              />
            </label>
          </div>
        </div>

        <div className="panel rounded-2xl p-4">
          <h3 className="text-lg font-semibold text-white">Actions</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setRunning((prev) => !prev)}
              className="rounded-full border border-white/20 px-3 py-1.5 text-sm text-slate-100 hover:bg-white/10"
            >
              {running ? 'Pause' : 'Resume'}
            </button>
            <button
              type="button"
              onClick={pluck}
              className="rounded-full border border-warm/60 bg-warm/15 px-3 py-1.5 text-sm text-warm"
            >
              Pluck
            </button>
            <button
              type="button"
              onClick={randomizeField}
              className="rounded-full border border-accent/60 bg-accent/15 px-3 py-1.5 text-sm text-accent"
            >
              Random 6-state
            </button>
          </div>
          <p className="mt-3 text-sm text-slate-300">
            Tip: Keep an eye on the persistent 6-number bars while you tweak controls. Every page shares this same field state.
          </p>
        </div>
      </div>
    </section>
  );
}
