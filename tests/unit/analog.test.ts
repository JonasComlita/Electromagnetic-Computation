import { describe, expect, it } from 'vitest';
import { applyDrift } from '@/lib/simulators/analog';
import { BASE_EM_STATE } from '@/lib/math/wave';

describe('analog drift model', () => {
  it('produces bounded perturbations for small elapsed values', () => {
    const drifted = applyDrift(BASE_EM_STATE, 0.1, 0.03, 0.01);
    expect(Math.abs(drifted.ex - BASE_EM_STATE.ex)).toBeLessThan(0.2);
    expect(Math.abs(drifted.by - BASE_EM_STATE.by)).toBeLessThan(0.2);
  });

  it('increases magnitude of thermal contribution as elapsed grows', () => {
    const early = applyDrift(BASE_EM_STATE, 0.1, 0.0, 0.02);
    const later = applyDrift(BASE_EM_STATE, 4, 0.0, 0.02);
    expect(Math.abs(later.ex - BASE_EM_STATE.ex)).toBeGreaterThan(Math.abs(early.ex - BASE_EM_STATE.ex));
  });
});
