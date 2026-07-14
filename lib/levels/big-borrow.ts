// Level 4 — three digits, exactly ONE borrow (randomly in the ones or the
// tens). The check step now genuinely varies: she must LOOK at each column.
import type { Framework, Problem, Step } from "../types";
import type { Rng } from "../rng";
import { columnsFigure, digitsOf } from "../columns";
import { snapper, startColStep, checkTakeStep, borrowStep, bumpStep, subStep, readStep } from "./shared";

function generate(rng: Rng): Problem {
  const borrowAt = rng.pick([0, 1]); // ones or tens
  let o1: number, o2: number, t1: number, t2: number, h1: number, h2: number;
  if (borrowAt === 0) {
    o1 = rng.int(1, 8);
    o2 = rng.int(o1 + 1, 9);
    t1 = rng.int(1, 9);
    t2 = rng.int(0, t1 - 1); // after lending 1, tens don't need a second borrow
    h1 = rng.int(2, 9);
    h2 = rng.int(1, h1 - 1);
  } else {
    o1 = rng.int(1, 9);
    o2 = rng.int(1, o1);
    t1 = rng.int(0, 8);
    t2 = rng.int(t1 + 1, 9);
    h1 = rng.int(3, 9);
    h2 = rng.int(1, h1 - 2);
  }
  const top = h1 * 100 + t1 * 10 + o1;
  const bottom = h2 * 100 + t2 * 10 + o2;
  const ans = top - bottom;
  const snap = snapper();

  const steps: Step[] = [startColStep(rng, 3, snap({ glow: 0 }))];

  // ones column
  steps.push(checkTakeStep(rng, 0, o1, o2));
  if (borrowAt === 0) {
    steps.push(borrowStep(1, t1, snap({ cross: { 1: t1 - 1 } })));
    steps.push(bumpStep(0, o1, 1, snap({ cross: { 0: 10 + o1 } })));
    steps.push(subStep(0, 10 + o1, o2, snap({ ans: { 0: 10 + o1 - o2 }, glow: 1 })));
  } else {
    steps.push(subStep(0, o1, o2, snap({ ans: { 0: o1 - o2 }, glow: 1 })));
  }

  // tens column (its top digit may already have lent one away)
  const tEff = borrowAt === 0 ? t1 - 1 : t1;
  steps.push(checkTakeStep(rng, 1, tEff, t2, borrowAt === 0 ? { was: t1 } : undefined));
  if (borrowAt === 1) {
    steps.push(borrowStep(2, h1, snap({ cross: { 2: h1 - 1 } })));
    steps.push(bumpStep(1, t1, 2, snap({ cross: { 1: 10 + t1 } })));
    steps.push(subStep(1, 10 + t1, t2, snap({ ans: { 1: 10 + t1 - t2 }, glow: 2 })));
  } else {
    steps.push(subStep(1, tEff, t2, snap({ ans: { 1: tEff - t2 }, glow: 2 }), borrowAt === 0 ? ` — the ${t1} is now ${tEff}` : ""));
  }

  // hundreds column (never needs a borrow here)
  const hEff = borrowAt === 1 ? h1 - 1 : h1;
  steps.push(
    subStep(2, hEff, h2, snap({ ans: { 2: hEff - h2 }, glow: undefined }), borrowAt === 1 ? ` — the ${h1} is now ${hEff}` : ""),
  );
  steps.push(readStep("-", top, bottom, ans));

  return {
    promptText: `Three-digit tower: ${top} − ${bottom}. One column will need to borrow — which one?`,
    figure: columnsFigure("-", top, bottom),
    steps,
    finalAsk: `What is ${top} − ${bottom}?`,
    finalAnswers: [{ label: `${top} − ${bottom}`, value: ans }],
    data: { top, bottom, ans },
  };
}

export const bigBorrow: Framework = {
  id: "big-borrow",
  title: "Big Number Borrow",
  emoji: "🎈",
  family: "➖ Taking Away",
  blurb: "Three digits, one borrow — spot which column needs it.",
  generate,
  invariant: (d) => {
    const [o1, t1] = digitsOf(d.top, 3);
    const [o2, t2] = digitsOf(d.bottom, 3);
    const borrowOnes = o1 < o2;
    const borrowTens = t1 - (borrowOnes ? 1 : 0) < t2;
    return d.ans === d.top - d.bottom && d.ans >= 100 && (borrowOnes !== borrowTens);
  },
};
