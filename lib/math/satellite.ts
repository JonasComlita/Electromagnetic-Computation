import type { FrequencyBand, SatelliteLink, SatelliteOrbit } from '@/lib/types';

/* ── Orbit and band parameter tables ── */

export type OrbitParams = {
  altitudeKm: number;
  velocityKms: number;
  label: string;
  description: string;
};

export type BandParams = {
  carrierHz: number;
  label: string;
  rainFadeDb: number;
  ionosphericDb: number;
  typicalUse: string;
};

export const ORBIT_PARAMS: Record<SatelliteOrbit, OrbitParams> = {
  LEO: {
    altitudeKm: 600,
    velocityKms: 7.56,
    label: 'LEO — 600 km',
    description: 'Low latency (~4 ms RTT), high Doppler, frequent handoffs. Starlink, ISS.'
  },
  MEO: {
    altitudeKm: 20200,
    velocityKms: 3.87,
    label: 'MEO — 20,200 km',
    description: 'GPS/GNSS altitude. Moderate delay, good per-satellite coverage.'
  },
  GEO: {
    altitudeKm: 35786,
    velocityKms: 3.07,
    label: 'GEO — 35,786 km',
    description: 'Fixed position in sky, ~238 ms RTT. Traditional broadcast TV orbit.'
  },
  HEO: {
    altitudeKm: 39750,
    velocityKms: 1.50,
    label: 'HEO — apogee ~39,750 km',
    description: 'Molniya orbit. Extended dwell over polar regions; highly variable delay.'
  }
};

export const BAND_PARAMS: Record<FrequencyBand, BandParams> = {
  L:  { carrierHz: 1.5e9,  label: 'L-band (1.5 GHz)',  rainFadeDb: 0.1, ionosphericDb: 1.0, typicalUse: 'Mobile satellite, GPS' },
  S:  { carrierHz: 2.4e9,  label: 'S-band (2.4 GHz)',  rainFadeDb: 0.2, ionosphericDb: 0.4, typicalUse: 'Weather satellites, some mobile' },
  C:  { carrierHz: 4.0e9,  label: 'C-band (4 GHz)',    rainFadeDb: 0.5, ionosphericDb: 0.1, typicalUse: 'Legacy broadcast TV, backhaul' },
  X:  { carrierHz: 10.0e9, label: 'X-band (10 GHz)',   rainFadeDb: 1.0, ionosphericDb: 0.0, typicalUse: 'Military, radar, deep space' },
  Ku: { carrierHz: 14.0e9, label: 'Ku-band (14 GHz)',  rainFadeDb: 3.0, ionosphericDb: 0.0, typicalUse: 'Direct broadcast TV, VSAT' },
  Ka: { carrierHz: 30.0e9, label: 'Ka-band (30 GHz)',  rainFadeDb: 8.0, ionosphericDb: 0.0, typicalUse: 'HTS, Starlink user links, O3b' }
};

/* ── Physical constants ── */

const C_LIGHT = 299_792_458;         // m/s
const EARTH_RADIUS_KM = 6_371;
const BOLTZMANN = 1.380649e-23;      // J/K

/* ── Geometry ── */

/**
 * Slant range from ground to satellite accounting for elevation angle.
 * Uses the oblique-triangle formula from ITU-R P.619.
 */
export function slantRangeKm(altitudeKm: number, elevationDeg = 90): number {
  const el = Math.max(5, elevationDeg) * (Math.PI / 180);
  const re = EARTH_RADIUS_KM;
  return (
    Math.sqrt((re * Math.cos(el)) ** 2 + altitudeKm * (altitudeKm + 2 * re)) -
    re * Math.cos(el)
  );
}

/* ── Propagation delay ── */

export function propagationDelayMs(altitudeKm: number, elevationDeg = 90): number {
  return (slantRangeKm(altitudeKm, elevationDeg) * 1000) / C_LIGHT * 1000;
}

/* ── Free-space path loss (Friis) ── */

export function freeSpacePathLossDb(distanceKm: number, frequencyHz: number): number {
  const d = distanceKm * 1000;
  return 20 * Math.log10((4 * Math.PI * d * frequencyHz) / C_LIGHT);
}

/* ── Doppler ── */

export function dopplerShiftHz(velocityKms: number, carrierHz: number): number {
  return (velocityKms * 1000 / C_LIGHT) * carrierHz;
}

export function velocityVcFromKms(velocityKms: number): number {
  return (velocityKms * 1000) / C_LIGHT;
}

/* ── Link budget ── */

const BANDWIDTH_HZ = 36e6;           // 36 MHz — standard transponder bandwidth
const SYSTEM_TEMP_K = 290;           // room temperature noise reference
const ANTENNA_GAIN_DBI = 35;         // typical 1.2m dish gain at Ku/Ka
const REQUIRED_SNR_DB = 10;          // Eb/N0 floor for QPSK demodulation

export function systemNoisePowerDbw(
  tempK = SYSTEM_TEMP_K,
  bandHz = BANDWIDTH_HZ
): number {
  return 10 * Math.log10(BOLTZMANN * tempK * bandHz);
}

