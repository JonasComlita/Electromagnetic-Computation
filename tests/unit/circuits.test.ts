import { describe, expect, it } from 'vitest';
import { simulateBinaryCmos } from '@/lib/circuits/binaryCmos';
import { simulateAnalogRc } from '@/lib/circuits/analogRc';
import { simulateTernaryCmos } from '@/lib/circuits/ternaryCmos';

describe('circuit-level emulation engines', () => {
  it('binary CMOS produces NAND truth table with only 11 low', () => {
    const result = simulateBinaryCmos({ steps: 700, dt: 0.0015, inputFrequency: 5 });
    const truth = Object.fromEntries(result.nandTruth.map((row) => [String(row.a) + String(row.b), row.logic]));

    expect(truth['00']).toBe(1);
    expect(truth['01']).toBe(1);
    expect(truth['10']).toBe(1);
    expect(truth['11']).toBe(0);
  });

  it('analog RC reports attenuation below or equal to input baseline', () => {
    const result = simulateAnalogRc({ steps: 900, dt: 0.001, inputFrequency: 8, noise: 0 });
    expect(result.attenuation).toBeLessThanOrEqual(1.05);
    expect(result.cutoffHz).toBeGreaterThan(0);
  });

  it('ternary engine produces transfer points and observable transitions', () => {
    const result = simulateTernaryCmos({ steps: 900, dt: 0.001, symbolRate: 9 });
    expect(result.transfer.length).toBeGreaterThan(10);
    expect(result.transitions).toBeGreaterThan(0);

    const midPoint = result.transfer.find((point) => point.vin > 0.45 && point.vin < 0.55);
    expect(midPoint).toBeDefined();
    expect(midPoint?.decoded).toBe(0);
  });
});
