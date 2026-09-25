# YouAreUnstoppable — Experience

The product is specified and not built yet. `src/App.tsx` is still the Vite starter. This file is the screen and feeling spec. Read it before changing UI.

Build instructions live in [implementation.md](implementation.md).

## Core idea

The fundamental unit is a **day**, not a habit.

> Every day you show up, you add another block to the person you're becoming.

> Every day you show up is another vote for the person you're becoming.

The user gets a small set of commitments each day. Showing up and completing enough of them turns that day into a filled block in their transformation grid. Over time the grid is a visual record of their life.

```text
PLAN → SHOW UP → COMPLETE → FILL THE BLOCK → BUILD THE STREAK → SEE YOUR TRANSFORMATION
```

The emotional payoff:

- "I don't want to lose my streak."
- "I want to fill this grid."
- "I want to look back one year from now and see an entire year of showing up."

The app should feel addictive to check, visually satisfying, premium, motivational, slightly cinematic, minimal, modern, and progress-oriented. The references are the feeling of a contribution graph, a fitness streak, and game progression. The design itself is original.

Someone should be able to screenshot the Journey screen and immediately understand: this person has been showing up.

## What this product is not

Today is not a list labeled Habit 1, Habit 2, Habit 3, Habit 4.

The user sees **DAY 187**, then "Today is another chance to prove it.", then their commitments. After they complete the day, **DAY COMPLETE** appears and that day is permanently added to the grid. The grid is the visual proof of consistency.

Keep out:

- Childish gamification and cartoon graphics
- Excessive emojis
- Generic productivity dashboards
- Excessive cards
- Complicated charts
- Corporate SaaS styling

Keep out of the copy:

- "Great job!"
- "You've completed your habits!"

## Voice

Use short, strong language.

- Show up.
- Keep the promise.
- Another vote for who you're becoming.
- Don't break the chain.
- You said you'd do it.
- Day complete.
- Keep going.
- You're becoming someone different.
- The person you want to become is built today.

## Design system

| Role | Value | Use |
| --- | --- | --- |
| Background | `#0F0E17` | Full-screen ground |
| Primary text | `#FFFFFE` | Headlines and body |
| Accent | `#FF8906` | Completed days, streaks, important CTAs, progress, highlights |

Incomplete days use a very subtle dark gray. Empty space should feel dark and quiet. Completed blocks should read as light against that ground.

Typography:

- Modern bold sans-serif
- Strong oversized headlines
- Compact secondary text
- Generous spacing

Motion is subtle. When a user completes a day, the block fills with a satisfying animation. The UI should feel premium and slightly cinematic.

## Navigation

Bottom navigation:

1. **Today** — default screen
2. **Journey** — the main visual experience
3. **Journal**
4. **Profile**

Sign-in, create account, and the day-completion moment are full-screen and sit outside this bar.

## Screens

### 1. Sign in, then create account

The first screen is sign-in. **Create an account** at the bottom opens the create-account screen. **I already have an account** returns to sign-in. Each screen names itself once, above the headline.

Sign-in headline: **Show up.** Create-account headline: **Start my transformation.**

### 2. Define yourself

Headline:

> Who are you becoming?

Subheadline:

> Don't choose goals.
> Choose the person you want to become.

Selectable chips, multiple allowed:

- Disciplined
- Strong
- Focused
- Confident
- Healthy
- Successful
- Creative
- Fearless

CTA: **Continue →**

### 3. Future self

Headline:

> Describe the person you're becoming.

Large text area. Placeholder:

> "I want to become someone who…"

Example the field can offer:

> I want to become disciplined, physically strong, financially independent and confident. I want to stop procrastinating and start doing what I know I'm capable of.

CTA: **Create my transformation →**

### 4. Transformation reveal

This screen should feel visually powerful.

Header: **THIS IS WHO YOU'RE BECOMING**

Large statement, built from the traits the user chose. The prototype default is:

> Disciplined. Strong. Focused. Unstoppable.

Four identity pillars:

**DISCIPLINE** — Keep promises to yourself.

**STRENGTH** — Build a body you're proud of.

**FOCUS** — Do meaningful work every day.

**GROWTH** — Become better than yesterday.

Then:

> Your transformation starts today.

CTA: **Let's begin →**

### 5. Today

The most important daily screen.

Header: **DAY 187**

Small text: **September 21, 2026**

Large statement:

> Today is another chance to prove it.

**TODAY'S COMMITMENTS** — four items:

| | Title | Detail |
| --- | --- | --- |
| 01 | TRAIN | 45 min workout |
| 02 | BUILD | 60 min focused work |
| 03 | LEARN | Read 20 pages |
| 04 | DISCIPLINE | No phone for the first 30 minutes |

Each row has a **Complete** control. Completing one:

- Animates the checkbox
- Slightly glows the item
- Updates the progress count
- Can show: **Another vote for the person you're becoming.**

### 6. Day progress

At the bottom of Today:

**TODAY**

**3 / 4 commitments**

Large progress indicator.

When every required commitment is complete, the screen transforms:

# DAY COMPLETE

> You showed up.

A large animated block appears.

> Day 187 added to your journey.

CTA: **See my journey →**

This moment should feel rewarding.

### 7. Journey grid

The hero feature. A full-screen transformation history.

Header: **YOUR JOURNEY**

Subheading:

> 187 days of becoming.

