import React from 'react';
import { beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { PhaseRelativityPanel } from '@/components/phases/PhaseRelativityPanel';
import { useSessionStore } from '@/lib/store/useSessionStore';
import { BASE_EM_STATE } from '@/lib/math/wave';

beforeEach(() => {
  useSessionStore.setState({
    tier: 'student',
    emState: BASE_EM_STATE,
    frame: { velocityVc: 0, frequency: 1, amplitude: 1, phaseOffset: 0 },
    observerMode: 'rest',
    completedPhases: []
  });
});

describe('relativity controls', () => {
  it('updates velocity from the slider', () => {
    render(<PhaseRelativityPanel />);

    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '0.55' } });

    expect(useSessionStore.getState().frame.velocityVc).toBeCloseTo(0.55, 2);
  });
});
