# EM Learning Lab (one shot by GPT 5.3 Codex Extra High)

Interactive website for teaching electromagnetic field representation and architecture tradeoffs.

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
