import { describe, expect, it } from 'vitest';
import {
  slantRangeKm,
  propagationDelayMs,
  freeSpacePathLossDb,
  dopplerShiftHz,
  velocityVcFromKms,
  computeFullLinkBudget,
  bitErrorProxy
} from '@/lib/math/satellite';
import { runSatelliteComparison, DEFAULT_SATELLITE_SCENARIO } from '@/lib/simulators/satellite';
import type { SatelliteLink } from '@/lib/types';

const LEO_KA: SatelliteLink = {
  orbit: 'LEO',
  frequencyBand: 'Ka',
  eirpDbw: 52,
  elevationDeg: 90
};

const GEO_KA: SatelliteLink = {
  orbit: 'GEO',
  frequencyBand: 'Ka',
  eirpDbw: 52,
  elevationDeg: 90
};

const GEO_L: SatelliteLink = {
  orbit: 'GEO',
  frequencyBand: 'L',
  eirpDbw: 52,
  elevationDeg: 90
};

describe('slant range', () => {
  it('equals altitude at 90° elevation (nadir pass)', () => {
    expect(slantRangeKm(600, 90)).toBeCloseTo(600, 0);
    expect(slantRangeKm(35786, 90)).toBeCloseTo(35786, 0);
  });

  it('is longer at lower elevation angles', () => {
    expect(slantRangeKm(600, 30)).toBeGreaterThan(slantRangeKm(600, 90));
    expect(slantRangeKm(600, 5)).toBeGreaterThan(slantRangeKm(600, 30));
  });
});

describe('propagation delay', () => {
  it('is approximately 2 ms one-way for LEO 600 km', () => {
    expect(propagationDelayMs(600, 90)).toBeCloseTo(2.0, 0);
  });

  it('is approximately 119 ms one-way for GEO', () => {
    expect(propagationDelayMs(35786, 90)).toBeCloseTo(119, 0);
  });

  it('GEO RTT exceeds 238 ms', () => {
    expect(propagationDelayMs(35786, 90) * 2).toBeGreaterThan(238);
  });
});

describe('free-space path loss', () => {
  it('increases with frequency at same distance', () => {
    const fsplL  = freeSpacePathLossDb(600, 1.5e9);
    const fsplKa = freeSpacePathLossDb(600, 30e9);
    expect(fsplKa).toBeGreaterThan(fsplL);
  });

  it('GEO Ka-band FSPL is above 210 dB', () => {
    expect(freeSpacePathLossDb(35786, 30e9)).toBeGreaterThan(210);
  });

  it('doubles (in dB) when distance doubles', () => {
    const d1 = freeSpacePathLossDb(1000, 10e9);
    const d2 = freeSpacePathLossDb(2000, 10e9);
    expect(d2 - d1).toBeCloseTo(6, 0);  // 20·log₁₀(2) ≈ 6 dB
  });
});

describe('doppler shift', () => {
  it('LEO Ka-band Doppler is in the hundreds of kHz range', () => {
    const dHz = dopplerShiftHz(7.56, 30e9);
    expect(dHz).toBeGreaterThan(500e3);
    expect(dHz).toBeLessThan(1500e3);
  });

  it('GEO has lower Doppler than LEO at same frequency', () => {
    const dLeo = dopplerShiftHz(7.56, 30e9);
    const dGeo = dopplerShiftHz(3.07, 30e9);
    expect(dLeo).toBeGreaterThan(dGeo);
  });

  it('velocityVc for LEO is well below 0.001', () => {
    expect(velocityVcFromKms(7.56)).toBeLessThan(0.001);
    expect(velocityVcFromKms(7.56)).toBeGreaterThan(0);
  });
});

