'use client';

import { useSessionStore } from '@/lib/store/useSessionStore';
import type { LessonTier } from '@/lib/types';

type ArchitectureSpec = {
  name: string;
  identity: string;
  stateModel: string;
  updatePipeline: string;
  primitives: string;
  strengths: string[];
  constraints: string[];
  bestFit: string;
  advancedNote: string;
};

const ARCHITECTURES: ArchitectureSpec[] = [
  {
    name: 'Binary',
    identity: 'Deterministic approximator',
    stateModel: 'EMState6 is quantized into six signed fixed-point lanes (int-like words).',
    updatePipeline: 'decode -> numeric update -> sign-aware arithmetic -> requantize',
    primitives: 'bit shifts, signed add/subtract, overflow handling, two-complement sign logic',
    strengths: [
      'Highly reproducible and easy to replay exactly.',
      'Fits commodity tooling and optimization workflows.',
      'Great baseline for comparing operation count cost.'
    ],
    constraints: [
      'Quantization error appears when values are clamped or rounded.',
      'Sign handling and scaling overhead inflate cycle cost.',
      'Natural wave continuity is represented indirectly, not natively.'
    ],
    bestFit: 'When exact reproducibility, deterministic debugging, and broad deployability matter most.',
    advancedNote:
      'Cycle growth can be modeled as O(components * primitive_ops * steps). In this demo, each step charges explicit operations per component update.'
  },
  {
    name: 'Analog',
    identity: 'Continuous mirror',
    stateModel: 'EMState6 remains continuous-valued and evolves directly in amplitude space.',
    updatePipeline: 'continuous integration -> perturbation injection -> thermal/noise drift accumulation',
    primitives: 'weighted sums, continuous integration, perturbation terms, stochastic drift',
    strengths: [
      'Intuitive for physically smooth transitions and interpolation.',
      'Low conceptual latency for accumulation-like operations.',
      'Excellent for teaching signal realism and robustness limits.'
    ],
    constraints: [
      'Noise and heat terms cause drift over long runs.',
      'State persistence and exact replay are harder than binary.',
      'Sensitivity to parameter calibration can mislead novices.'
    ],
    bestFit: 'When teaching physical intuition, continuity, and fragility under noise/temperature effects.',
    advancedNote:
      'Drift can be analyzed as a bounded stochastic process with deterministic trend terms. Error envelopes widen with elapsed integration and environment parameters.'
  },
  {
    name: 'Ternary',
    identity: 'Balanced symmetry machine',
    stateModel: 'Each component is encoded around zero in balanced trits: -1, 0, +1.',
    updatePipeline: 'sample -> encode to trits -> flip/shift style logic -> decode to component view',
    primitives: 'balanced sign flips, trit shifts, threshold-based encode/decode',
    strengths: [
      'Symmetric handling of positive and negative directionality.',
      'Compact and conceptually elegant for sign-centric vector operations.',
      'Good bridge between analog continuity and binary discreteness.'
    ],
    constraints: [
      'Coarse quantization can hide fine-grained component variation.',
      'Threshold selection strongly affects stability and realism.',
      'Tooling ecosystem is less mature than binary pipelines.'
    ],
    bestFit: 'When sign symmetry and directional transforms are the main teaching objective.',
    advancedNote:
      'Balanced encodings reduce asymmetry in sign representation. Tradeoff: lower representational granularity unless multi-trit precision is expanded.'
  },
  {
    name: 'Quantum',
    identity: 'Phase-native conceptual model',
    stateModel: 'Component evolution is modulated by a Bloch-style phase/orientation state.',
    updatePipeline: 'phase advance -> orientation update -> wave state projection -> readout',
    primitives: 'phase rotation, orientation mapping, projection onto component axes',
    strengths: [
      'Excellent for teaching phase and geometric state intuition.',
      'Captures non-classical representation language (superposition-like viewpoints).',
      'Supports rich conceptual comparisons against classical pipelines.'
    ],
    constraints: [
      'This app uses a conceptual single-qubit style model, not full quantum simulation.',
      'Interpretability can drop quickly without strong guidance.',
      'Real hardware constraints are not represented here.'
    ],
    bestFit: 'When introducing phase-native thinking and geometry-based state interpretation.',
    advancedNote:
      'The model here is pedagogical: Bloch vector style controls drive projection weights into EM components. It is not a full amplitude-vector circuit simulator.'
  }
];

function headlineForTier(tier: LessonTier): string {
  if (tier === 'beginner') {
    return 'You are seeing high-level machine behavior and practical tradeoffs.';
  }
  if (tier === 'student') {
    return 'You are seeing implementation-level details with clear state/update mappings.';
  }
  return 'You are seeing architecture semantics, computational pathways, and model limits.';
}

export function ArchitectureDeepDive(): JSX.Element {
  const tier = useSessionStore((state) => state.tier);

  return (
    <section className="space-y-4">
      <header className="panel rounded-2xl p-5">
        <p className="text-xs uppercase tracking-[0.22em] text-accent/75">Under The Hood</p>
        <h3 className="mt-1 text-2xl font-semibold text-white">Architecture Deep Dive</h3>
        <p className="mt-2 text-slate-200">{headlineForTier(tier)}</p>
      </header>

      <div className="grid gap-4 xl:grid-cols-2">
        {ARCHITECTURES.map((entry) => (
          <article key={entry.name} className="panel rounded-2xl p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-accent/75">{entry.identity}</p>
            <h4 className="mt-1 text-xl font-semibold text-white">{entry.name}</h4>

            <p className="mt-3 text-sm text-slate-200">
              <span className="font-semibold text-white">State model:</span> {entry.stateModel}
            </p>
            <p className="mt-2 text-sm text-slate-200">
              <span className="font-semibold text-white">Update pipeline:</span> {entry.updatePipeline}
            </p>
            <p className="mt-2 text-sm text-slate-200">
              <span className="font-semibold text-white">Core primitives:</span> {entry.primitives}
            </p>

            <p className="mt-3 text-sm font-semibold text-white">Strengths</p>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-200">
              {entry.strengths.map((item) => (
                <li key={`${entry.name}-strength-${item}`}>{item}</li>
              ))}
            </ul>

            <p className="mt-3 text-sm font-semibold text-white">Constraints</p>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-200">
              {entry.constraints.map((item) => (
                <li key={`${entry.name}-constraint-${item}`}>{item}</li>
              ))}
            </ul>

            <p className="mt-3 text-sm text-slate-200">
              <span className="font-semibold text-white">Best fit:</span> {entry.bestFit}
            </p>

            {tier !== 'beginner' && (
              <div className="mt-3 rounded-lg border border-white/10 bg-black/25 p-3 text-xs text-slate-300">
                <p className="mb-1 uppercase tracking-[0.16em] text-slate-400">Technical Note</p>
                <p>{entry.advancedNote}</p>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
