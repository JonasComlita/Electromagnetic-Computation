import React from 'react';
import { beforeEach, describe, expect, it } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TierToggle } from '@/components/layout/TierToggle';
import { ProgressOverview } from '@/components/layout/ProgressOverview';
import { useSessionStore } from '@/lib/store/useSessionStore';
import { BASE_EM_STATE } from '@/lib/math/wave';

function resetStore(): void {
  useSessionStore.setState({
    tier: 'beginner',
    emState: BASE_EM_STATE,
    frame: { velocityVc: 0, frequency: 1, amplitude: 1, phaseOffset: 0 },
    observerMode: 'rest',
    completedPhases: []
  });

  const storeWithPersist = useSessionStore as unknown as { persist?: { clearStorage?: () => void } };
  storeWithPersist.persist?.clearStorage?.();
}

describe('tier toggle and progress integration', () => {
  beforeEach(() => {
    resetStore();
  });

  it('changes tier from beginner to advanced', async () => {
    const user = userEvent.setup();
    render(<TierToggle />);

    await user.click(screen.getByRole('button', { name: 'advanced' }));
    expect(useSessionStore.getState().tier).toBe('advanced');
  });

  it('reflects completed phases in progress overview', () => {
    act(() => {
      useSessionStore.getState().toggleCompletedPhase(1);
      useSessionStore.getState().toggleCompletedPhase(3);
    });

    render(<ProgressOverview />);
    expect(screen.getByText('1. Field')).toBeInTheDocument();
    expect(screen.getByText('3. Matrix')).toBeInTheDocument();
  });
});
