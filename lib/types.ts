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
