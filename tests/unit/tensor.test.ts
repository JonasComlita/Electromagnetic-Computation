import { describe, expect, it } from 'vitest';
import { emStateToTensor, isAntisymmetric, tensorToEmState } from '@/lib/math/tensor';
import { gamma, transformFieldWithBoost } from '@/lib/math/relativity';
import type { EMState6 } from '@/lib/types';

const SAMPLE_STATE: EMState6 = {
  ex: 1.2,
  ey: -0.4,
  ez: 0.8,
  bx: -0.3,
  by: 1.1,
  bz: 0.2
};

describe('tensor mapping', () => {
  it('round-trips between 6-value state and 4x4 tensor', () => {
    const tensor = emStateToTensor(SAMPLE_STATE);
    const recovered = tensorToEmState(tensor);
    expect(recovered).toEqual(SAMPLE_STATE);
  });

  it('produces an antisymmetric tensor', () => {
    const tensor = emStateToTensor(SAMPLE_STATE);
    expect(isAntisymmetric(tensor)).toBe(true);
  });
});

describe('lorentz transform helpers', () => {
  it('keeps state unchanged at zero velocity', () => {
    const transformed = transformFieldWithBoost(SAMPLE_STATE, 0);
    expect(transformed.ex).toBeCloseTo(SAMPLE_STATE.ex, 8);
    expect(transformed.ey).toBeCloseTo(SAMPLE_STATE.ey, 8);
    expect(transformed.ez).toBeCloseTo(SAMPLE_STATE.ez, 8);
    expect(transformed.bx).toBeCloseTo(SAMPLE_STATE.bx, 8);
    expect(transformed.by).toBeCloseTo(SAMPLE_STATE.by, 8);
    expect(transformed.bz).toBeCloseTo(SAMPLE_STATE.bz, 8);
  });

  it('increases gamma as |v| increases', () => {
    expect(gamma(0)).toBeCloseTo(1, 8);
    expect(gamma(0.6)).toBeGreaterThan(1);
    expect(gamma(0.9)).toBeGreaterThan(gamma(0.6));
  });
});
