# Borrow & Carry — design (2026-07-14)

## Why this app exists

Aoife (~7) is intuitively strong at mental arithmetic — she can *guess* 43 − 17
correctly. But school tests now demand the **written column algorithm** (stacked
digits, borrowing/regrouping, carrying), and on a Continual Assessment she lost
marks on a "write the missing digits" problem (8□□ − 34 = □77) because she has
never been taught **how the column system works**. This app teaches the
*technique*, not the arithmetic.

## What it is

A sibling of `aoife-math` (operation drills) and `aoife-frameworks` (reasoning
scripts). Same stack — **Next.js 16 + React 19 + Tailwind v4, static, Vercel,
localStorage progress, pink/purple Bubblegum Sans** — and the same proven
5-pill ladder per level: 👀 Watch → 🤝 Together → 🧭 Lead → 🦋 Solo → 🔁 Practice
(five in a row). The engine is copied from `aoife-frameworks` with ONE extension.

## The one new mechanic: a live column figure

Every problem renders a `columns` figure — the vertical tower (H/T/O column
letters, top number, operator + bottom number, line, answer boxes). Each step
carries an optional `figState` snapshot; **when a step is answered the figure
advances**: the 4 gets crossed out and a little 3 appears above it, the 3 in the
ones grows a small borrowed 1 to become 13, a little +1 lands in the carry row,
answer digits fill their boxes. Design law (inherited from the Time & Clocks
redesign): **see it happen — never memorize it.**

Solo and Practice show the *bare* figure (no work marks) — test conditions.

## The 8 levels (one ladder, 3 families)

➖ Taking Away
1. 🧱 **Stack It Up** — single digits (9 − 4). Which number goes on top, where
   the answer lives.
2. 🐣 **Ones First** — 2-digit, no borrowing (47 − 23). Always start at the
   ones (right side), one column at a time.
3. 🏠 **Borrow from Next Door** — 2-digit WITH borrowing (43 − 17). The heart:
   "can you take 7 from 3? No → borrow 1 ten, the 4 becomes 3, the 3 becomes 13."
4. 🎈 **Big Number Borrow** — 3-digit, exactly one borrow (random column).
5. 🎢 **Double Borrow** — 3-digit, borrows in ones AND tens. (No
   borrow-across-zero — middle digits are generated non-zero. Deliberate scope cut.)

➕ Adding Up
6. 🎒 **Carry the One** — 2-digit addition, ones carry (47 + 38). "15 doesn't
   fit in one box → write the 5, carry the 1."
7. 🚚 **Big Carry** — 3-digit addition, 1–2 carries, sum ≤ 999.

🕵️ Missing Digits
8. 🕵️ **Missing Digit Detective** — the exact test format: 3-digit − 2-digit
   with three hidden digits (top tens, top ones, answer hundreds). Taught via the
   detective trick **answer + bottom = top**: add up column by column (reusing
   levels 6–7 carrying) and each box reveals itself. Unique solution guaranteed
   by construction. Solo = fill the three boxes, exactly like the test.

Home page: one ladder with Level badges and a "⭐ start here" ring on the first
un-soloed level (nothing locked), mirroring the Time & Clocks chapter UI.

## Step scripts (Together asks these; Lead makes her pick them)

Scripts are built from shared step factories (`lib/levels/shared.ts`):
- "Which column do we start with?" (choice — Ones; decoys push tens-first)
- "Can you take B from A?" (choice — the wrong choice is the classic error
  "Yes — just do 7 − 3", i.e. subtracting the smaller digit regardless of order)
- borrow pair: "what does the 4 become?" (cross-out) + "what do the ones
  become?" (13)
- per-column subtract/add steps ("13 − 7 = ?")
- carry choice ("write the 5, carry the 1 ten")
- final "Read the answer!" step (contract: last step's answer is a final answer)

All choice steps shuffle their options with the seeded rng (no fixed-position
pattern-matching). Hints never state the answer.

## Generator contract (self-test, 500 seeds × 8 levels — same regime as siblings)

1. Numeric step answers are non-negative integers.
2. Every step: ≥2 decoyQuestions (≠ its ask), non-empty hint.
3. Choice steps: ≥2 choices, exactly one correct, options rng-shuffled.
4. finalAnswers are non-negative ints, each reached by a numeric step, and the
   last step's answer is a final answer.
5. "What is A op B?" decoys never evaluate to any step answer or final answer.
6. `invariant(data)` holds (per-level regrouping constraints, e.g. level 3 MUST
   need a borrow, level 2 MUST NOT; no leading-zero answers).
7. Figure timeline sanity: the last figState's answer digits equal the true
   answer; cross/bump/carry marks agree with the arithmetic.

## Engine deltas vs aoife-frameworks (everything else untouched)

- `Step.figState?: ColumnsState` — figure snapshot after the step completes.
- `StageRunner` gains `onStep(completedCount)`; `StageEngine` holds a
  `stepsDone` counter and renders `figureAt(problem, stepsDone)`.
- `rich.tsx` chips removed (no time tokens here) — plain text.
- Deleted clock/day-line inputs and all sibling figure kinds; one figure:
  `ColumnStack`.
- Progress key: `aoife-columns-progress`.

## Not building (YAGNI)

No timer, no audio, no accounts, no backend, no borrow-across-zero (yet), no
4-digit numbers, no mixed ± quizzes — `aoife-math` already drills facts.

## Deploy

Public repo `jalalchowdhury1/aoife-columns`, Vercel CLI `vercel --prod`
(GitHub auto-deploy not linked, same as siblings), site `aoife-columns.vercel.app`.
