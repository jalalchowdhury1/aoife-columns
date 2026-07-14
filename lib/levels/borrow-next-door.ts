// Level 3 — THE lesson. Two digits where the ones don't have enough, so we
// borrow: cross out the tens digit, and the ones grow a little 1 in front.
import type { Framework, Problem } from "../types";
import type { Rng } from "../rng";
import { columnsFigure } from "../columns";
import { snapper, startColStep, checkTakeStep, borrowStep, bumpStep, subStep, readStep } from "./shared";

function generate(rng: Rng): Problem {
  const o1 = rng.int(1, 8);
  const o2 = rng.int(o1 + 1, 9); // ones MUST need a borrow
  const t1 = rng.int(3, 9);
  const t2 = rng.int(1, t1 - 2); // after lending 1, tens still leave a real digit
  const top = t1 * 10 + o1;
  const bottom = t2 * 10 + o2;
  const ans = top - bottom;
  const snap = snapper();

  return {
    promptText: `Uh oh — ${top} − ${bottom}. The ones don't have enough… time to learn borrowing!`,
    figure: columnsFigure("-", top, bottom),
    steps: [
      startColStep(rng, 2, snap({ glow: 0 })),
      checkTakeStep(rng, 0, o1, o2),
      borrowStep(1, t1, snap({ cross: { 1: t1 - 1 } })),
      bumpStep(0, o1, 1, snap({ cross: { 0: 10 + o1 } })),
      subStep(0, 10 + o1, o2, snap({ ans: { 0: 10 + o1 - o2 }, glow: 1 })),
      subStep(1, t1 - 1, t2, snap({ ans: { 1: t1 - 1 - t2 }, glow: undefined }), ` — remember, the ${t1} is now ${t1 - 1}`),
      readStep("-", top, bottom, ans),
    ],
    finalAsk: `What is ${top} − ${bottom}?`,
    finalAnswers: [{ label: `${top} − ${bottom}`, value: ans }],
    data: { top, bottom, ans },
  };
}

export const borrowNextDoor: Framework = {
  id: "borrow-next-door",
  title: "Borrow from Next Door",
  emoji: "🏠",
  family: "➖ Taking Away",
  blurb: "Not enough ones? Knock next door and borrow a ten!",
  generate,
  invariant: (d) =>
    d.ans === d.top - d.bottom &&
    d.ans >= 10 &&
    d.top % 10 < d.bottom % 10 && // borrow is always required
    Math.floor(d.top / 10) >= 3,
};
