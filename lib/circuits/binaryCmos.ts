import { clamp01, findCrossingTime, squareWave, type TracePoint } from '@/lib/circuits/common';

export type BinaryCircuitParams = {
  dt: number;
  steps: number;
  inputFrequency: number;
  duty: number;
  vdd: number;
  cLoad: number;
  rn: number;
  rp: number;
  leakage: number;
  vthN: number;
  vthP: number;
};

export type BinaryNandSample = {
  a: 0 | 1;
  b: 0 | 1;
  vout: number;
  logic: 0 | 1;
};

export type BinaryCircuitResult = {
  vin: TracePoint[];
  inv1: TracePoint[];
  inv2: TracePoint[];
  propagationDelayNs: number | null;
  nandTruth: BinaryNandSample[];
};

const DEFAULTS: BinaryCircuitParams = {
  dt: 0.001,
  steps: 800,
  inputFrequency: 6,
  duty: 0.5,
  vdd: 1,
  cLoad: 0.03,
  rn: 1,
  rp: 1,
  leakage: 0.002,
  vthN: 0.45,
  vthP: 0.45
};

function withDefaults(params: Partial<BinaryCircuitParams>): BinaryCircuitParams {
  return { ...DEFAULTS, ...params };
}

function nmosConductance(vGate: number, config: BinaryCircuitParams): number {
  return vGate > config.vthN ? 1 / config.rn : config.leakage;
}

function pmosConductance(vGate: number, config: BinaryCircuitParams): number {
  return config.vdd - vGate > config.vthP ? 1 / config.rp : config.leakage;
}

function stepNode(vOut: number, gUp: number, gDown: number, config: BinaryCircuitParams): number {
  const iNet = gUp * (config.vdd - vOut) - gDown * vOut;
  const dv = (iNet / Math.max(config.cLoad, 1e-6)) * config.dt;
  return clamp01(vOut + dv);
}

function settleNandVoltage(a: 0 | 1, b: 0 | 1, config: BinaryCircuitParams): number {
  let vOut = config.vdd;
  const vA = a * config.vdd;
  const vB = b * config.vdd;

  for (let i = 0; i < 400; i += 1) {
    const gP1 = pmosConductance(vA, config);
    const gP2 = pmosConductance(vB, config);
    const gUp = gP1 + gP2;

    const nOnA = vA > config.vthN;
    const nOnB = vB > config.vthN;
    const gDown = nOnA && nOnB ? 1 / (2 * config.rn) : config.leakage;

    vOut = stepNode(vOut, gUp, gDown, config);
  }

  return vOut;
}

function findFirstFallingCrossAfter(trace: TracePoint[], threshold: number, tStart: number): number | null {
  for (let i = 1; i < trace.length; i += 1) {
    const a = trace[i - 1];
    const b = trace[i];

    if (a.t < tStart) {
      continue;
    }

    const crossed = a.value > threshold && b.value <= threshold;
    if (!crossed) {
      continue;
    }

    const dv = b.value - a.value;
    if (Math.abs(dv) < 1e-12) {
      return b.t;
    }

    const alpha = (threshold - a.value) / dv;
    return a.t + (b.t - a.t) * alpha;
  }

  return null;
}

export function simulateBinaryCmos(params: Partial<BinaryCircuitParams> = {}): BinaryCircuitResult {
  const config = withDefaults(params);
  const vin: TracePoint[] = [];
  const inv1: TracePoint[] = [];
  const inv2: TracePoint[] = [];

  let v1 = 0;
  let v2 = config.vdd;

  for (let i = 0; i < config.steps; i += 1) {
    const t = i * config.dt;
    const input = squareWave(t, config.inputFrequency, config.duty) * config.vdd;

    const gUp1 = pmosConductance(input, config);
    const gDown1 = nmosConductance(input, config);
    v1 = stepNode(v1, gUp1, gDown1, config);

    const gUp2 = pmosConductance(v1, config);
    const gDown2 = nmosConductance(v1, config);
    v2 = stepNode(v2, gUp2, gDown2, config);

    vin.push({ t, value: input });
    inv1.push({ t, value: v1 });
    inv2.push({ t, value: v2 });
  }

  const inputRise = findCrossingTime(vin, 0.5 * config.vdd, true);
  const outputFall = inputRise === null ? null : findFirstFallingCrossAfter(inv2, 0.5 * config.vdd, inputRise);
  const propagationDelayNs =
    inputRise === null || outputFall === null || outputFall < inputRise ? null : (outputFall - inputRise) * 1e9;

  const nandTruth: BinaryNandSample[] = [
    { a: 0 as 0 | 1, b: 0 as 0 | 1, vout: settleNandVoltage(0, 0, config), logic: 1 },
    { a: 0 as 0 | 1, b: 1 as 0 | 1, vout: settleNandVoltage(0, 1, config), logic: 1 },
    { a: 1 as 0 | 1, b: 0 as 0 | 1, vout: settleNandVoltage(1, 0, config), logic: 1 },
    { a: 1 as 0 | 1, b: 1 as 0 | 1, vout: settleNandVoltage(1, 1, config), logic: 0 }
  ].map((row) => ({
    ...row,
    logic: row.vout >= 0.5 * config.vdd ? 1 : 0
  }));

  return {
    vin,
    inv1,
    inv2,
    propagationDelayNs,
    nandTruth
  };
}
