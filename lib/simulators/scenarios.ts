import type { ComparisonScenario } from '@/lib/types';
import { BASE_EM_STATE } from '@/lib/math/wave';

export const DEFAULT_SCENARIO: ComparisonScenario = {
  id: 'baseline-wave',
  label: 'Baseline Plane Wave',
  initial: BASE_EM_STATE,
  frame: {
    velocityVc: 0.35,
    frequency: 0.9,
    amplitude: 1,
    phaseOffset: 0
  },
  dt: 0.05,
  steps: 20
};
