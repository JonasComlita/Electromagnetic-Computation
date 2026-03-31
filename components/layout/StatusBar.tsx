'use client';

import { useMemo } from 'react';
import { useSessionStore } from '@/lib/store/useSessionStore';
import type { EMState6 } from '@/lib/types';

type StatusBarProps = {
  position: 'top' | 'bottom';
};

const ORDER: Array<keyof EMState6> = ['ex', 'ey', 'ez', 'bx', 'by', 'bz'];

function finiteOr(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

export function StatusBar({ position }: StatusBarProps): JSX.Element {
  const emState = useSessionStore((state) => state.emState);
  const frame = useSessionStore((state) => state.frame);

  const values = useMemo(
    () =>
      ORDER.map((key) => ({
        key,
        value: finiteOr((emState as EMState6 | undefined)?.[key], 0)
      })),
    [emState]
  );

  const velocity = finiteOr((frame as { velocityVc?: unknown } | undefined)?.velocityVc, 0);
  const frequency = finiteOr((frame as { frequency?: unknown } | undefined)?.frequency, 0);
  const amplitude = finiteOr((frame as { amplitude?: unknown } | undefined)?.amplitude, 0);

  const baseClass =
    'mono-data z-50 w-full border-y border-accent/20 bg-[#041018]/90 px-4 py-2 text-xs text-slate-100 backdrop-blur';
  const containerClass = position === 'top' ? baseClass + ' sticky top-0' : baseClass + ' sticky bottom-0';

  return (
    <div className={containerClass}>
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-1">
        <span className="mr-2 uppercase tracking-[0.25em] text-accent">6-Number State</span>
        {values.map(({ key, value }) => (
          <span key={key}>
            {key.toUpperCase()} <strong className="text-warm">{value.toFixed(3)}</strong>
          </span>
        ))}
        <span className="ml-auto text-slate-300">
          v/c <strong className="text-accent">{velocity.toFixed(2)}</strong> | f{' '}
          <strong className="text-accent">{frequency.toFixed(2)}</strong> | A{' '}
          <strong className="text-accent">{amplitude.toFixed(2)}</strong>
        </span>
      </div>
    </div>
  );
}
