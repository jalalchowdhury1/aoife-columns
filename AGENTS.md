# AGENTS.md — Borrow & Carry (aoife-columns)

> **Single source of truth for anyone (human or AI) touching this repo.** Read it fully
> before changing code or "fixing" anything. If something here is wrong, fix *this* file.
> README.md is Jalal's plain-English doc — leave it alone unless asked.

The third sibling in Aoife's set: `aoife-math` drills operations, `aoife-frameworks`
teaches word-problem reasoning, and **this app teaches the written COLUMN algorithm** —
stacked digits, borrowing (regrouping) and carrying. It exists because Aoife (~7) can do
3-digit subtraction intuitively in her head but lost marks on a school Continual
Assessment "write the missing digits" problem (8□□ − 34 = □77): she'd never been taught
how the written system works. The arithmetic is never the challenge — the *technique* is.

There is **no backend, no database, no API, no auth, no accounts, no timer**. Static
client-side site; progress lives in `localStorage["aoife-columns-progress"]`.

---

## 1. What this is

**Next.js 16 (App Router) + React 19 + Tailwind v4**, static, deploys to **Vercel**
(`aoife-columns.vercel.app`). Same pink/purple **Bubblegum Sans** look and the same
5-pill ladder as `aoife-frameworks`: **👀 Watch → 🤝 Together → 🧭 Lead → 🦋 Solo**
+ **🔁 Practice** (five Solo problems in a row, ⭐/✅ per problem). The engine
(`lib/engine/`) is a copy of the sibling's with ONE extension (§3).

**9 levels** (`lib/levels/`), one ladder, 3 families on the home grid:

| # | id | teaches |
|---|----|---------|
| 1 | `stack-it-up` | tower layout: who's on top, answer under the line (1-digit) |
| 2 | `ones-first` | one column at a time, ALWAYS start at the ones (2-digit, no borrow) |
| 3 | `borrow-next-door` | THE lesson: cross out the ten, ones become 1x (2-digit borrow) |
| 4 | `big-borrow` | 3-digit, exactly one borrow, random column — she must LOOK |
| 5 | `double-borrow` | 3-digit, borrows in ones AND tens (tens crossed out twice) |
| 6 | `carry-the-one` | 2-digit addition, ones overflow → write digit, carry the 1 |
| 7 | `big-carry` | 3-digit addition, 1–2 carries |
| 8 | `detective-school` | missing-digits on-ramp: 2-digit, NO carrying — the flip-to-adding trick alone |
| 9 | `missing-digits` | the actual test format: 3 hidden digits, both columns carry, full check-adding |

Home page: "⭐ start here" ring on the first level without a solo pass. Nothing locked.

## 2. Architecture — how a level works

Identical `Framework` contract to the sibling (`lib/types.ts`): each level exports
`{ id, title, emoji, family, blurb, generate(rng), invariant(data) }`. `generate`
returns a `Problem` with `promptText`, a `columns` figure, ordered `steps` (each an
ask + answer + hint + decoyQuestions for Lead), `finalAsk`, `finalAnswers`, `data`.

Step scripts are assembled from **shared factories** (`lib/levels/shared.ts`):
`startColStep`, `checkTakeStep` ("can you take b from a?" — the wrong "yes" is the
classic subtract-smaller-from-bigger error), `borrowStep`, `bumpStep`, `subStep`,
`addStep`, `readStep`. Change wording THERE, not in level files, so every level speaks
the same language.

## 3. The live column figure (the one engine extension — DO NOT BREAK)

`Problem.figure` is a `ColumnsSpec` (`lib/columns.ts`) rendered by
`lib/figures/ColumnStack.tsx`. Each step may carry `figState: ColumnsState` — a
**cumulative snapshot** of the written work after that step (crossed-out digits,
little borrowed 1s, +1 carries, filled answer boxes, glowing active column, revealed
detective boxes). `StageRunner` reports completed-step count via `onStep`;
`StageEngine` renders `figureAt(problem, stepsDone)`. **Solo and Practice always show
the bare initial figure** — test conditions, no work marks.

