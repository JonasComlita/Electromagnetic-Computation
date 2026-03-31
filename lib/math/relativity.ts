import type { EMState6, EMTensor4, FrameConfig } from '@/lib/types';
import { emStateToTensor, multiply4x4, tensorToEmState, transpose4x4 } from '@/lib/math/tensor';

export function clampVelocity(velocityVc: number): number {
  return Math.max(-0.99, Math.min(0.99, velocityVc));
}

export function gamma(velocityVc: number): number {
  const v = clampVelocity(velocityVc);
  return 1 / Math.sqrt(1 - v * v);
}

export function lorentzBoostX(velocityVc: number): EMTensor4 {
  const v = clampVelocity(velocityVc);
  const g = gamma(v);
  return [
    [g, -g * v, 0, 0],
    [-g * v, g, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1]
  ];
}

export function transformFieldWithBoost(state: EMState6, velocityVc: number): EMState6 {
  const lambda = lorentzBoostX(velocityVc);
  const tensor = emStateToTensor(state);
  const transformed = multiply4x4(multiply4x4(lambda, tensor), transpose4x4(lambda));
  return tensorToEmState(transformed);
}

export function applyFrameConfig(state: EMState6, frame: FrameConfig, timeSec: number): EMState6 {
  const transformed = transformFieldWithBoost(state, frame.velocityVc);
  const phase = 2 * Math.PI * frame.frequency * timeSec + frame.phaseOffset;
  const carrier = Math.sin(phase) * frame.amplitude;

  return {
    ex: transformed.ex * carrier,
    ey: transformed.ey * carrier,
    ez: transformed.ez * carrier,
    bx: transformed.bx * carrier,
    by: transformed.by * carrier,
    bz: transformed.bz * carrier
  };
}

export function dopplerFactor(velocityVc: number): number {
  const v = clampVelocity(velocityVc);
  return Math.sqrt((1 + v) / (1 - v));
}

export function simultaneityOffset(velocityVc: number, baselineDistance = 1): number {
  const v = clampVelocity(velocityVc);
  return v * baselineDistance;
}

export function conceptualCurvature(velocityVc: number, position: number): number {
  const g = gamma(velocityVc);
  return (g - 1) * Math.sin(position * Math.PI * 2);
}
