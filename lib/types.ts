export type LessonTier = 'beginner' | 'student' | 'advanced';

export type EMState6 = {
  ex: number;
  ey: number;
  ez: number;
  bx: number;
  by: number;
  bz: number;
};

export type EMTensor4 = [
  [number, number, number, number],
  [number, number, number, number],
  [number, number, number, number],
  [number, number, number, number]
];

export type FrameConfig = {
  velocityVc: number;
  frequency: number;
  amplitude: number;
  phaseOffset: number;
};

export type SimulatorMetrics = {
  latency: number;
  drift: number;
  cycles: number;
  energyLike: number;
};

export type ComparisonScenario = {
  id: string;
  label: string;
  initial: EMState6;
  frame: FrameConfig;
  dt: number;
  steps: number;
};

/* ── Satellite extension ── */

export type SatelliteOrbit = 'LEO' | 'MEO' | 'GEO' | 'HEO';
export type FrequencyBand = 'L' | 'S' | 'C' | 'X' | 'Ku' | 'Ka';
export type ModulationScheme = 'BPSK' | 'QPSK' | '8PSK' | '16APSK';

export type SatelliteLink = {
  orbit: SatelliteOrbit;
  frequencyBand: FrequencyBand;
  eirpDbw: number;
  elevationDeg: number;
};

export type SatelliteMetrics = SimulatorMetrics & {
  propagationDelayMs: number;
  freeSpacePathLossDb: number;
  linkMarginDb: number;
  receivedPowerDbw: number;
  dopplerShiftHz: number;
  snrDb: number;
  bitErrorProxy: number;
};
