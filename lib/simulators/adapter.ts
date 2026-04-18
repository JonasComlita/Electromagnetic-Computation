import type { ComparisonScenario, EMState6, FrameConfig, SimulatorMetrics } from '@/lib/types';

export type SimulatorAdapter = {
  init: (state: EMState6, config: FrameConfig) => void;
  step: (dt: number) => void;
  readState: () => EMState6;
  readMetrics: () => SimulatorMetrics;
  readTrace: () => string[];
  runScenario: (scenario: ComparisonScenario) => { state: EMState6; metrics: SimulatorMetrics };
};