export function receivedPowerDbw(
  eirpDbw: number,
  fsplDb: number,
  atmosphericLossDb: number,
  antennaGainDbi = ANTENNA_GAIN_DBI
): number {
  return eirpDbw - fsplDb - atmosphericLossDb + antennaGainDbi;
}

export function computeSnrDb(link: SatelliteLink): number {
  const orbit = ORBIT_PARAMS[link.orbit];
  const band  = BAND_PARAMS[link.frequencyBand];
  const range = slantRangeKm(orbit.altitudeKm, link.elevationDeg);
  const fspl  = freeSpacePathLossDb(range, band.carrierHz);
  const atmos = band.rainFadeDb + band.ionosphericDb;
  const rx    = receivedPowerDbw(link.eirpDbw, fspl, atmos);
  const noise = systemNoisePowerDbw();
  return rx - noise;
}

export function computeLinkMarginDb(link: SatelliteLink): number {
  return computeSnrDb(link) - REQUIRED_SNR_DB;
}

/* ── Amplitude attenuation for simulator input ── */

/**
 * Maps the received-vs-noise ratio to a 0–1 linear amplitude scale
 * so the architecture simulators receive a realistically attenuated signal.
 */
export function attenuatedAmplitude(originalAmplitude: number, link: SatelliteLink): number {
  const snr = computeSnrDb(link);
  // Map SNR: 30 dB → full amplitude, 0 dB → 0.1, below 0 → near zero
  const norm = Math.max(0, Math.min(1, snr / 30));
  return originalAmplitude * (0.05 + 0.95 * norm);
}

/* ── Bit error rate proxies ── */

/**
 * Simplified BER proxy per architecture at a given SNR.
 * Returns 0 (perfect) → 1 (total loss).
 * Real BER curves are architecture-specific; these approximate the ordering correctly.
 */
export function bitErrorProxy(architectureName: string, snrDb: number): number {
  const snrLin = Math.pow(10, snrDb / 10);

  switch (architectureName) {
    case 'Binary': {
      // BPSK: BER ≈ 0.5·erfc(√SNR) — best noise immunity of the four
      const x = Math.sqrt(Math.max(0, snrLin));
      const erfc = x > 4 ? Math.exp(-(x * x)) / (x * Math.sqrt(Math.PI)) :
                   x > 0 ? Math.max(1e-12, 1 - x / 2.0) : 0.5;
      return Math.min(0.5, Math.max(1e-12, 0.5 * erfc));
    }
    case 'Analog': {
      // Continuous fidelity degrades linearly with SNR — cannot exploit hard decisions
      return Math.min(1, Math.max(0, 1 / (1 + snrLin * 0.08)));
    }
    case 'Ternary': {
      // 3PSK: ~0.3 dB worse than BPSK at same power
      const snrAdj = snrLin * 0.93;
      const x = Math.sqrt(Math.max(0, snrAdj));
      const erfc = x > 4 ? Math.exp(-(x * x)) / (x * Math.sqrt(Math.PI)) :
                   x > 0 ? Math.max(1e-12, 1 - x / 2.0) : 0.5;
      return Math.min(0.5, Math.max(1e-12, 0.67 * erfc));
    }
    case 'Quantum': {
      // QBER: different physics — Micius achieved <2% under good conditions
      // Noise raises it toward the ~11% security threshold
      return Math.min(0.5, Math.max(0.005, 0.02 + 0.3 / (1 + snrLin * 0.5)));
    }
    default:
      return 0.5;
  }
}

/* ── Full link budget summary ── */

export type LinkBudget = {
  slantRangeKm: number;
  propagationDelayMs: number;
  rttMs: number;
  freeSpacePathLossDb: number;
  atmosphericLossDb: number;
  receivedPowerDbw: number;
  noiseFloorDbw: number;
  snrDb: number;
  linkMarginDb: number;
  dopplerShiftHz: number;
  dopplerVc: number;
  attenuationFactor: number;
};

export function computeFullLinkBudget(link: SatelliteLink): LinkBudget {
  const orbit  = ORBIT_PARAMS[link.orbit];
  const band   = BAND_PARAMS[link.frequencyBand];
  const range  = slantRangeKm(orbit.altitudeKm, link.elevationDeg);
  const delay  = propagationDelayMs(orbit.altitudeKm, link.elevationDeg);
  const fspl   = freeSpacePathLossDb(range, band.carrierHz);
  const atmos  = band.rainFadeDb + band.ionosphericDb;
  const rx     = receivedPowerDbw(link.eirpDbw, fspl, atmos);
  const noise  = systemNoisePowerDbw();
  const snr    = rx - noise;
  const margin = snr - REQUIRED_SNR_DB;
  const dHz    = dopplerShiftHz(orbit.velocityKms, band.carrierHz);
  const dVc    = velocityVcFromKms(orbit.velocityKms);
  const atten  = attenuatedAmplitude(1, link);

  return {
    slantRangeKm:       range,
    propagationDelayMs: delay,
    rttMs:              delay * 2,
    freeSpacePathLossDb: fspl,
    atmosphericLossDb:  atmos,
    receivedPowerDbw:   rx,
    noiseFloorDbw:      noise,
    snrDb:              snr,
    linkMarginDb:       margin,
    dopplerShiftHz:     dHz,
    dopplerVc:          dVc,
    attenuationFactor:  atten
  };
}
