import Link from 'next/link';
import { FreeExplorePanel } from '@/components/simulations/FreeExplorePanel';

export default function ExplorePage(): JSX.Element {
  return (
    <div className="space-y-6">
      <section className="panel rounded-3xl p-6">
        <p className="text-xs uppercase tracking-[0.25em] text-accent/75">Free Explore</p>
        <h2 className="mt-2 text-3xl font-semibold text-white">Sandbox the EM field in real time</h2>
        <p className="mt-3 max-w-3xl text-slate-200">
          Use this workspace to experiment outside the guided curriculum. Your 6-number state remains shared across every page.
        </p>
      </section>

      <FreeExplorePanel />

      <div className="panel rounded-2xl p-4 text-sm text-slate-200">
        Compare your current state across computational models on the{' '}
        <Link href="/compare" className="text-accent hover:underline">
          architecture comparison page
        </Link>
        .
      </div>
    </div>
  );
}
