import type { ComparisonScenario, EMState6, FrameConfig, SimulatorMetrics } from '@/lib/types';
import type { SimulatorAdapter } from '@/lib/simulators/adapter';
import { stepWave } from '@/lib/math/wave';

type QuantumState = {
  state: EMState6;
  config: FrameConfig;
  elapsed: number;
  theta: number;
  phi: number;
  trace: string[];
};

export class QuantumSimulator implements SimulatorAdapter {
  private data: QuantumState = {
    state: { ex: 0, ey: 0, ez: 0, bx: 0, by: 0, bz: 0 },
    config: { velocityVc: 0, frequency: 1, amplitude: 1, phaseOffset: 0 },
    elapsed: 0,
    theta: Math.PI / 2,
    phi: 0,
    trace: []
  };

  init(state: EMState6, config: FrameConfig): void {
    this.data = {
      ...this.data,
      state,
      config,
      elapsed: 0,
      trace: ['init: qubit Bloch state seeded from phase']
    };
  }

  step(dt: number): void {
    this.data.elapsed += dt;
    this.data.phi += dt * this.data.config.frequency * Math.PI * 2;
    this.data.theta = Math.PI / 2 + Math.sin(this.data.elapsed * 0.4) * 0.4;

    const wave = stepWave(this.data.state, this.data.config, dt, this.data.elapsed);
    const bloch = blochVector(this.data.theta, this.data.phi);

    this.data.state = {
      ex: wave.ex * bloch.x,
      ey: wave.ey * bloch.y,
      ez: wave.ez * bloch.z,
      bx: wave.bx * bloch.x,
      by: wave.by * bloch.y,
      bz: wave.bz * bloch.z
    };

    this.data.trace = [...this.data.trace.slice(-11), `step(${dt.toFixed(3)}): phase-spin superposition`];
  }

  readState(): EMState6 {
    return this.data.state;
  }

  readMetrics(): SimulatorMetrics {
    return {
      latency: 0.9,
      drift: 0.02,
      cycles: Math.round(this.data.elapsed * 12),
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

export function blochVector(theta: number, phi: number): { x: number; y: number; z: number } {
  return {
    x: Math.sin(theta) * Math.cos(phi),
    y: Math.sin(theta) * Math.sin(phi),
    z: Math.cos(theta)
  };
}

function energyLike(state: EMState6): number {
  return state.ex ** 2 + state.ey ** 2 + state.ez ** 2 + state.bx ** 2 + state.by ** 2 + state.bz ** 2;
}
