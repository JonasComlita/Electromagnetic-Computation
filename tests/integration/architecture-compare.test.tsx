import React from 'react';
import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ArchitectureComparePanel } from '@/components/simulations/ArchitectureComparePanel';
import { useSessionStore } from '@/lib/store/useSessionStore';
import { BASE_EM_STATE } from '@/lib/math/wave';

beforeEach(() => {
  useSessionStore.setState({
    tier: 'beginner',
    emState: BASE_EM_STATE,
    frame: { velocityVc: 0.3, frequency: 1.1, amplitude: 1, phaseOffset: 0 },
    observerMode: 'rest',
    completedPhases: []
  });
});

describe('architecture comparison flow', () => {
  it('renders result cards after running synchronized comparison', async () => {
    const user = userEvent.setup();
    render(<ArchitectureComparePanel />);

    await user.click(screen.getByRole('button', { name: 'Run synchronized comparison' }));

    expect(screen.getByText('Binary')).toBeInTheDocument();
    expect(screen.getByText('Analog')).toBeInTheDocument();
    expect(screen.getByText('Ternary')).toBeInTheDocument();
    expect(screen.getByText('Quantum')).toBeInTheDocument();
  });
});
