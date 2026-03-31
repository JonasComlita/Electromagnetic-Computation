import { clamp01, gaussian, riseFunction, ternaryWave, type TracePoint } from '@/lib/circuits/common';

export type TernaryCircuitParams = {
  dt: number;
  steps: number;
  symbolRate: number;
  cLoad: number;
  gHigh: number;
  gMid: number;
  gLow: number;
  sigma: number;
};

export type TernaryTransferPoint = {
  vin: number;
  vout: number;
  decoded: -1 | 0 | 1;
};

export type TernaryCircuitResult = {
  vin: TracePoint[];
  vout: TracePoint[];
  decoded: TracePoint[];
  transfer: TernaryTransferPoint[];
  transitions: number;
};

const DEFAULTS: TernaryCircuitParams = {
  dt: 0.001,
  steps: 900,
  symbolRate: 8,
  cLoad: 0.035,
  gHigh: 1.2,
  gMid: 1.0,
  gLow: 1.2,
  sigma: 0.12
};

function withDefaults(params: Partial<TernaryCircuitParams>): TernaryCircuitParams {
  return { ...DEFAULTS, ...params };
}

function decodeLevel(voltage: number): -1 | 0 | 1 {
  if (voltage < 0.25) {
    return -1;
  }
  if (voltage > 0.75) {
    return 1;
  }
  return 0;
}

function levelToVoltage(level: -1 | 0 | 1): number {
  if (level === -1) {
    return 0;
  }
  if (level === 0) {
    return 0.5;
  }
  return 1;
}

function stepTernaryInverter(vIn: number, vOut: number, config: TernaryCircuitParams): number {
  const pullHigh = config.gHigh * riseFunction(0.33 - vIn, 20);
  const pullLow = config.gLow * riseFunction(vIn - 0.67, 20);
  const pullMid = config.gMid * gaussian(vIn, 0.5, config.sigma);

  const iNet = pullHigh * (1 - vOut) + pullMid * (0.5 - vOut) + pullLow * (0 - vOut);
  const dv = (iNet / Math.max(config.cLoad, 1e-6)) * config.dt;

  return clamp01(vOut + dv);
}

function transferCurve(config: TernaryCircuitParams): TernaryTransferPoint[] {
  const points: TernaryTransferPoint[] = [];

  for (let i = 0; i <= 25; i += 1) {
    const vin = i / 25;
    let vout = 0.5;
    for (let j = 0; j < 300; j += 1) {
      vout = stepTernaryInverter(vin, vout, config);
    }
    points.push({ vin, vout, decoded: decodeLevel(vout) });
  }

  return points;
}

export function simulateTernaryCmos(params: Partial<TernaryCircuitParams> = {}): TernaryCircuitResult {
  const config = withDefaults(params);
  const vin: TracePoint[] = [];
  const vout: TracePoint[] = [];
  const decoded: TracePoint[] = [];

  let out = 0.5;
  let previousLevel: -1 | 0 | 1 = 0;
  let transitions = 0;

  for (let i = 0; i < config.steps; i += 1) {
    const t = i * config.dt;
    const input = ternaryWave(t, config.symbolRate);

    out = stepTernaryInverter(input, out, config);
    const level = decodeLevel(out);

    if (i > 0 && level !== previousLevel) {
      transitions += 1;
    }

    previousLevel = level;

    vin.push({ t, value: input });
    vout.push({ t, value: out });
    decoded.push({ t, value: levelToVoltage(level) });
  }

  return {
    vin,
    vout,
    decoded,
    transfer: transferCurve(config),
    transitions
  };
}
