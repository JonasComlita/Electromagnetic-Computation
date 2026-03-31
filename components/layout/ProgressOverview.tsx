'use client';

import Link from 'next/link';
import { useSessionStore } from '@/lib/store/useSessionStore';

const PHASES = [
  { id: 1, title: 'Field', href: '/guided#phase-1' },
  { id: 2, title: 'Relativity', href: '/guided#phase-2' },
  { id: 3, title: 'Matrix', href: '/guided#phase-3' },
  { id: 4, title: 'Architectures', href: '/guided#phase-4' }
];

export function ProgressOverview(): JSX.Element {
  const completed = useSessionStore((state) => state.completedPhases);
  const resetProgress = useSessionStore((state) => state.resetProgress);

  return (
    <div className="panel rounded-2xl p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Guided Progress</h3>
        <button
          type="button"
          onClick={resetProgress}
          className="rounded-full border border-white/20 px-2.5 py-1 text-xs text-slate-200 hover:bg-white/10"
        >
          Reset
        </button>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {PHASES.map((phase) => {
          const done = completed.includes(phase.id);
          return (
            <Link
              key={phase.id}
              href={phase.href}
              className={`rounded-xl border px-3 py-2 text-sm ${
                done
                  ? 'border-emerald-300/40 bg-emerald-400/10 text-emerald-200'
                  : 'border-white/15 bg-white/5 text-slate-200 hover:bg-white/10'
              }`}
            >
              {phase.id}. {phase.title}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
