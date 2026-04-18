import { describe, expect, it } from 'vitest';
import { decodeBalancedTernary, encodeBalancedTernary, vectorFlip } from '@/lib/simulators/ternary';

describe('balanced ternary helpers', () => {
  it('encodes positive, neutral, and negative values', () => {
    expect(encodeBalancedTernary(0.6)).toBe(1);
    expect(encodeBalancedTernary(0.2)).toBe(0);
    expect(encodeBalancedTernary(-0.7)).toBe(-1);
  });

  it('decodes trits back to signed values', () => {
    expect(decodeBalancedTernary(1)).toBe(1);
    expect(decodeBalancedTernary(0)).toBe(0);
    expect(decodeBalancedTernary(-1)).toBe(-1);
  });

  it('vector flip negates all trits', () => {
    const flipped = vectorFlip([1, 0, -1, 1, -1, 0]);
    expect(flipped).toEqual([-1, 0, 1, -1, 1, 0]);
  });
});