About 365 small square elements, one per day. Organize them by weeks and months so a year reads as a sequence of blocks, in the spirit of a contribution graph, with an original layout.

Intensity levels, rendered as squares, not text characters:

| State | Weight |
| --- | --- |
| Empty | Barely there |
| Started | A mark |
| Completed | A solid orange block |
| Exceptional | The strongest orange block |

Completed days use `#FF8906`. Incomplete days stay extremely subtle. The feeling is: "I've actually been showing up."

### 8. Day sheet

The grid is interactive. Tapping a completed day opens a bottom sheet.

Example:

**SEPTEMBER 18**

**DAY COMPLETE**

**4 / 4 commitments**

- Workout
- Deep work
- Reading
- Morning routine

Journal:

> "Felt tired today but still trained."

Small text:

> Another vote for who you're becoming.

Button: **Close**

### 9. Progress

On the Journey screen, above or below the grid. Large type. Personal, not an analytics dashboard.

**YOUR PROGRESS**

| Figure | Label |
| --- | --- |
| 187 | Days completed |
| 23 | Current streak |
| 41 | Longest streak |
| 87% | Commitments completed |
| 73% | Days shown up |

### 10. Streak

A dedicated streak component.

Large: **23**

**DAY STREAK**

> 23 days of keeping promises to yourself.

> Your longest streak is 41 days.

A horizontal timeline of the last 14 days. Each day is a small square. The current streak connects visually.

CTA: **Keep going →**

### 11. Evening check-in

Shown at the end of the day.

# DID YOU SHOW UP?

Display today's commitments.

**How did today feel?**

- Difficult
- Okay
- Good
- Powerful

**What did today teach you?**

Text input placeholder:

> "Today I realized…"

CTA: **Complete my day →**

### 12. Day completion animation

After the evening check-in, a dark screen.

A single empty square appears, then fills with orange.

# DAY 187

**COMPLETE**

> You showed up.

> Every day you show up makes the next version of you more real.

**23 DAY STREAK**

CTA: **See my journey →**

That CTA opens the Journey grid and highlights the newly completed day.

### 13. Milestones

Subtle markers along the Journey:

| Day | Line |
| --- | --- |
| 1 | The beginning. |
| 7 | You started building consistency. |
| 30 | You're becoming someone different. |
| 90 | This is no longer just motivation. |
| 180 | You built a lifestyle. |
| 365 | One year of showing up. |

### 14. Coach

The coach supports the transformation. It is not the main feature and it is not a generic chat screen.

Header: **YOUR COACH**

Example:

> You completed 6 of your last 7 days.
>
> Your consistency is strongest when you train in the morning.
>
> Tomorrow, I recommend making your workout your first commitment.

Quick actions:

- Plan tomorrow
- I'm procrastinating
- I'm losing motivation
- Review my progress

Advice uses the user's transformation and previous behavior.

### 15. Journal

Header: **YOUR THOUGHTS**

A timeline of entries connected to completed days.

**September 21**

> "I didn't feel like training today but I went anyway."

**September 19**

> "Had a terrible day but still completed my work."

**September 15**

> "Starting to feel like I'm actually changing."

### 16. Profile

Header: **YOUR IDENTITY**

> "I am becoming someone who keeps promises to himself."

| | |
| --- | --- |
| Transformation started | March 18, 2026 |
| Days completed | 187 |
| Current streak | 23 days |
| Longest streak | 41 days |

**I'M BECOMING**

Disciplined, Strong, Focused, Confident.

Settings sit below.

### 17. Free and Pro

The free product stays genuinely useful.

**FREE**

- Define who you're becoming
- Daily commitments
- Daily completion
- Current streak
- Monthly journey grid
- Basic journal
- 7-day history
- Limited AI coaching

**UNSTOPPABLE PRO**

> Don't just track your transformation.
>
> Build it.

- Full 365-day journey
- Unlimited history
- Personalized daily plans
- AI transformation coach
- Unlimited journal
- Weekly transformation reviews
- Advanced insights
- Multiple transformation areas
- Personalized challenges
- Custom commitments

Price: **$9.99 / month**

CTA: **Become Unstoppable →**

Secondary: **Continue with Free**

### 18. Share card

A card the user can eventually share:

> **187 DAYS**
>
> **OF BECOMING**
>
> 23 DAY STREAK
>
> **YOUAREUNSTOPPABLE**

The journey grid sits underneath the words.

## Prototype data

Use one fictional user so the prototype feels lived-in:

| Field | Value |
| --- | --- |
| Current day | 187 |
| Current streak | 23 days |
| Longest streak | 41 days |
| Days completed | 187 |
| Commitment completion | 87% |
| Transformation started | March 18, 2026 |
| Sample "today" date | September 21, 2026 |

Populate earlier days with a mix of completed, missed, strong, and exceptional days so the grid is beautiful rather than empty. The current day starts interactive and incomplete. It becomes a completed square only after the commitments and the evening check-in.

## Interaction checklist

The prototype has to support all of these:

1. Sign in, then create account
2. Identity selection
3. Future-self text input
4. Transformation generation
5. Today's commitments
6. Completing commitments
7. Dynamic daily progress
8. Day completion animation
9. Adding the completed day to the grid
10. Interactive 365-day grid
11. Tapping an individual day
12. Streak display from mock data
13. Evening check-in
14. Journal entry
15. Journey statistics
16. Coach mock interaction
17. Free to Pro paywall
18. Bottom navigation
19. Shareable transformation card
