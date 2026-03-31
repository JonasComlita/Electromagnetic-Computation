export type TracePoint = {
  t: number;
  value: number;
};

export function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

export function squareWave(timeSec: number, frequencyHz: number, duty = 0.5): number {
  if (frequencyHz <= 0) {
    return 0;
  }
  const period = 1 / frequencyHz;
  const phase = ((timeSec % period) + period) % period;
  return phase < period * duty ? 1 : 0;
}

export function ternaryWave(timeSec: number, symbolRateHz: number): number {
  if (symbolRateHz <= 0) {
    return 0.5;
  }
  const symbolIndex = Math.floor(timeSec * symbolRateHz) % 3;
  if (symbolIndex === 0) {
    return 0;
  }
  if (symbolIndex === 1) {
    return 0.5;
  }
  return 1;
}

export function riseFunction(x: number, sharpness = 18): number {
  return 1 / (1 + Math.exp(-sharpness * x));
}

export function gaussian(x: number, mu: number, sigma: number): number {
  const s = Math.max(1e-4, sigma);
  return Math.exp(-((x - mu) ** 2) / (2 * s * s));
}

export function findCrossingTime(trace: TracePoint[], threshold: number, rising: boolean): number | null {
  for (let i = 1; i < trace.length; i += 1) {
    const a = trace[i - 1];
    const b = trace[i];
    const crossed = rising
      ? a.value < threshold && b.value >= threshold
      : a.value > threshold && b.value <= threshold;
    if (!crossed) {
      continue;
    }

    const dv = b.value - a.value;
    if (Math.abs(dv) < 1e-9) {
      return b.t;
    }
    const alpha = (threshold - a.value) / dv;
    return a.t + (b.t - a.t) * alpha;
  }
  return null;
}

export function rms(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }
  let sum = 0;
  for (const value of values) {
    sum += value * value;
  }
  return Math.sqrt(sum / values.length);
}
