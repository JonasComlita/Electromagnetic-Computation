'use client';

import { useMemo } from 'react';
import { CheckpointCard } from '@/components/phases/CheckpointCard';
import { isAntisymmetric } from '@/lib/math/tensor';
import { emStateToTensor, tensorToEmState } from '@/lib/math/tensor';
import { transformFieldWithBoost } from '@/lib/math/relativity';
import { useSessionStore } from '@/lib/store/useSessionStore';
import type { LessonTier } from '@/lib/types';

const TIER_COPY: Record<LessonTier, string> = {
  beginner:
    'The 4x4 matrix is a container that includes the same six field values with symmetry rules. It is not extra data.',
  student:
    'Use tensor form for frame transforms. Use six-value form for storage and dashboards. This section bridges both views.',
  advanced:
    'Treat F(mu,nu) as the computational transform substrate and EMState6 as compressed canonical payload for architecture simulators.'
};

const UNIQUE_INDICES = new Set(['0-1', '0-2', '0-3', '1-2', '1-3', '2-3']);

export function PhaseTensorPanel(): JSX.Element {
  const tier = useSessionStore((state) => state.tier);
  const emState = useSessionStore((state) => state.emState);
  const frame = useSessionStore((state) => state.frame);
  const setEMState = useSessionStore((state) => state.setEMState);
  const tensor = useMemo(() => emStateToTensor(emState), [emState]);
  const antisymmetric = useMemo(() => isAntisymmetric(tensor), [tensor]);

  function normalizeFromTensor(): void {
    setEMState(tensorToEmState(tensor));
  }

  function boostAndExtract(): void {
    setEMState(transformFieldWithBoost(emState, frame.velocityVc));
  }

  return (
    <section id="phase-3" className="space-y-4">
      <header>
        <p className="text-xs uppercase tracking-[0.25em] text-accent/70">Phase 3</p>
        <h3 className="text-2xl font-semibold text-white">The Matrix: 4x4 Tensor vs 6-Value Vector</h3>
        <p className="mt-2 max-w-3xl text-slate-200">{TIER_COPY[tier]}</p>
      </header>

      <div className="panel overflow-hidden rounded-2xl">
        <div className="border-b border-white/10 px-4 py-3">
          <p className="text-sm text-slate-300">
            Tensor is antisymmetric: <span className={antisymmetric ? 'text-emerald-300' : 'text-rose-300'}>{String(antisymmetric)}</span>
          </p>
        </div>
        <div className="overflow-auto p-4">
          <table className="mono-data w-full border-collapse text-sm">
            <tbody>
              {tensor.map((row, rowIndex) => (
                <tr key={`row-${rowIndex}`}>
                  {row.map((value, columnIndex) => {
                    const key = `${Math.min(rowIndex, columnIndex)}-${Math.max(rowIndex, columnIndex)}`;
                    const unique = UNIQUE_INDICES.has(key);
                    const diagonal = rowIndex === columnIndex;
                    return (
                      <td
                        key={`cell-${rowIndex}-${columnIndex}`}
                        className={`border border-white/10 px-3 py-2 text-center ${
                          diagonal
                            ? 'bg-slate-950/75 text-slate-500'
                            : unique
                              ? 'bg-accent/15 text-accent'
                              : 'bg-white/5 text-slate-300'
                        }`}
                      >
                        {value.toFixed(3)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <button
          type="button"
          onClick={normalizeFromTensor}
          className="panel rounded-xl px-4 py-3 text-left text-sm text-slate-200 hover:bg-white/10"
        >
          Re-extract 6-value state from the tensor
        </button>
        <button
          type="button"
          onClick={boostAndExtract}
          className="panel rounded-xl px-4 py-3 text-left text-sm text-slate-200 hover:bg-white/10"
        >
          Apply frame boost in tensor form, then extract new 6-value state
        </button>
      </div>

      <CheckpointCard
        phaseId={3}
        title="Representation Bridge"
        prompt="Explain why the 4x4 matrix is useful for transforms while six values remain enough to define the field."
        comparison="You now distinguish structure (4x4 transform space) from content (6 independent values)."
      />
    </section>
  );
}
