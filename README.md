# EM Learning Lab (one shot by GPT 5.3 Codex Extra High)

Interactive website for teaching electromagnetic field representation and architecture tradeoffs.

Each architecture is implemented as a SimulatorAdapter with the same API (init, step, readState, readMetrics, runScenario) so they can be run fairly side-by-side: adapter.ts (line 3).

All four share the same base field evolution step (stepWave) and frame math (Lorentz + sinusoidal carrier), then apply architecture-specific encoding/update rules:

Base step: wave.ts (line 13)
Frame transform: relativity.ts (line 31)
Tensor mapping used by frame transform: tensor.ts (line 3)
How each architecture differs:

Binary: quantizes each EM component to signed fixed-point (SCALE=1000, int16 clamp), then requantizes every step; cycles are explicitly incremented (+6*4 per step).
Implementation: binary.ts (line 5)

Analog: keeps continuous values, then adds deterministic noise + heat drift via applyDrift(...) after each base step.
Implementation: analog.ts (line 44)

Ternary: encodes each component into balanced trits (-1,0,+1) using thresholds (>0.333, <-0.333), steps in trit space, then decodes back.
Implementation: ternary.ts (line 15)

Quantum (conceptual): advances phi/theta, builds a Bloch-style vector, and projects the wave state onto that orientation.
Implementation: quantum.ts (line 34)

And the compare page runs the same ComparisonScenario through each adapter for fairness:

Scenario construction + runs: ArchitectureComparePanel.tsx (line 41)
So this is a conceptual architecture simulation layer, not transistor/circuit-level emulation.

## Stack

- Next.js (App Router) + TypeScript
- React Three Fiber + Drei
- Zustand (persisted session/progress)
- Tailwind CSS
- MDX lesson pages
- Vitest + Testing Library + Playwright

## Routes

- `/` home
- `/guided` guided 4-phase curriculum
- `/explore` free sandbox mode
- `/compare` architecture side-by-side comparison
- `/about` project method
- `/lessons/*` MDX lesson notes

## Shared model

- `EMState6`: `ex, ey, ez, bx, by, bz`
- 4x4 tensor conversion and Lorentz boost utilities
- Common simulator adapter API for Binary/Analog/Ternary/Quantum

## Development

```bash
npm install
npm run dev
```

## Tests

```bash
npm run test
npm run test:e2e
```
