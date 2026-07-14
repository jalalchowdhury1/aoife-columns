// Level 6 — two-digit addition where the ones overflow: write the ones digit,
// carry the little 1 to the top of the tens column.
import type { Framework, Problem } from "../types";
import type { Rng } from "../rng";
import { columnsFigure, digitsOf } from "../columns";
import { snapper, startColStep, addStep, readStep } from "./shared";

function generate(rng: Rng): Problem {
  const o1 = rng.int(3, 9);
  const o2 = rng.int(Math.max(1, 10 - o1), 9); // ones always overflow
  const t1 = rng.int(1, 7);
  const t2 = rng.int(1, 8 - t1); // 1 + t1 + t2 ≤ 9, so the answer stays two digits
  const top = t1 * 10 + o1;
  const bottom = t2 * 10 + o2;
  const ans = top + bottom;
  const s0 = o1 + o2;
  const snap = snapper();

  return {
    promptText: `Adding towers! ${top} + ${bottom}. Watch what happens when a column overflows…`,
    figure: columnsFigure("+", top, bottom),
    steps: [
      startColStep(rng, 2, snap({ glow: 0 })),
      addStep(0, [o1, o2]),
      {
        id: "carry-choice",
        ask: `${s0} is too big for one little box! What's the move?`,
        answer: "carry",
        input: "choice",
        choices: rng.shuffle([
          { label: `Write the ${s0 % 10}, carry the 1 ten next door`, value: "carry" },
          { label: `Squeeze the whole ${s0} into the ones box`, value: "squeeze" },
        ]),
        hint: `${s0} is 1 ten and ${s0 % 10} ones — the ten belongs in the tens column!`,
        decoyQuestions: ["Can a box hold two digits?", "Should I rub out the ones and start over?"],
        figState: snap({ ans: { 0: s0 % 10 }, carry: [1], glow: 1 }),
      },
      addStep(1, [1, t1, t2], snap({ ans: { 1: 1 + t1 + t2 }, glow: undefined }), " — count the little 1 too!"),
      readStep("+", top, bottom, ans),
    ],
    finalAsk: `What is ${top} + ${bottom}?`,
    finalAnswers: [{ label: `${top} + ${bottom}`, value: ans }],
    data: { top, bottom, ans },
  };
}

export const carryTheOne: Framework = {
  id: "carry-the-one",
  title: "Carry the One",
  emoji: "🎒",
  family: "➕ Adding Up",
  blurb: "Ones overflowing? Write one digit, carry the other!",
  generate,
  invariant: (d) => {
    const [o1] = digitsOf(d.top, 2);
    const [o2] = digitsOf(d.bottom, 2);
    return d.ans === d.top + d.bottom && d.ans <= 99 && o1 + o2 >= 10;
  },
};
