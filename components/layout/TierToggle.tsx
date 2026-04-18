'use client';

import { useSessionStore } from '@/lib/store/useSessionStore';
import type { LessonTier } from '@/lib/types';

const TIERS: LessonTier[] = ['beginner', 'student', 'advanced'];

export function TierToggle(): JSX.Element {
  const tier = useSessionStore((state) => state.tier);
  const setTier = useSessionStore((state) => state.setTier);

  return (
    <div className="panel inline-flex items-center gap-1 rounded-full p-1 text-xs shadow-md" aria-label="Tier selector">
      {TIERS.map((entry) => {
        const active = entry === tier;
        return (
          <button
            key={entry}
            type="button"
            onClick={() => setTier(entry)}
            className={`rounded-full px-3 py-1.5 capitalize transition ${
              active
                ? 'bg-accent text-slate-950 shadow-[0_0_20px_rgba(77,217,255,0.45)]'
                : 'text-slate-200 hover:bg-white/10'
            }`}
          >
            {entry}
          </button>
        );
      })}
    </div>
  );
}
