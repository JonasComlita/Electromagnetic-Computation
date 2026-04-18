'use client';

import { useSessionStore } from '@/lib/store/useSessionStore';

type CheckpointCardProps = {
  phaseId: number;
  title: string;
  prompt: string;
  comparison: string;
};

export function CheckpointCard({ phaseId, title, prompt, comparison }: CheckpointCardProps): JSX.Element {
  const completedPhases = useSessionStore((state) => state.completedPhases);
  const toggleCompletedPhase = useSessionStore((state) => state.toggleCompletedPhase);
  const completed = completedPhases.includes(phaseId);

  return (
    <aside className="panel mt-4 rounded-2xl p-4">
      <p className="text-xs uppercase tracking-[0.22em] text-accent/75">Checkpoint</p>
      <h4 className="mt-1 text-lg font-semibold text-white">{title}</h4>
      <p className="mt-2 text-sm text-slate-200">{prompt}</p>
      <p className="mt-2 rounded-lg border border-white/10 bg-black/20 p-2 text-sm text-slate-300">
        What changed: <span className="text-white">{comparison}</span>
      </p>
      <button
        type="button"
        onClick={() => toggleCompletedPhase(phaseId)}
        className={`mt-3 rounded-full px-4 py-2 text-sm ${
          completed
            ? 'border border-emerald-300/40 bg-emerald-300/15 text-emerald-200'
            : 'border border-accent/60 bg-accent/15 text-accent'
        }`}
      >
        {completed ? 'Marked complete' : 'Mark checkpoint complete'}
      </button>
    </aside>
  );
}
