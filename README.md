# YouAreUnstoppable — Frontend

React frontend for the **YouAreUnstoppable** application.

The product is designed around one central idea:

> **Every day you show up, you add another block to the person you're becoming.**

The main experience revolves around daily commitments, day completion, streaks, and the visual transformation journey.

---

## Tech Stack

* React
* TypeScript
* Vite
* Node.js
* npm

Planned technologies:

* React Router
* Tailwind CSS
* shadcn/ui
* Framer Motion
* Zustand

---

## Requirements

Before starting the frontend, make sure you have installed:

* Node.js 20+
* npm
* Git

Check your installations:

```bash
node --version
```

```bash
npm --version
```

---

## Project Structure

```text
frontend/
├── public/
├── src/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── lib/
│   ├── App.tsx
│   └── main.tsx
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## Installation

### 1. Navigate to the frontend

```bash
cd frontend
```

### 2. Install dependencies

```bash
npm install
```

---

## Run the Development Server

```bash
npm run dev
```

Vite will provide a local URL, normally:

```text
http://localhost:5173
```

Open that URL in your browser.

---

## Build for Production

Create a production build:

```bash
npm run build
```

The generated files will be placed in:

```text
dist/
```

---

## Preview the Production Build

After running the build:

```bash
npm run preview
```

---

## Development

Vite automatically reloads the application when source files change.

Start the development server with:

```bash
npm run dev
```

Stop the server with:

```text
CTRL + C
```

---

## Backend Connection

During local development, the frontend communicates with the FastAPI backend.

Frontend:

```text
http://localhost:5173
```

Backend:

```text
http://localhost:8000
```

Example API request:

```text
GET http://localhost:8000/api/hello
```

The frontend can use:

```typescript
fetch("http://localhost:8000/api/hello")
```

---

## Environment Variables

Frontend environment variables should use the `VITE_` prefix.

Example:

```text
VITE_API_URL=http://localhost:8000
```

Create a local environment file:

```text
.env.local
```

Example:

```text
VITE_API_URL=http://localhost:8000
```

Do not commit `.env.local` if it contains sensitive information.

---

## Main Application Screens

The planned application navigation is:

```text
Today
Journey
Journal
Profile
```

### Today

The user's current day and commitments.

```text
DAY 187

Today is another chance to prove it.

01 — TRAIN
02 — BUILD
03 — LEARN
04 — DISCIPLINE
```

Completing the required commitments allows the user to complete the day.

---

### Journey

The main visual experience.

The Journey contains the user's transformation grid.

Each block represents one day.

```text
■ ■ ■ ■ ■ ■ ■
■ ■ ■ □ ■ ■ ■
■ ■ ■ ■ ■ ■ ■
■ ■ □ ■ ■ ■ ■
```

Completed days use the YouAreUnstoppable orange accent.

---

### Journal

A timeline of the user's thoughts and reflections.

Journal entries are connected to completed days.

---

### Profile

Contains the user's identity, transformation, statistics, and settings.

---

## Design System

### Colors

Background:

```text
#0F0E17
```

Primary text:

```text
#FFFFFE
```

Accent:

```text
#FF8906
```

The UI should remain:

* Minimal
* Premium
* Dark
* Cinematic
* Motivational
* Modern

Avoid generic productivity-app styling.

---

## Product Principle

YouAreUnstoppable is **not primarily a habit tracker**.

The fundamental unit is the **day**.

The core experience is:

```text
PLAN
  ↓
SHOW UP
  ↓
COMPLETE
  ↓
DAY COMPLETE
  ↓
ADD BLOCK
  ↓
SEE JOURNEY
  ↓
COME BACK TOMORROW
```

The Journey grid is the visual proof of the user's consistency.

---

## Future Features

Planned features include:

* Google authentication
* Personal transformations
* Daily commitments
* 365-day Journey
* Streaks
* Journal
* AI Coach
* Personalized daily plans
* Weekly transformation reviews
* Shareable transformation cards
* Free / Pro subscriptions
* Stripe payments

---

## Production Deployment

The frontend is intended to be deployed using **Vercel**.

The production architecture will eventually be:

```text
React
   ↓
Vercel

FastAPI
   ↓
Vercel

PostgreSQL
   ↓
Managed PostgreSQL provider
```

Local development does not require Docker.

---

## Development Philosophy

Build the core transformation experience first.

The primary loop is:

```text
Today
  ↓
Complete commitments
  ↓
Complete day
  ↓
Journey grid grows
  ↓
Return tomorrow
```

Everything else should support this loop.
