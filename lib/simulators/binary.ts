import type { ComparisonScenario, EMState6, FrameConfig, SimulatorMetrics } from '@/lib/types';
import type { SimulatorAdapter } from '@/lib/simulators/adapter';
import { stepWave } from '@/lib/math/wave';

const SCALE = 1000;

type BinaryState = {
  state: EMState6;
  config: FrameConfig;
  elapsed: number;
  cycles: number;
  trace: string[];
};

const toInt16 = (value: number) => Math.max(-32768, Math.min(32767, Math.round(value * SCALE)));
const fromInt16 = (value: number) => value / SCALE;

function quantize(state: EMState6): EMState6 {
  return {
    ex: fromInt16(toInt16(state.ex)),
    ey: fromInt16(toInt16(state.ey)),
    ez: fromInt16(toInt16(state.ez)),
    bx: fromInt16(toInt16(state.bx)),
    by: fromInt16(toInt16(state.by)),
    bz: fromInt16(toInt16(state.bz))
  };
}

export class BinarySimulator implements SimulatorAdapter {
  private data: BinaryState = {
    state: { ex: 0, ey: 0, ez: 0, bx: 0, by: 0, bz: 0 },
    config: { velocityVc: 0, frequency: 1, amplitude: 1, phaseOffset: 0 },
    elapsed: 0,
    cycles: 0,
    trace: []
  };

  init(state: EMState6, config: FrameConfig): void {
    this.data = {
      state: quantize(state),
      config,
      elapsed: 0,
      cycles: 0,
      trace: ['init: quantized into signed 16-bit fixed-point']
    };
  }

  step(dt: number): void {
    this.data.elapsed += dt;
    const next = stepWave(this.data.state, this.data.config, dt, this.data.elapsed);
    this.data.state = quantize(next);
    this.data.cycles += 6 * 4;
    this.data.trace = [...this.data.trace.slice(-11), `step(${dt.toFixed(3)}): twos-complement update`];
  }

  readState(): EMState6 {
    return this.data.state;
  }

  readMetrics(): SimulatorMetrics {
    return {
      latency: 1.8,
      drift: 0,
      cycles: this.data.cycles,
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

export function addSignedInt16(a: number, b: number): number {
  const sum = (a + b) & 0xffff;
  return sum > 0x7fff ? sum - 0x10000 : sum;
}

function energyLike(state: EMState6): number {
  return state.ex ** 2 + state.ey ** 2 + state.ez ** 2 + state.bx ** 2 + state.by ** 2 + state.bz ** 2;
}
