import type { ComparisonScenario, EMState6, FrameConfig, SimulatorMetrics } from '@/lib/types';
import type { SimulatorAdapter } from '@/lib/simulators/adapter';
import { stepWave } from '@/lib/math/wave';

type AnalogState = {
  state: EMState6;
  config: FrameConfig;
  elapsed: number;
  noise: number;
  heat: number;
  trace: string[];
};

function seededNoise(seed: number): number {
  const x = Math.sin(seed * 999.12) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1;
}

export class AnalogSimulator implements SimulatorAdapter {
  private data: AnalogState = {
    state: { ex: 0, ey: 0, ez: 0, bx: 0, by: 0, bz: 0 },
    config: { velocityVc: 0, frequency: 1, amplitude: 1, phaseOffset: 0 },
    elapsed: 0,
    noise: 0.03,
    heat: 0.01,
    trace: []
  };

  setEnvironment(noise: number, heat: number): void {
    this.data.noise = noise;
    this.data.heat = heat;
  }

  init(state: EMState6, config: FrameConfig): void {
    this.data = {
      ...this.data,
      state,
      config,
      elapsed: 0,
      trace: ['init: continuous voltage domain']
    };
  }

  step(dt: number): void {
    this.data.elapsed += dt;
    const next = stepWave(this.data.state, this.data.config, dt, this.data.elapsed);
    this.data.state = applyDrift(next, this.data.elapsed, this.data.noise, this.data.heat);
    this.data.trace = [...this.data.trace.slice(-11), `step(${dt.toFixed(3)}): integrated + drift/noise`];
  }

  readState(): EMState6 {
    return this.data.state;
  }

  readMetrics(): SimulatorMetrics {
    const drift = Math.abs(this.data.state.ex - Math.round(this.data.state.ex * 10) / 10) * 0.5;
    return {
      latency: 0.4,
      drift,
      cycles: Math.round(this.data.elapsed * 10),
      energyLike: energyLike(this.data.state)
    };
  }

  readTrace(): string[] {
    return this.data.trace;
  }

  runScenario(scenario: ComparisonScenario): { state: EMState6; metrics: SimulatorMetrics } {
    this.init(scenario.initial, scenario.frame);
    for (let i = 0; i < scenario.steps; i += 1) {
      this.step(scenario.dt);
    }
    return { state: this.readState(), metrics: this.readMetrics() };
  }
}

export function applyDrift(state: EMState6, elapsed: number, noise: number, heat: number): EMState6 {
  const jiggle = (shift: number) => seededNoise(elapsed + shift) * noise;
  const warm = heat * elapsed * 0.01;

  return {
    ex: state.ex + jiggle(0.1) + warm,
    ey: state.ey + jiggle(0.2) + warm,
    ez: state.ez + jiggle(0.3) + warm,
    bx: state.bx + jiggle(0.4) - warm,
    by: state.by + jiggle(0.5) - warm,
    bz: state.bz + jiggle(0.6) - warm
  };
}

function energyLike(state: EMState6): number {
  return state.ex ** 2 + state.ey ** 2 + state.ez ** 2 + state.bx ** 2 + state.by ** 2 + state.bz ** 2;
}
