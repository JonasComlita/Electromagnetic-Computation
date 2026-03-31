import { describe, expect, it } from 'vitest';
import { addSignedInt16, BinarySimulator } from '@/lib/simulators/binary';
import { BASE_EM_STATE } from '@/lib/math/wave';

describe('binary signed math', () => {
  it('handles int16 overflow with two-complement behavior', () => {
    expect(addSignedInt16(32767, 1)).toBe(-32768);
    expect(addSignedInt16(-32768, -1)).toBe(32767);
  });

  it('accumulates cycle counts across steps', () => {
    const simulator = new BinarySimulator();
    simulator.init(BASE_EM_STATE, { velocityVc: 0.2, frequency: 1, amplitude: 1, phaseOffset: 0 });
    simulator.step(0.05);
    simulator.step(0.05);
    expect(simulator.readMetrics().cycles).toBeGreaterThan(0);
  });
});