describe('link budget', () => {
  it('LEO has better SNR than GEO at same EIRP and band', () => {
    const leoB = computeFullLinkBudget(LEO_KA);
    const geoB = computeFullLinkBudget(GEO_KA);
    expect(leoB.snrDb).toBeGreaterThan(geoB.snrDb);
  });

  it('L-band has less path loss than Ka-band at same orbit', () => {
    const geoKa = computeFullLinkBudget(GEO_KA);
    const geoL  = computeFullLinkBudget(GEO_L);
    expect(geoKa.freeSpacePathLossDb).toBeGreaterThan(geoL.freeSpacePathLossDb);
  });

  it('L-band has better SNR than Ka-band despite lower rain fade advantage', () => {
    const geoKa = computeFullLinkBudget(GEO_KA);
    const geoL  = computeFullLinkBudget(GEO_L);
    // L-band: lower FSPL wins even though Ka has huge bandwidth advantage
    expect(geoL.snrDb).toBeGreaterThan(geoKa.snrDb);
  });

  it('budget fields are all finite numbers', () => {
    const b = computeFullLinkBudget(LEO_KA);
    expect(Number.isFinite(b.slantRangeKm)).toBe(true);
    expect(Number.isFinite(b.propagationDelayMs)).toBe(true);
    expect(Number.isFinite(b.freeSpacePathLossDb)).toBe(true);
    expect(Number.isFinite(b.snrDb)).toBe(true);
    expect(Number.isFinite(b.linkMarginDb)).toBe(true);
    expect(Number.isFinite(b.dopplerShiftHz)).toBe(true);
  });
});

describe('bit error proxy', () => {
  it('binary has lower BER than analog at the same SNR', () => {
    const snr = 15;
    expect(bitErrorProxy('Binary', snr)).toBeLessThan(bitErrorProxy('Analog', snr));
  });

  it('binary has lower BER than ternary at the same SNR', () => {
    const snr = 15;
    expect(bitErrorProxy('Binary', snr)).toBeLessThan(bitErrorProxy('Ternary', snr));
  });

  it('all BER values are in [0, 1] range', () => {
    ['Binary', 'Analog', 'Ternary', 'Quantum'].forEach((name) => {
      const ber = bitErrorProxy(name, 10);
      expect(ber).toBeGreaterThanOrEqual(0);
      expect(ber).toBeLessThanOrEqual(1);
    });
  });

  it('BER decreases as SNR increases for binary', () => {
    const ber5  = bitErrorProxy('Binary', 5);
    const ber15 = bitErrorProxy('Binary', 15);
    const ber25 = bitErrorProxy('Binary', 25);
    expect(ber15).toBeLessThan(ber5);
    expect(ber25).toBeLessThan(ber15);
  });
});

describe('satellite comparison runner', () => {
  it('returns results for all four architectures', () => {
    const { results } = runSatelliteComparison(DEFAULT_SATELLITE_SCENARIO, LEO_KA);
    const names = results.map((r) => r.name);
    expect(names).toContain('Binary');
    expect(names).toContain('Analog');
    expect(names).toContain('Ternary');
    expect(names).toContain('Quantum');
  });

  it('all results have finite satellite metrics', () => {
    const { results } = runSatelliteComparison(DEFAULT_SATELLITE_SCENARIO, GEO_KA);
    results.forEach((r) => {
      expect(Number.isFinite(r.metrics.propagationDelayMs)).toBe(true);
      expect(Number.isFinite(r.metrics.freeSpacePathLossDb)).toBe(true);
      expect(Number.isFinite(r.metrics.snrDb)).toBe(true);
      expect(Number.isFinite(r.metrics.bitErrorProxy)).toBe(true);
    });
  });

  it('binary BER is lower than analog BER on a LEO Ka link', () => {
    const { results } = runSatelliteComparison(DEFAULT_SATELLITE_SCENARIO, LEO_KA);
    const binaryBer = results.find((r) => r.name === 'Binary')!.metrics.bitErrorProxy;
    const analogBer = results.find((r) => r.name === 'Analog')!.metrics.bitErrorProxy;
    expect(binaryBer).toBeLessThan(analogBer);
  });

  it('link budget RTT is greater for GEO than LEO', () => {
    const { budget: leoBudget } = runSatelliteComparison(DEFAULT_SATELLITE_SCENARIO, LEO_KA);
    const { budget: geoBudget } = runSatelliteComparison(DEFAULT_SATELLITE_SCENARIO, GEO_KA);
    expect(geoBudget.rttMs).toBeGreaterThan(leoBudget.rttMs);
  });
});
