// Level 11 — The Zero Case: worksheet problem #8's exact shape (◻05 − 396
// style). Two hard things at once, taught as one story: the tens is ZERO so
// the borrow must knock TWO doors along, and the hundreds neighbour is a
// mystery box — which gets struck out like any other digit, value written
// above only once it's unmasked. The answer's hundreds digit is given (as on
// the worksheet), so the box is found by adding it back at the end.
import type { Framework, Problem } from "../types";
import type { Rng } from "../rng";
import { columnsFigure, digitsOf } from "../columns";
import { snapper, startColStep, checkTakeStep, borrowStep, bumpStep, subStep, addStep } from "./shared";

function generate(rng: Rng): Problem {
  const o1 = rng.int(0, 8);
  const o2 = rng.int(o1 + 1, 9); // ones must borrow…
  const t2 = rng.int(1, 9); // …from a tens that is 0 (the whole point)
  const h1 = rng.int(3, 9);
  const h2 = rng.int(1, h1 - 2); // answer keeps a real hundreds digit

  const top = h1 * 100 + o1; // tens digit is 0
  const bottom = h2 * 100 + t2 * 10 + o2;
  const ans = top - bottom;
  const aO = 10 + o1 - o2;
  const aT = 9 - t2;
  const aH = h1 - 1 - h2; // given up front, like the worksheet
  const snap = snapper({ ans: { 2: aH } });

  return {
    promptText: `The worksheet boss! ◻0${o1} − ${bottom} — the tens is ZERO and the hundreds is hiding in a box!`,
    figure: columnsFigure("-", top, bottom, {
      hide: { top: [2] },
      state: { ans: { 2: aH } },
    }),
    steps: [
      startColStep(rng, 3, snap({ glow: 0 })),
      checkTakeStep(rng, 0, o1, o2),
      {
        id: "zero-door",
        ask: "Knock next door for a ten… but the tens neighbour is a 0! Can zero lend us a ten?",
        answer: "next",
        input: "choice",
        choices: rng.shuffle([
          { label: "No — zero has NOTHING to lend. Knock one more door along!", value: "next" },
          { label: "Yes — just take a ten from the 0", value: "take" },
        ]),
        hint: "Zero is an empty house — nothing inside to lend! Go one more door to the hundreds.",
        decoyQuestions: ["Should I skip this column?", "Does the 0 turn into a 9 all by itself?"],
      },
      {
        id: "strike-box",
        ask: "Next door along is a MYSTERY BOX! Can we still borrow from it?",
        answer: "strike",
        input: "choice",
        choices: rng.shuffle([
          { label: "Yes! Cross the box out — whatever hides inside just got 1 smaller", value: "strike" },
          { label: "No — we must find the hidden digit first", value: "wait" },
        ]),
        hint: "A box is just a digit wearing a mask. Strike it out like any neighbour — write its new value above once you unmask it.",
        decoyQuestions: ["Do mystery boxes ever run out of hundreds?", "Should I rub the box out completely?"],
        figState: snap({ strike: [2] }),
      },
      bumpStep(1, 0, 2, snap({ cross: { 1: 10 } })),
      borrowStep(1, 10, snap({ cross: { 1: 9 } })),
      bumpStep(0, o1, 1, snap({ cross: { 0: 10 + o1 } })),
      subStep(0, 10 + o1, o2, snap({ ans: { 0: aO }, glow: 1 })),
      checkTakeStep(rng, 1, 9, t2, { was: 0 }),
      subStep(1, 9, t2, snap({ ans: { 1: aT }, glow: 2 }), " — the 0 is now 9"),
      addStep(2, [h2, aH], snap({ cross: { 2: h1 - 1 } }), " — the box lent 1, so ADD IT BACK to unmask it"),
      {
        id: "unmask",
        ask: `So the struck-out box makes ${h1 - 1} now… but it lent 1 away first! What was hiding inside before?`,
        answer: h1,
        input: "number",
        hint: `The box gave 1 away to become ${h1 - 1} — put the 1 back on.`,
        decoyQuestions: ["Is the box the same as the number above it?", "Did the box lend 10, not 1?"],
        figState: snap({ reveal: { top: { 2: h1 } }, glow: undefined }),
      },
    ],
    finalAsk: "Fill the answer boxes and unmask the mystery digit!",
    finalAnswers: [
      { label: "Answer ones box", value: aO },
      { label: "Answer tens box", value: aT },
      { label: "The mystery box", value: h1 },
    ],
    data: { top, bottom, ans, aH },
  };
}

export const zeroCase: Framework = {
  id: "zero-case",
  title: "The Zero Case",
  emoji: "0️⃣",
  family: "🕵️ Missing Digits",
  blurb: "The worksheet boss: take away from ZERO — and strike out a mystery box!",
  generate,
  invariant: (d) => {
    const [o1, t1] = digitsOf(d.top, 3);
    const [o2] = digitsOf(d.bottom, 3);
    return (
      d.ans === d.top - d.bottom &&
      d.ans >= 100 && // no leading zero in the answer
      d.bottom >= 100 &&
      t1 === 0 && // taking away from zero — the whole point
      o1 < o2 && // ones must borrow, forcing the knock across the zero
      d.aH === Math.floor(d.ans / 100)
    );
  },
};
