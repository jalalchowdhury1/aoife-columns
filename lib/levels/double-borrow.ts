// Level 5 — the boss: three digits, borrows in the ones AND the tens. The
// tens digit gets crossed out twice (it lends one, then borrows itself).
// Deliberate scope cut: no borrow-across-zero (the tens digit is ≥ 1).
import type { Framework, Problem } from "../types";
import type { Rng } from "../rng";
import { columnsFigure, digitsOf } from "../columns";
import { snapper, startColStep, checkTakeStep, borrowStep, bumpStep, subStep, readStep } from "./shared";

function generate(rng: Rng): Problem {
  const o1 = rng.int(1, 8);
  const o2 = rng.int(o1 + 1, 9); // ones borrow
  const t1 = rng.int(1, 9);
  const t2 = rng.int(Math.max(1, t1), 9); // after lending, tens are too small too
  const h1 = rng.int(3, 9);
  const h2 = rng.int(1, h1 - 2); // answer keeps a real hundreds digit
  const top = h1 * 100 + t1 * 10 + o1;
  const bottom = h2 * 100 + t2 * 10 + o2;
  const ans = top - bottom;
  const tEff = t1 - 1;
  const snap = snapper();

  return {
    promptText: `Boss level! ${top} − ${bottom}. TWO columns will run out — borrow twice!`,
    figure: columnsFigure("-", top, bottom),
    steps: [
      startColStep(rng, 3, snap({ glow: 0 })),
      checkTakeStep(rng, 0, o1, o2),
      borrowStep(1, t1, snap({ cross: { 1: tEff } })),
      bumpStep(0, o1, 1, snap({ cross: { 0: 10 + o1 } })),
      subStep(0, 10 + o1, o2, snap({ ans: { 0: 10 + o1 - o2 }, glow: 1 })),
      checkTakeStep(rng, 1, tEff, t2, { was: t1 }),
      borrowStep(2, h1, snap({ cross: { 2: h1 - 1 } })),
      bumpStep(1, tEff, 2, snap({ cross: { 1: 10 + tEff } })),
      subStep(1, 10 + tEff, t2, snap({ ans: { 1: 10 + tEff - t2 }, glow: 2 })),
      subStep(2, h1 - 1, h2, snap({ ans: { 2: h1 - 1 - h2 }, glow: undefined }), ` — the ${h1} is now ${h1 - 1}`),
      readStep("-", top, bottom, ans),
    ],
    finalAsk: `What is ${top} − ${bottom}?`,
    finalAnswers: [{ label: `${top} − ${bottom}`, value: ans }],
    data: { top, bottom, ans },
  };
}

export const doubleBorrow: Framework = {
  id: "double-borrow",
  title: "Double Borrow",
  emoji: "🎢",
  family: "➖ Taking Away",
  blurb: "The boss: ones AND tens both need to borrow.",
  generate,
  invariant: (d) => {
    const [o1, t1] = digitsOf(d.top, 3);
    const [o2, t2] = digitsOf(d.bottom, 3);
    return (
      d.ans === d.top - d.bottom &&
      d.ans >= 100 &&
      o1 < o2 && // ones borrow
      t1 >= 1 && // never borrow across a zero
      t1 - 1 < t2 // tens borrow after lending
    );
  },
};
