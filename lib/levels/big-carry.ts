// Level 7 — three-digit addition. The ones always carry; the tens sometimes
// carry again. The sum always stays three digits.
import type { Framework, Problem, Step } from "../types";
import type { Rng } from "../rng";
import { columnsFigure, digitsOf } from "../columns";
import { snapper, startColStep, addStep, readStep } from "./shared";

function generate(rng: Rng): Problem {
  const doubleCarry = rng.pick([true, false]);
  const o1 = rng.int(3, 9);
  const o2 = rng.int(Math.max(1, 10 - o1), 9); // ones always overflow
  let t1: number, t2: number, h1: number, h2: number;
  if (doubleCarry) {
    t1 = rng.int(1, 8);
    t2 = rng.int(Math.max(1, 9 - t1), 9); // 1 + t1 + t2 ≥ 10
    h1 = rng.int(1, 7);
    h2 = rng.int(1, 8 - h1); // 1 + h1 + h2 ≤ 9
  } else {
    t1 = rng.int(1, 7);
    t2 = rng.int(1, 8 - t1); // 1 + t1 + t2 ≤ 9
    h1 = rng.int(1, 8);
    h2 = rng.int(1, 9 - h1); // h1 + h2 ≤ 9
  }
  const top = h1 * 100 + t1 * 10 + o1;
  const bottom = h2 * 100 + t2 * 10 + o2;
  const ans = top + bottom;
  const s0 = o1 + o2;
  const s1 = 1 + t1 + t2;
  const snap = snapper();

  const steps: Step[] = [
    startColStep(rng, 3, snap({ glow: 0 })),
    addStep(0, [o1, o2]),
    {
      id: "write-ones",
      ask: `${s0}: which digit goes in the ones box (the 1 ten gets carried)?`,
      answer: s0 % 10,
      input: "number",
      hint: `${s0} is 1 ten and some ones — the ones digit goes in the box.`,
      decoyQuestions: ["Can both digits squeeze into one box?", "Should the carry go under the line?"],
      figState: snap({ ans: { 0: s0 % 10 }, carry: [1], glow: 1 }),
    },
    addStep(1, [1, t1, t2], undefined, " — count the little 1 too!"),
  ];

  if (doubleCarry) {
    steps.push({
      id: "write-tens",
      ask: `${s1}: which digit goes in the tens box (carry the 1 again!)?`,
      answer: s1 % 10,
      input: "number",
      hint: `${s1} overflows too — keep the ones digit of it, carry the ten.`,
      decoyQuestions: ["Can both digits squeeze into one box?", "Is the tower finished already?"],
      figState: snap({ ans: { 1: s1 % 10 }, carry: [2], glow: 2 }),
    });
    steps.push(addStep(2, [1, h1, h2], snap({ ans: { 2: 1 + h1 + h2 }, glow: undefined }), " — one more little 1!"));
  } else {
    // no overflow: the tens sum drops straight into its box
    steps[steps.length - 1].figState = snap({ ans: { 1: s1 }, glow: 2 });
    steps.push(addStep(2, [h1, h2], snap({ ans: { 2: h1 + h2 }, glow: undefined })));
  }
  steps.push(readStep("+", top, bottom, ans));

  return {
    promptText: `Big adding tower: ${top} + ${bottom}. Keep an eye on those little 1s!`,
    figure: columnsFigure("+", top, bottom),
    steps,
    finalAsk: `What is ${top} + ${bottom}?`,
    finalAnswers: [{ label: `${top} + ${bottom}`, value: ans }],
    data: { top, bottom, ans },
  };
}

export const bigCarry: Framework = {
  id: "big-carry",
  title: "Big Carry",
  emoji: "🚚",
  family: "➕ Adding Up",
  blurb: "Three digits and carries flying — stay organised!",
  generate,
  invariant: (d) => {
    const [o1] = digitsOf(d.top, 3);
    const [o2] = digitsOf(d.bottom, 3);
    return d.ans === d.top + d.bottom && d.ans <= 999 && d.ans >= 100 && o1 + o2 >= 10;
  },
};
