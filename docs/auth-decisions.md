# Frontend authentication decisions

This slice puts a session in front of the app. Days, the journal, the coach, and Stripe stay out. The API that issues the session is recorded in [the backend auth decisions](../../backend/docs/auth-decisions.md) and [the API](../../backend/docs/api.md). Each section here records the problem, the choice, why that choice was made, and what was left out.

## Session before the product screens

Someone has to have an account before the day, the grid, or a subscription can belong to them.

Sign-in, register, and sign-out are live. Today, Journey, Journal, the coach, the check-in, and the day-completion screen are shells. They render the screen's line and wait for the prototype loop. New accounts are `user` and `free`.

Left out: commitments, the journey grid, journal entries, coach replies, and any call that would change `plan` to `pro`.

## Cookies stay on the app origin

The API sets two HttpOnly cookies and does not put the tokens in JSON. Page script cannot read them. `SameSite` is `Lax`, which only sends those cookies when the app and the API share a site.

The Vite dev server and the API are different ports, so they are different origins. The backend has no CORS middleware. Calling `http://localhost:8000` from `http://localhost:5173` would drop the cookies.

`frontend/vite.config.ts` proxies `/api` to `http://localhost:8000` for `vite dev` and `vite preview`. The client calls relative `/api/...` with `credentials: "include"`. The browser stores both cookies on the Vite origin. The refresh cookie path stays `/api/auth`, which the proxy still matches.

Production has the same rule. The Vercel app and the API have to share a site. A frontend and an API on two different registrable domains will not send these `Lax` cookies on `fetch`.

Left out: CORS on the API, `VITE_API_URL` pointing the browser at port 8000, and `SameSite=None`.

## The client never stores the tokens

The screen needs the person and their plan. It does not need the access token or the refresh token.

`src/session/store.ts` is the only session store. It holds `status` (`unknown`, `anonymous`, or `authenticated`) and the user object from the API. Boot calls `GET /api/me`. A `200` marks the session authenticated. A `401` calls `POST /api/auth/refresh` once. A failed refresh clears the user and leaves the person anonymous. A `403` whose message is `This account is closed.` clears the user and shows that sentence.

Refresh tokens rotate. Parallel `401`s share one in-flight refresh in `src/api/client.ts`. The refresh call itself does not refresh again.

Login, Google, and register also return `401` when the credential is rejected. Those three routes, and refresh, skip the automatic refresh. Refreshing them would hide `Email or password is incorrect.` and could rotate a session the person has not entered. Every other `401` waits for that shared refresh and retries the original call once.

Validation failures are FastAPI's `422` `detail` list. Auth failures are a string `detail`. The screen shows that string.

Left out: tokens in Zustand, `localStorage`, or component state. A password-reset link. A second refresh after the shared one fails.

## Where register and sign-in go

Onboarding is the front door. A new person and a returning person leave it on different paths.

`/` is the onboarding screen from [experience.md](experience.md), full screen, outside the bottom bar. **Start my transformation** opens `/register`. **I already have an account** opens `/sign-in`. Register continues to `/becoming`. Sign-in opens `/today`. Routes from `/becoming` through `/pro` render only when `status` is `authenticated`. While `status` is `unknown`, the screen stays on `#0F0E17` so onboarding does not flash.

A signed-in visit to `/`, `/register`, or `/sign-in` opens `/today`. That check remembers the status from the moment the session first became known. A register that has just succeeded can still navigate to `/becoming`. If the guard treated every authenticated render as "already signed in," it would send that new account to Today and skip identity.

The API does not say whether Google created the row or signed an existing one in. The screen they used decides the next route. Google on register continues into onboarding. Google on sign-in opens Today.

Left out: a created-versus-returning flag on `POST /api/auth/google`. Sending every signed-in person through identity again.

## Google ID token, hidden when it is not configured

The API verifies a Google ID token. It does not run the browser redirect itself.

The register and sign-in screens load Google Identity Services and post `{ "id_token" }` to `POST /api/auth/google`. The frontend `GOOGLE_CLIENT_ID` has to equal the API's `GOOGLE_CLIENT_ID`. Vite exposes that name so the Google button can use it. When that value is unset, the Google control is hidden, so the screen never hits `Google sign-in is not configured.`

Left out: the authorization-code redirect, and a client secret in the frontend.

## Identity stays in this browser

The account exists before the person describes who they are becoming. The API does not store traits or the future-self text yet.

`src/data/identity.ts` keeps the selected chips and the future-self text in memory for this browser. Register continues through `/becoming`, `/future-self`, and `/transformation`, then **Let's begin** opens Today. A reload or a new device does not restore those words. Profile falls back to the prototype identity line until the person has typed one in this session.

Left out: `localStorage` for identity, and an API for traits or the future-self text.

## Profile shows the account, not the hash

The person needs to see who is signed in, whether they are Free or Pro, and how to leave.

Profile sits under the identity block. Email and plan come from `GET /api/me`. **Sign out** calls `POST /api/auth/logout`, clears the store, and returns to `/`.

The user response did not say whether a password was set, so Profile could not tell a Google-only account from one that already has a password. `has_password` is now on that response, computed from `password_hash is not None`. The hash is not returned. **Set a password** renders only when `has_password` is false. `POST /api/auth/password` still returns `204`, and `409` when a password already exists.

Left out: changing a password that is already set, deleting the account, and showing the hash.

## Free versus Pro stays a comparison

The paywall is part of the experience. Billing is not part of this slice.

`/pro` shows the Free and Unstoppable Pro lists and the `$9.99 / month` price from [experience.md](experience.md). **Continue with Free** returns to Today. **Become Unstoppable** does not call Stripe, Checkout, or the billing portal. The plan on the account stays `free`.

Left out: a card form, a Checkout session, and any control that writes `pro`.

## shadcn, full screen

The screens have to feel like the product on a phone and on a desktop, using the same component set.

Tailwind CSS and shadcn/ui are installed. Buttons, inputs, text areas, and labels come from `src/components/ui`. The theme in `src/index.css` uses `#0F0E17`, `#FFFFFE`, and `#FF8906`. The app fills the viewport. On small screens the four destinations sit on the bottom. From the medium breakpoint up they sit across the top, and the screens use the width with larger type and two columns where the copy has two parts.

Left out: Framer Motion, and a phone-width frame on desktop.
