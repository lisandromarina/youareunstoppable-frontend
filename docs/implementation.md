# YouAreUnstoppable — Frontend implementation

How to build the React app. Screen copy, feeling, and the interaction checklist live in [experience.md](experience.md). Follow that file for what the user sees. This file covers how to build it.

## Current state

Sign-in is live. The day, the grid, the journal, and the coach are still shells. Identity choices stay in memory for this browser. They are not on the API yet.

Installed today, from `package.json`:

- React 19
- TypeScript
- Vite 8
- oxlint
- React Router
- Zustand
- Tailwind CSS
- shadcn/ui

Planned, and not installed yet:

- Framer Motion

Do not describe Framer Motion as part of the running app until it is in `package.json`. Add it only when a screen needs it, then record it here and in the README.

## Build order

Ship a client-only, mobile-first prototype with mock data first.

The Today screen, the completion animation, and the Journey grid do not wait on the API. Wire those after that loop feels right: open the app, complete commitments, close the day, and see the new block in the grid.

## Session

Why these choices were made is in [auth-decisions.md](auth-decisions.md).

The browser never reads the auth cookies. `src/api/client.ts` calls relative `/api/...` with `credentials: "include"`. Vite proxies `/api` to `http://localhost:8000`, so both cookies stay on the app origin. The refresh cookie path is still `/api/auth`.

`src/session/store.ts` holds `unknown`, `anonymous`, or `authenticated`, plus the user from the API. Boot calls `GET /api/me`. A `401` refreshes once through `POST /api/auth/refresh`. Parallel `401`s share that refresh. Login and Google do not refresh, because their `401` means the credential was rejected.

`/` is sign-in. **Create an account** opens `/register`. Register continues to `/becoming`. Sign-in opens `/today`. `/sign-in` opens `/`. A signed-in visit to `/` or `/register` opens `/today`. Routes from `/becoming` through `/pro` wait until the session is authenticated. While the session is still unknown, the screen stays on `#0F0E17`.

Google sign-in posts an ID token to `POST /api/auth/google`. Set `GOOGLE_CLIENT_ID` in `.env.local` to the same value as the API's `GOOGLE_CLIENT_ID`. Vite exposes that name to the sign-in screen. When it is unset, the Google control is hidden.

Profile shows the email and plan from `GET /api/me`. `has_password` is false for a Google-only account, and that account can set a password once. Sign out calls `POST /api/auth/logout`.

Chosen traits and the future-self text live in `src/data/identity.ts` for this browser only. A new device does not restore them.

The app and the API have to share a site in production. These cookies are `SameSite=Lax`.

## Target shape

Routes:

- `/` sign-in
- `/register` create account
- `/sign-in` opens `/`
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
├── api/
│   └── client.ts
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
│   ├── identity.ts
│   └── prototype.ts
├── session/
│   └── store.ts
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

Layout is mobile-first and fills the browser. Type, spacing, and columns grow with the viewport. There is no phone-width frame. shadcn/ui components live in `src/components/ui`, themed with the tokens above. On small screens the primary navigation sits on the bottom. From the `md` breakpoint up it sits across the top.

Grid cells are square elements, not text characters. Filling a completed day is an animation, not an instant color swap. "See my journey" navigates to the grid and highlights the new day.

## Guardrails

- Today opens on the day number and the line "Today is another chance to prove it.", then the commitments.
- The coach is a short insight plus four actions, not a chat transcript.
- Journey stats use large personal figures, not a dashboard of charts.
- Auth calls are register, login, Google, set password, refresh, logout, and `GET /api/me`. Do not call Checkout, the billing portal, or other routes the backend does not have. `GET /api/hello` is also live. **Become Unstoppable** does not call Stripe.
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

Local API requests go to `/api` on the Vite origin. The dev server proxies them to `http://localhost:8000`. Do not point the browser at that host for auth. The cookies would be set on a different origin.

Google sign-in, when used:

```text
GOOGLE_CLIENT_ID=
```

Put that in `.env.local`. Do not commit that file if it holds secrets. The value has to match the API's `GOOGLE_CLIENT_ID`.

The production target is Vercel for the frontend, with FastAPI and managed PostgreSQL on the same site so `SameSite=Lax` cookies are sent. Local development does not use Docker.
