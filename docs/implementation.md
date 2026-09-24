# YouAreUnstoppable — Frontend implementation

How to build the React app. Screen copy, feeling, and the interaction checklist live in [experience.md](experience.md). Follow that file for what the user sees. This file covers how to build it.

## Current state

The product is specified and not built. `src/App.tsx` is the Vite starter.

Installed today, from `package.json`:

- React 19
- TypeScript
- Vite 8
- oxlint

Planned, and not installed yet:

- React Router
- Tailwind CSS
- shadcn/ui
- Framer Motion
- Zustand

Do not describe those libraries as part of the running app until they are in `package.json`. Add one only when a screen needs it, then record it here and in the README.

## Build order

Ship a client-only, mobile-first prototype with mock data first.

The Today screen, the completion animation, and the Journey grid do not wait on the API. Wire the backend after that loop feels right: open the app, complete commitments, close the day, and see the new block in the grid.

## Target shape

Routes:

- `/` onboarding
- `/becoming` identity chips
- `/future-self` future-self text
- `/transformation` reveal
- `/today` daily screen
- `/check-in` evening check-in
- `/day-complete` completion animation
- `/journey` grid, stats, milestones, streak
- `/journal`
- `/profile`
- `/coach`
- `/pro` Free vs Pro

Shared pieces:

- Bottom navigation (Today, Journey, Journal, Profile)
- Commitment row
- Day progress
- Journey grid
- Day bottom sheet
- Streak
- Share card

State the prototype must hold:

- Selected identity chips
- Future-self text
- Today's commitment checks
- Check-in feeling and note
- Whether today has been added to the grid

Suggested layout once the starter is replaced:

```text
src/
├── components/
│   ├── BottomNav.tsx
│   ├── CommitmentRow.tsx
│   ├── DayProgress.tsx
│   ├── JourneyGrid.tsx
│   ├── DaySheet.tsx
│   ├── Streak.tsx
│   └── ShareCard.tsx
├── pages/
├── data/
│   └── prototype.ts
├── App.tsx
└── main.tsx
```

Names can change. The responsibilities should not: one place for mock history, one grid, one Today flow.

## Mock data

One module owns the fictional user from [experience.md](experience.md):

- Day 187, 23-day streak, 41-day longest streak
- 187 completed days, 87% commitment completion
- Transformation started March 18, 2026
- About 365 days mixing empty, started, completed, and exceptional
- Milestones, journal entries, and coach replies

Today is the only day the prototype mutates. Past days stay fixed so the grid looks settled. Completing the check-in sets today to completed and lets "See my journey" highlight that square.

Streak figures in the prototype come from this mock data. They are displayed, not recalculated from a server.

## Visual rules

Tokens:

```text
--bg: #0F0E17
--text: #FFFFFE
--accent: #FF8906
```

Day intensities:

| State | Treatment |
| --- | --- |
| Empty | Very subtle dark gray |
| Started | A light mark on the same dark ground |
| Completed | Solid `#FF8906` |
| Exceptional | Strongest orange, slightly brighter or larger presence |

Layout is mobile-first. On a wide desktop, keep the app in a phone-width frame on the dark background.

Grid cells are square elements, not text characters. Filling a completed day is an animation, not an instant color swap. "See my journey" navigates to the grid and highlights the new day.

## Guardrails

- Today opens on the day number and the line "Today is another chance to prove it.", then the commitments.
- The coach is a short insight plus four actions, not a chat transcript.
- Journey stats use large personal figures, not a dashboard of charts.
- Do not call API routes the backend does not have. The only live route today is `GET /api/hello`.
- Do not install a planned library until a screen needs it.

## Run

```bash
cd frontend
npm install
npm run dev
```

Vite serves `http://localhost:5173`.

Production build:

```bash
npm run build
npm run preview
```

Output goes to `dist/`.

Later, the API base URL uses the `VITE_` prefix:

```text
VITE_API_URL=http://localhost:8000
```

Put that in `.env.local`. Do not commit that file if it holds secrets.

Local API, once the backend is running:

```text
http://localhost:8000
```

The production target is Vercel for the frontend, with FastAPI and managed PostgreSQL added when the prototype loop is in place. Local development does not use Docker.
