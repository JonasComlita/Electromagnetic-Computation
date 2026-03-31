import type { ComparisonScenario, EMState6, FrameConfig, SimulatorMetrics } from '@/lib/types';
import type { SimulatorAdapter } from '@/lib/simulators/adapter';
import { stepWave } from '@/lib/math/wave';

type Trit = -1 | 0 | 1;

type TernaryState = {
  state: EMState6;
  config: FrameConfig;
  elapsed: number;
  trits: [Trit, Trit, Trit, Trit, Trit, Trit];
  trace: string[];
};

function toTrit(value: number): Trit {
  if (value > 0.333) {
    return 1;
  }
  if (value < -0.333) {
    return -1;
  }
  return 0;
}

function fromTrit(trit: Trit): number {
  return trit;
}

function encode(state: EMState6): [Trit, Trit, Trit, Trit, Trit, Trit] {
  return [toTrit(state.ex), toTrit(state.ey), toTrit(state.ez), toTrit(state.bx), toTrit(state.by), toTrit(state.bz)];
}

function decode(trits: [Trit, Trit, Trit, Trit, Trit, Trit]): EMState6 {
  return {
    ex: fromTrit(trits[0]),
    ey: fromTrit(trits[1]),
    ez: fromTrit(trits[2]),
    bx: fromTrit(trits[3]),
    by: fromTrit(trits[4]),
    bz: fromTrit(trits[5])
  };
}

export class TernarySimulator implements SimulatorAdapter {
  private data: TernaryState = {
    state: { ex: 0, ey: 0, ez: 0, bx: 0, by: 0, bz: 0 },
    config: { velocityVc: 0, frequency: 1, amplitude: 1, phaseOffset: 0 },
    elapsed: 0,
    trits: [0, 0, 0, 0, 0, 0],
    trace: []
  };

  init(state: EMState6, config: FrameConfig): void {
    const trits = encode(state);
    this.data = {
      state: decode(trits),
      config,
      elapsed: 0,
      trits,
      trace: ['init: balanced ternary encoded as 6 trits']
    };
  }

  step(dt: number): void {
    this.data.elapsed += dt;
    const waveState = stepWave(this.data.state, this.data.config, dt, this.data.elapsed);
    this.data.trits = encode(waveState);
    this.data.state = decode(this.data.trits);
    this.data.trace = [...this.data.trace.slice(-11), `step(${dt.toFixed(3)}): trit flip/shift`];
  }

  readState(): EMState6 {
    return this.data.state;
  }

  readMetrics(): SimulatorMetrics {
    return {
      latency: 1,
      drift: 0.08,
      cycles: Math.round(this.data.elapsed * 8),
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

export function encodeBalancedTernary(value: number): Trit {
  return toTrit(value);
}

export function decodeBalancedTernary(trit: Trit): number {
  return fromTrit(trit);
}

export function vectorFlip(trits: [Trit, Trit, Trit, Trit, Trit, Trit]): [Trit, Trit, Trit, Trit, Trit, Trit] {
  return trits.map((value) => (value * -1) as Trit) as [Trit, Trit, Trit, Trit, Trit, Trit];
}

function energyLike(state: EMState6): number {
  return state.ex ** 2 + state.ey ** 2 + state.ez ** 2 + state.bx ** 2 + state.by ** 2 + state.bz ** 2;
}
