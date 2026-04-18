import type { EMState6, FrameConfig } from '@/lib/types';
import { applyFrameConfig } from '@/lib/math/relativity';

export const BASE_EM_STATE: EMState6 = {
  ex: 1,
  ey: 0,
  ez: 0,
  bx: 0,
  by: 1,
  bz: 0
};

export function stepWave(base: EMState6, frame: FrameConfig, dt: number, elapsed: number): EMState6 {
  const next = applyFrameConfig(base, frame, elapsed + dt);

  return {
    ex: round4(next.ex),
    ey: round4(next.ey),
    ez: round4(next.ez),
    bx: round4(next.bx),
    by: round4(next.by),
    bz: round4(next.bz)
  };
}

export function pluckField(base: EMState6, impulse: number): EMState6 {
  return {
    ex: round4(base.ex + impulse),
    ey: round4(base.ey + impulse * 0.6),
    ez: round4(base.ez + impulse * 0.3),
    bx: round4(base.bx - impulse * 0.2),
    by: round4(base.by + impulse),
    bz: round4(base.bz - impulse * 0.4)
  };
}

function round4(value: number): number {
  return Math.round(value * 10000) / 10000;
}
