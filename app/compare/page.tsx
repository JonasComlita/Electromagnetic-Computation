import { ArchitectureComparePanel } from '@/components/simulations/ArchitectureComparePanel';
import { ArchitectureDeepDive } from '@/components/simulations/ArchitectureDeepDive';

export default function ComparePage(): JSX.Element {
  return (
    <div className="space-y-6">
      <section className="panel rounded-3xl p-6">
        <p className="text-xs uppercase tracking-[0.25em] text-accent/75">Architecture Compare</p>
        <h2 className="mt-2 text-3xl font-semibold text-white">Run one scenario through four architectures</h2>
        <p className="mt-3 max-w-3xl text-slate-200">
          This page isolates architecture behavior: Binary, Analog, Ternary, and Quantum adapters receive identical initial values
          and frame configuration.
        </p>
      </section>

      <ArchitectureComparePanel />
      <ArchitectureDeepDive />
    </div>
  );
}
