'use client';

import { useMemo, useState } from 'react';
import { trackEvent } from '@/lib/analytics';
import { BinarySimulator } from '@/lib/simulators/binary';
import { AnalogSimulator } from '@/lib/simulators/analog';
import { TernarySimulator } from '@/lib/simulators/ternary';
import { QuantumSimulator, blochVector } from '@/lib/simulators/quantum';
import { useSessionStore } from '@/lib/store/useSessionStore';
import type { ComparisonScenario, EMState6, SimulatorMetrics } from '@/lib/types';

type ResultCard = {
  name: string;
  state: EMState6;
  metrics: SimulatorMetrics;
  trace: string[];
  detail: string;
};

type ArchitectureComparePanelProps = {
  title?: string;
};

function formatState(state: EMState6): string {
  return `E(${state.ex.toFixed(2)}, ${state.ey.toFixed(2)}, ${state.ez.toFixed(2)}) B(${state.bx.toFixed(2)}, ${state.by.toFixed(2)}, ${state.bz.toFixed(2)})`;
}

export function ArchitectureComparePanel({ title = 'Grand Comparison: Binary vs Analog vs Ternary vs Quantum' }: ArchitectureComparePanelProps): JSX.Element {
  const tier = useSessionStore((state) => state.tier);
  const emState = useSessionStore((state) => state.emState);
  const frame = useSessionStore((state) => state.frame);
  const [dt, setDt] = useState(0.05);
  const [steps, setSteps] = useState(20);
  const [theta, setTheta] = useState(Math.PI / 3);
  const [phi, setPhi] = useState(Math.PI / 5);
  const [results, setResults] = useState<ResultCard[]>([]);

  const bloch = useMemo(() => blochVector(theta, phi), [theta, phi]);
  const traceDepth = tier === 'advanced' ? 4 : tier === 'student' ? 3 : 2;

  function runScenario(): void {
    const scenario: ComparisonScenario = {
      id: 'interactive-compare',
      label: 'Interactive Comparison',
      initial: emState,
      frame,
      dt,
      steps
    };

    const binary = new BinarySimulator();
    const analog = new AnalogSimulator();
    analog.setEnvironment(0.04, 0.02);
    const ternary = new TernarySimulator();
    const quantum = new QuantumSimulator();

    const entries: Array<[string, ReturnType<typeof binary.runScenario>, string[] | undefined, string]> = [
      ['Binary', binary.runScenario(scenario), binary.readTrace(), "Two's-complement quantization and explicit cycle cost"],
      ['Analog', analog.runScenario(scenario), analog.readTrace(), 'Continuous accumulation with temperature/noise drift'],
      ['Ternary', ternary.runScenario(scenario), ternary.readTrace(), 'Balanced trits represent sign symmetry directly'],
      ['Quantum', quantum.runScenario(scenario), quantum.readTrace(), 'Phase and Bloch-like state emulate native spin-style logic']
    ];

    setResults(
      entries.map(([name, output, trace, detail]) => ({
        name,
        state: output.state,
        metrics: output.metrics,
        trace: trace ?? [],
        detail
      }))
    );

    trackEvent('scenario_run', { dt, steps, velocity: frame.velocityVc });
  }

  return (
    <section className="space-y-4">
      <header>
        <h3 className="text-2xl font-semibold text-white">{title}</h3>
        <p className="mt-2 text-slate-200">
          Every architecture receives the same initial 6-value state and frame config. This reveals representation cost and behavior.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
        <div className="panel rounded-2xl p-4">
          <h4 className="text-lg font-semibold text-white">Scenario Controls</h4>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <label className="text-sm text-slate-300">
              Step size (dt): <span className="mono-data text-accent">{dt.toFixed(3)}</span>
              <input
                className="mt-1 w-full"
                type="range"
                min={0.01}
                max={0.2}
                step={0.01}
                value={dt}
                onChange={(event) => setDt(Number(event.target.value))}
              />
            </label>
            <label className="text-sm text-slate-300">
              Steps: <span className="mono-data text-accent">{steps}</span>
              <input
                className="mt-1 w-full"
                type="range"
                min={5}
                max={tier === 'advanced' ? 80 : 40}
                step={1}
                value={steps}
                onChange={(event) => setSteps(Number(event.target.value))}
              />
            </label>
          </div>
          <button
            type="button"
            onClick={runScenario}
            className="mt-4 rounded-full border border-accent/70 bg-accent/15 px-4 py-2 text-sm text-accent hover:bg-accent/20"
          >
            Run synchronized comparison
          </button>
        </div>

        <div className="panel rounded-2xl p-4">
          <h4 className="text-lg font-semibold text-white">1-Qubit Playground</h4>
          <p className="mt-1 text-sm text-slate-300">Conceptual Bloch controls for phase/spin intuition.</p>
          <label className="mt-3 block text-sm text-slate-300">
            Theta: <span className="mono-data text-accent">{theta.toFixed(2)}</span>
              <input
                className="mt-1 w-full"
                type="range"
                min={0}
                max={3.14}
                step={0.01}
                value={theta}
                disabled={tier === 'beginner'}
                onChange={(event) => setTheta(Number(event.target.value))}
              />
            </label>
          <label className="mt-3 block text-sm text-slate-300">
            Phi: <span className="mono-data text-accent">{phi.toFixed(2)}</span>
              <input
                className="mt-1 w-full"
                type="range"
                min={0}
                max={6.28}
                step={0.01}
                value={phi}
                disabled={tier === 'beginner'}
                onChange={(event) => setPhi(Number(event.target.value))}
              />
            </label>
          <div className="mt-3 rounded-lg border border-white/10 bg-black/20 p-3 text-sm text-slate-200">
            Bloch vector: <span className="mono-data text-warm">({bloch.x.toFixed(2)}, {bloch.y.toFixed(2)}, {bloch.z.toFixed(2)})</span>
          </div>
        </div>
      </div>

      <div className="grid gap-3 xl:grid-cols-2">
        {results.map((result) => (
          <article key={result.name} className="panel rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xl font-semibold text-white">{result.name}</h4>
              <span className="mono-data text-xs text-slate-400">cycles: {result.metrics.cycles}</span>
            </div>
            <p className="mt-1 text-sm text-slate-300">{result.detail}</p>
            <p className="mono-data mt-2 text-sm text-accent">{formatState(result.state)}</p>
            <p className="mt-2 text-xs text-slate-300">
              latency {result.metrics.latency.toFixed(2)} | drift {result.metrics.drift.toFixed(3)} | energy{' '}
              {result.metrics.energyLike.toFixed(3)}
            </p>
            <div className="mt-2 rounded-lg border border-white/10 bg-black/25 p-2">
              <p className="mb-1 text-xs uppercase tracking-[0.2em] text-slate-400">Trace</p>
              <ul className="space-y-1 text-xs text-slate-300">
                {result.trace.slice(-traceDepth).map((line, index) => (
                  <li key={`${result.name}-${index}-${line}`}>{line}</li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