- Snapshots are built with `snapper()` (shared.ts) which deep-clones on every call —
  never share state objects between steps.
- `cross[col]` semantics: value `=== 10 + original digit` → little 1 in front, no
  strike (a borrow LANDED); anything else → original struck, value written above (it
  LENT one). Level 5's tens column relies on the second form after the first.
- Design law (inherited from the sibling's Time & Clocks): **see it happen, never
  memorize it** — the cross-out appears the moment she answers the borrow step.

## 4. The generator contract (self-test — DO NOT BREAK)

`lib/levels/levels.test.ts` runs every level across **500 seeds** and asserts:
numeric answers are non-negative ints; every step has ≥2 decoys (≠ its ask) + a hint;
choice steps have exactly one correct option; "What is A op B?" decoys never evaluate
to a live answer; each finalAnswer is reached by a numeric step and the last step's
answer IS a final answer; `invariant(data)` holds; the finished figure timeline shows
the true answer digits (or, for level 8, the true hidden digits); and a
constant-valued choice answer must not sit at a constant position (all choice arrays
are `rng.shuffle`d — keep it that way).

**Keep the numbers clean.** Generation is constructive (no rejection loops): ranges
are chosen so borrows/carries happen exactly where the level teaches them, answers
never get leading zeros, level 5 never borrows across a zero (deliberate scope cut —
if Jalal wants borrow-across-zero, it's a NEW level 5b, don't loosen level 5), and
level 8 always has both carries (same shape as the real test problem, uniquely
solvable by construction).

## 5. Repo layout

```
app/page.tsx            — home grid (8 tiles, 3 families, start-here ring) + parent peek (5 taps on title)
app/f/[id]/page.tsx     — level screen; mounts <StageEngine>
app/globals.css         — Tailwind v4 theme (pink/purple, Bubblegum Sans)
lib/types.ts            — Framework / Problem / Step / Stage
lib/columns.ts          — ColumnsSpec/ColumnsState + digitsOf/figureAt
lib/rng.ts              — seedable RNG (deterministic generators)
lib/progress.ts         — localStorage progress (key: aoife-columns-progress)
lib/engine/             — StageEngine, StageRunner, PracticeRunner, Numpad, ChoicePad, confetti, rich (plain-text seam)
lib/figures/ColumnStack.tsx — the ONLY figure
lib/levels/<id>.ts      — one level each; shared.ts = step factories
lib/levels/index.ts     — LEVELS ladder + FAMILIES + LEVEL_NUM + byId()
lib/levels/levels.test.ts — the 500-seed self-test harness
docs/superpowers/       — design spec
```

`npm run dev` / `npm run build` / `npm run lint` / `npm test` (Vitest). No env vars, no secrets.

## 6. Gotchas

- **Never commit `node_modules` or npm caches** (an old sibling repo once committed a
  469MB cache). `.gitignore` covers them.
- **Jalal's global npm cache has root-owned files** (`sudo chown -R 501:20 ~/.npm`
  fixes it, needs his password). Until then `npm install` fails EEXIST locally —
  workaround used at build time: copy `node_modules` from `aoife-frameworks` (same
  lockfile). CI/Vercel are unaffected.
- **No CDN runtime deps.** `canvas-confetti` is bundled from npm behind
  `lib/engine/confetti.ts` — do not reintroduce a CDN `<script>`.
- **Vercel deploy:** GitHub auto-deploy is NOT linked — deploy with `vercel --prod`
  from the repo root (account `jalalchowdhury-8053`).
- Never call `Date.now()` / `new Date()` / `Math.random()` during render — eslint
  `react-hooks/purity` fails. Event handlers/effects only (seeds come from
  `randomSeed()` in effects).
- Adding/removing a level: update `lib/levels/index.ts` AND the count assertion in
  `levels.test.ts` together. Register in ladder order — `LEVEL_NUM` and "start here"
  derive from array position.
- **Decoy hygiene** (inherited): never use another step's taught question as a decoy;
  hints must never state the answer verbatim.
- 🔁 Practice is a sibling `mode` in StageEngine, NOT a 5th member of `STAGES` — do
  not fold it into the stage array (it would change progress semantics).
