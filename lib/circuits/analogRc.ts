import { clamp01, findCrossingTime, rms, squareWave, type TracePoint } from '@/lib/circuits/common';

export type AnalogRcParams = {
  dt: number;
  steps: number;
  inputFrequency: number;
  r: number;
  c: number;
  noise: number;
  heat: number;
};

export type AnalogRcResult = {
  vin: TracePoint[];
  vout: TracePoint[];
  cutoffHz: number;
  phaseLagSec: number | null;
  attenuation: number;
};

const DEFAULTS: AnalogRcParams = {
  dt: 0.001,
  steps: 800,
  inputFrequency: 6,
  r: 0.6,
  c: 0.04,
  noise: 0.01,
  heat: 0.015
};

function withDefaults(params: Partial<AnalogRcParams>): AnalogRcParams {
  return { ...DEFAULTS, ...params };
}

function pseudoNoise(seed: number): number {
  const x = Math.sin(seed * 91.731) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1;
}

export function simulateAnalogRc(params: Partial<AnalogRcParams> = {}): AnalogRcResult {
  const config = withDefaults(params);
  const vin: TracePoint[] = [];
  const vout: TracePoint[] = [];

  let out = 0;

  for (let i = 0; i < config.steps; i += 1) {
    const t = i * config.dt;
    const input = squareWave(t, config.inputFrequency, 0.5);

    const tau = Math.max(config.r * config.c, 1e-5);
    const ideal = out + ((input - out) / tau) * config.dt;
    const noise = pseudoNoise(t + 0.31) * config.noise;
    const thermalDrift = config.heat * t * 0.01;
    out = clamp01(ideal + noise + thermalDrift);

    vin.push({ t, value: input });
    vout.push({ t, value: out });
  }

  const vinRise = findCrossingTime(vin, 0.5, true);
  const voutRise = findCrossingTime(vout, 0.5, true);
  const phaseLagSec = vinRise === null || voutRise === null ? null : Math.max(0, voutRise - vinRise);

  const vinValues = vin.map((entry) => entry.value);
  const voutValues = vout.map((entry) => entry.value);
  const attenuation = rms(voutValues) / Math.max(rms(vinValues), 1e-6);

  return {
    vin,
    vout,
    cutoffHz: 1 / (2 * Math.PI * Math.max(config.r * config.c, 1e-6)),
    phaseLagSec,
    attenuation
  };
}
