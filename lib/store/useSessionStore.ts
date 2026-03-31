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

export const useSessionStore = create<SessionStore>()(
  persist(
    (set, get) => ({
      tier: 'beginner',
      emState: BASE_EM_STATE,
      frame: defaultFrame,
      observerMode: 'rest',
      completedPhases: [],
      setTier: (tier) => {
        set({ tier });
        trackEvent('tier_changed', { tier });
      },
      setEMState: (state) => set({ emState: state }),
      patchFrame: (patch) => set({ frame: { ...get().frame, ...patch } }),
      setObserverMode: (mode) => {
        set({ observerMode: mode });
        trackEvent('observer_changed', { mode });
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
