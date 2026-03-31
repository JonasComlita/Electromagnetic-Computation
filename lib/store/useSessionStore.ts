'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { EMState6, FrameConfig, LessonTier } from '@/lib/types';
import { trackEvent } from '@/lib/analytics';
import { BASE_EM_STATE } from '@/lib/math/wave';

type ObserverMode = 'rest' | 'moving';

type SessionStore = {
  tier: LessonTier;
  emState: EMState6;
  frame: FrameConfig;
  observerMode: ObserverMode;
  completedPhases: number[];
  setTier: (tier: LessonTier) => void;
  setEMState: (state: EMState6) => void;
  patchFrame: (patch: Partial<FrameConfig>) => void;
  setObserverMode: (mode: ObserverMode) => void;
  toggleCompletedPhase: (phaseId: number) => void;
  resetProgress: () => void;
};

const defaultFrame: FrameConfig = {
  velocityVc: 0,
  frequency: 1,
  amplitude: 1,
  phaseOffset: 0
};

function finiteOr(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function normalizeEMState(raw: unknown): EMState6 {
  const data = (raw ?? {}) as Partial<EMState6>;
  return {
    ex: finiteOr(data.ex, BASE_EM_STATE.ex),
    ey: finiteOr(data.ey, BASE_EM_STATE.ey),
    ez: finiteOr(data.ez, BASE_EM_STATE.ez),
    bx: finiteOr(data.bx, BASE_EM_STATE.bx),
    by: finiteOr(data.by, BASE_EM_STATE.by),
    bz: finiteOr(data.bz, BASE_EM_STATE.bz)
  };
}

function normalizeFrame(raw: unknown): FrameConfig {
  const data = (raw ?? {}) as Partial<FrameConfig>;
  return {
    velocityVc: finiteOr(data.velocityVc, defaultFrame.velocityVc),
    frequency: finiteOr(data.frequency, defaultFrame.frequency),
    amplitude: finiteOr(data.amplitude, defaultFrame.amplitude),
    phaseOffset: finiteOr(data.phaseOffset, defaultFrame.phaseOffset)
  };
}

function normalizeTier(raw: unknown): LessonTier {
  return raw === 'student' || raw === 'advanced' ? raw : 'beginner';
}

function normalizeObserver(raw: unknown): ObserverMode {
  return raw === 'moving' ? 'moving' : 'rest';
}

function normalizePhases(raw: unknown): number[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  const set = new Set<number>();
  for (const item of raw) {
    if (typeof item === 'number' && Number.isFinite(item)) {
      set.add(Math.trunc(item));
    }
  }

  return Array.from(set).sort((a, b) => a - b);
}

export const useSessionStore = create<SessionStore>()(
  persist(
    (set, get) => ({
      tier: 'beginner',
      emState: BASE_EM_STATE,
      frame: defaultFrame,
      observerMode: 'rest',
      completedPhases: [],
      setTier: (tier) => {
        set({ tier: normalizeTier(tier) });
        trackEvent('tier_changed', { tier });
      },
      setEMState: (state) => set({ emState: normalizeEMState(state) }),
      patchFrame: (patch) => set({ frame: normalizeFrame({ ...get().frame, ...patch }) }),
      setObserverMode: (mode) => {
        const normalized = normalizeObserver(mode);
        set({ observerMode: normalized });
        trackEvent('observer_changed', { mode: normalized });
      },
      toggleCompletedPhase: (phaseId) => {
        const phases = new Set(get().completedPhases);
        if (phases.has(phaseId)) {
          phases.delete(phaseId);
        } else {
          phases.add(phaseId);
          trackEvent('phase_completed', { phaseId });
        }
        set({ completedPhases: Array.from(phases).sort((a, b) => a - b) });
      },
      resetProgress: () => set({ completedPhases: [] })
    }),
    {
      name: 'em-session-store',
      version: 2,
      migrate: (persistedState) => {
        const state = (persistedState ?? {}) as Partial<SessionStore>;
        return {
          tier: normalizeTier(state.tier),
          emState: normalizeEMState(state.emState),
          frame: normalizeFrame(state.frame),
          observerMode: normalizeObserver(state.observerMode),
          completedPhases: normalizePhases(state.completedPhases)
        };
      },
      merge: (persistedState, currentState) => {
        const persisted = (persistedState ?? {}) as Partial<SessionStore>;
        return {
          ...currentState,
          ...persisted,
          tier: normalizeTier(persisted.tier),
          emState: normalizeEMState(persisted.emState),
          frame: normalizeFrame(persisted.frame),
          observerMode: normalizeObserver(persisted.observerMode),
          completedPhases: normalizePhases(persisted.completedPhases)
        };
      },
      partialize: (state) => ({
        tier: state.tier,
        emState: state.emState,
        frame: state.frame,
        observerMode: state.observerMode,
        completedPhases: state.completedPhases
      })
    }
  )
);
