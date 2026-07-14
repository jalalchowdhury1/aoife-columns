// Level 8 — the gentle on-ramp to missing digits: two-digit subtraction, NO
// borrowing, two hidden boxes. The ones box (top row) teaches the detective
// flip — "□ − 4 = 3 means 3 + 4 fills the box" — and the tens box (answer row)
// is a plain subtraction. Level 9 then adds carrying on top of this trick.
import type { Framework, Problem } from "../types";
import type { Rng } from "../rng";
import { columnsFigure, digitsOf } from "../columns";
import { snapper, startColStep } from "./shared";

function generate(rng: Rng): Problem {
  const bo = rng.int(1, 8);
  const ao = rng.int(1, 9 - bo); // ones of the answer; keeps the flip carry-free
  const o1 = ao + bo; // hidden top ones (≤ 9, so no borrow anywhere)
  const t2 = rng.int(1, 8);
  const at = rng.int(1, 9 - t2); // hidden answer tens
  const t1 = t2 + at;

  const top = t1 * 10 + o1;
  const bottom = t2 * 10 + bo;
  const ans = at * 10 + ao;

  // Known: top tens, all of bottom, answer ones. Hidden: top ones, answer tens.
  const snap = snapper({ ans: { 0: ao } });

  return {
    promptText: `Detective School! ${t1}◻ − ${bottom} = ◻${ao} — two digits are hiding. Find them!`,
    figure: columnsFigure("-", top, bottom, {
      hide: { top: [0], ans: [1] },
      state: { ans: { 0: ao } },
    }),
    steps: [
      {
        id: "trick",
        ask: "Digits are hiding! What's the detective trick?",
        answer: "add",
        input: "choice",
        choices: rng.shuffle([
          { label: `Check by adding: ${bottom} + the answer must rebuild the top number`, value: "add" },
          { label: "Guess digits until something looks right", value: "guess" },
        ]),
        hint: "Every take-away hides an adding: bottom + answer = top. Add UP the tower!",
        decoyQuestions: ["Should I rub out the boxes?", "Is the top number always the smallest?"],
      },
      startColStep(rng, 2, snap({ glow: 0 })),
      {
        id: "top-ones",
        ask: `Ones: the top box − ${bo} makes ${ao}. Flip it! ${ao} + ${bo} = the box. What is it?`,
        answer: o1,
        input: "number",
        hint: `Start at ${ao} and count on ${bo} more — that rebuilds the hidden digit.`,
        decoyQuestions: ["Should I take away instead?", "Can a box stay empty?"],
        figState: snap({ reveal: { top: { 0: o1 } }, glow: 1 }),
      },
      {
        id: "ans-tens",
        ask: `Tens: this box is just the take-away. ${t1} − ${t2} = ?`,
        answer: at,
        input: "number",
        hint: `Count back ${t2} from ${t1}, one at a time.`,
        decoyQuestions: ["Do I need the flip trick here too?", "Is the puzzle finished already?"],
        figState: snap({ reveal: { ans: { 1: at } }, glow: undefined }),
      },
    ],
    finalAsk: "Fill in the missing digits — ones first, like a detective!",
    finalAnswers: [
      { label: "Top ones box", value: o1 },
      { label: "Answer tens box", value: at },
    ],
    data: { top, bottom, ans },
  };
}

export const detectiveSchool: Framework = {
  id: "detective-school",
  title: "Detective School",
  emoji: "🔍",
  family: "🕵️ Missing Digits",
  blurb: "Warm-up: find hidden digits with the flip-to-adding trick.",
  generate,
  invariant: (d) => {
    const [o1] = digitsOf(d.top, 2);
    const [o2] = digitsOf(d.bottom, 2);
    return (
      d.ans + d.bottom === d.top &&
      d.top <= 99 &&
      d.bottom >= 10 &&
      d.ans >= 10 &&
      o1 >= o2 // never a borrow/carry in Detective School
    );
  },
};
