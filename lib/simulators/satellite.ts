import type { ComparisonScenario, EMState6, SatelliteLink, SatelliteMetrics } from '@/lib/types';
import { BinarySimulator } from '@/lib/simulators/binary';
import { AnalogSimulator } from '@/lib/simulators/analog';
import { TernarySimulator } from '@/lib/simulators/ternary';
import { QuantumSimulator } from '@/lib/simulators/quantum';
import {
  ORBIT_PARAMS,
  BAND_PARAMS,
  computeFullLinkBudget,
  bitErrorProxy,
  attenuatedAmplitude,
  velocityVcFromKms,
  type LinkBudget
} from '@/lib/math/satellite';
import { BASE_EM_STATE } from '@/lib/math/wave';

/* ── Public result types ── */

export type SatelliteArchitectureResult = {
  name: string;
  state: EMState6;
  metrics: SatelliteMetrics;
  trace: string[];
  detail: string;
  rationale: string;
};

/* ── Default scenario used when none is provided ── */

export const DEFAULT_SATELLITE_SCENARIO: ComparisonScenario = {
  id: 'satellite-baseline',
  label: 'Satellite Baseline',
  initial: BASE_EM_STATE,
  frame: { velocityVc: 0, frequency: 1.0, amplitude: 1.0, phaseOffset: 0 },
  dt: 0.05,
  steps: 20
};

/* ── Architecture descriptor table ── */

type ArchDescriptor = {
  name: string;
  detail: string;
  rationale: string;
  noiseMultiplier: number;   // relative noise sensitivity vs binary
};

const ARCH_DESCRIPTORS: ArchDescriptor[] = [
  {
    name: 'Binary',
    detail: 'Hard-decision BPSK/QPSK — industry standard for satellite digital links.',
    rationale:
      'Quantization is a strength, not a weakness, at long range. A hard ±1 decision ' +
      'recovers a clean bit from a barely-above-noise signal. DVB-S2, GPS, Starlink ' +
      'all use binary phase modulation for exactly this reason.',
    noiseMultiplier: 1.0
  },
  {
    name: 'Analog',
    detail: 'Continuous amplitude — historical C-band TV; rain fade causes severe drift at range.',
    rationale:
      'Early satellite TV (INTELSAT, C-band) used FM-modulated analog carriers. ' +
      'The 189 dB path loss at GEO Ka-band makes continuous amplitude unsustainable: ' +
      'noise and thermal drift overwhelm the signal. Analog chains require enormous ' +
      'dish apertures to compensate.',
    noiseMultiplier: 4.2
  },
  {
    name: 'Ternary',
    detail: 'Balanced ±1/0/+1 encoding — symmetric noise margins, limited deployment.',
    rationale:
      '3-level PSK trades ~0.3 dB noise margin for slightly higher spectral efficiency. ' +
      'Experimental DVB-S extensions and some CCSDS proposals use multi-level schemes. ' +
      'The symmetric balanced encoding handles polarity uncertainty well, but the thinner ' +
      'decision margins make it more sensitive to phase noise than BPSK.',
    noiseMultiplier: 1.35
  },
  {
    name: 'Quantum',
    detail: 'QKD-style phase encoding — Micius satellite demonstrated 2017; QBER replaces BER.',
    rationale:
      'China\'s Micius satellite demonstrated satellite-to-ground quantum key distribution ' +
      'over 1,200 km in 2017, achieving QBER < 2%. The Bloch-vector model here captures ' +
      'the geometric intuition: the qubit state is an orientation, and measurement collapse ' +
      'is the eavesdrop detector. Path loss reduces key generation rate, not key fidelity.',
    noiseMultiplier: 0.8  // different physics — noise doesn't degrade key the same way
  }
];

/* ── Main runner ── */

export function runSatelliteComparison(
  baseScenario: ComparisonScenario,
  link: SatelliteLink
): { results: SatelliteArchitectureResult[]; budget: LinkBudget } {
  const budget = computeFullLinkBudget(link);
  const band   = BAND_PARAMS[link.frequencyBand];
  const orbit  = ORBIT_PARAMS[link.orbit];

  /* Build a channel-conditioned scenario: same field, attenuated amplitude, Doppler-shifted frequency */
  const attAmp = attenuatedAmplitude(baseScenario.frame.amplitude, link);
  const dVc    = velocityVcFromKms(orbit.velocityKms);

  const channelScenario: ComparisonScenario = {
    ...baseScenario,
    frame: {
      velocityVc:  dVc,
      frequency:   baseScenario.frame.frequency * (1 + dVc),    // Doppler
      amplitude:   attAmp,                                       // path loss
      phaseOffset: baseScenario.frame.phaseOffset
    }
  };

  const results: SatelliteArchitectureResult[] = ARCH_DESCRIPTORS.map((desc) => {
    let sim: BinarySimulator | AnalogSimulator | TernarySimulator | QuantumSimulator;

    switch (desc.name) {
      case 'Binary':
        sim = new BinarySimulator();
        break;
      case 'Analog': {
        const a = new AnalogSimulator();
        /* More noise at higher bands — rain fade injects thermal-like perturbations */
        a.setEnvironment(
          0.04 + band.rainFadeDb * 0.006,
          0.02 + band.ionosphericDb * 0.004
        );
        sim = a;
        break;
      }
      case 'Ternary':
        sim = new TernarySimulator();
        break;
      case 'Quantum':
      default:
        sim = new QuantumSimulator();
        break;
    }

    const output  = sim.runScenario(channelScenario);
    const trace   = sim.readTrace();
    const ber     = bitErrorProxy(desc.name, budget.snrDb);

    const satMetrics: SatelliteMetrics = {
      ...output.metrics,
      propagationDelayMs:  budget.propagationDelayMs,
      freeSpacePathLossDb: budget.freeSpacePathLossDb,
      linkMarginDb:        budget.linkMarginDb,
      receivedPowerDbw:    budget.receivedPowerDbw,
      dopplerShiftHz:      budget.dopplerShiftHz,
      snrDb:               budget.snrDb,
      bitErrorProxy:       ber
    };

    return {
      name:     desc.name,
      state:    output.state,
      metrics:  satMetrics,
      trace:    trace ?? [],
      detail:   desc.detail,
      rationale: desc.rationale
    };
  });

  return { results, budget };
}
