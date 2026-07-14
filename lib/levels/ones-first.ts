// Level 2 — two digits, NO borrowing. The rule being taught: work one column
// at a time, and ALWAYS start from the ones (the right side).
import type { Framework, Problem } from "../types";
import type { Rng } from "../rng";
import { columnsFigure } from "../columns";
import { snapper, startColStep, subStep, readStep } from "./shared";

function generate(rng: Rng): Problem {
  const o1 = rng.int(2, 9);
  const o2 = rng.int(1, o1); // ones never need a borrow here
  const t1 = rng.int(2, 9);
  const t2 = rng.int(1, t1 - 1); // answer keeps a real tens digit
  const top = t1 * 10 + o1;
  const bottom = t2 * 10 + o2;
  const ans = top - bottom;
  const snap = snapper();

  return {
    promptText: `Two-digit tower! Solve ${top} − ${bottom}, one column at a time.`,
    figure: columnsFigure("-", top, bottom),
    steps: [
      startColStep(rng, 2, snap({ glow: 0 })),
      subStep(0, o1, o2, snap({ ans: { 0: o1 - o2 }, glow: 1 })),
      subStep(1, t1, t2, snap({ ans: { 1: t1 - t2 }, glow: undefined })),
      readStep("-", top, bottom, ans),
    ],
    finalAsk: `What is ${top} − ${bottom}?`,
    finalAnswers: [{ label: `${top} − ${bottom}`, value: ans }],
    data: { top, bottom, ans },
  };
}

export const onesFirst: Framework = {
  id: "ones-first",
  title: "Ones First",
  emoji: "🐣",
  family: "➖ Taking Away",
  blurb: "Two columns, no tricks — just remember: ones first!",
  generate,
  invariant: (d) =>
    d.ans === d.top - d.bottom &&
    d.ans >= 10 &&
    d.top % 10 >= d.bottom % 10, // no borrow ever needed
};
