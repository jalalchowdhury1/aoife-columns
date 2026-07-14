// Level 8 — WHY the detective trick works. A take-away splits the top number
// into two parts: the part taken away and the part left over. Put the parts
// back together and you rebuild the top — that's why "bottom + answer = top"
// cracks every missing-digit box. Single digits only, so she can SEE it.
import type { Framework, Problem } from "../types";
import type { Rng } from "../rng";
import { columnsFigure } from "../columns";
import { snapper } from "./shared";

function generate(rng: Rng): Problem {
  const b = rng.int(2, 7);
  const c = rng.int(2, 9 - b);
  const a = b + c; // the hidden top number

  // a second, tower-less puzzle so she proves it generalises
  let e = rng.int(2, 7);
  let f = rng.int(2, 9 - e);
  while (e === b && f === c) {
    e = rng.int(2, 7);
    f = rng.int(2, 9 - e);
  }
  const d = e + f;

  const snap = snapper({ ans: { 0: c } });

  return {
    promptText: `A mystery box: ◻ − ${b} = ${c}. Some number lost ${b} and only ${c} is left. Let's rebuild it!`,
    figure: columnsFigure("-", a, b, {
      hide: { top: [0] },
      state: { ans: { 0: c } },
    }),
    steps: [
      {
        id: "parts",
        ask: `The hidden number got split into two parts. Which two?`,
        answer: "parts",
        input: "choice",
        choices: rng.shuffle([
          { label: `The ${b} that was taken away and the ${c} left over`, value: "parts" },
          { label: `Two ${c}s — everything doubles`, value: "double" },
        ]),
        hint: `Look at the tower: ${b} went away, ${c} stayed. Together they WERE the hidden number.`,
        decoyQuestions: ["Did the hidden number disappear forever?", "Should I guess the box?"],
        figState: snap({ glow: 0 }),
      },
      {
        id: "rebuild",
        ask: `Glue the parts back together: ${c} + ${b} = ?`,
        answer: a,
        input: "number",
        hint: `Start at ${c} and count on ${b} more — you're un-doing the take-away.`,
        decoyQuestions: [`Should I take ${b} away again?`, "Do the parts stay apart forever?"],
        figState: snap({ reveal: { top: { 0: a } }, glow: undefined }),
      },
      {
        id: "check",
        ask: `The box was ${a}! Check it backwards: does ${a} − ${b} really make ${c}?`,
        answer: "yes",
        input: "choice",
        choices: rng.shuffle([
          { label: `Yes — adding back ALWAYS rebuilds the start`, value: "yes" },
          { label: `No — it only worked by luck`, value: "luck" },
        ]),
        hint: `Take the ${b} away from ${a} again and count what's left.`,
        decoyQuestions: ["Do I need a bigger number?", "Should the answer box change?"],
      },
      {
        id: "solo-flip",
        ask: `Your turn, no tower! ◻ − ${e} = ${f}. Glue the parts: what's in the box?`,
        answer: d,
        input: "number",
        hint: `The parts are ${f} left over and ${e} taken away — put them back together.`,
        decoyQuestions: [`Should I take ${e} away from ${f}?`, "Is the box always 10?"],
      },
    ],
    finalAsk: `Rebuild both boxes: the tower, then ◻ − ${e} = ${f}.`,
    finalAnswers: [
      { label: "Tower box", value: a },
      { label: `◻ − ${e} = ${f}`, value: d },
    ],
    data: { top: a, bottom: b, ans: c, top2: d, bottom2: e, ans2: f },
  };
}

export const addItBack: Framework = {
  id: "add-it-back",
  title: "Add It Back",
  emoji: "🪃",
  family: "🕵️ Missing Digits",
  blurb: "WHY the trick works: adding rebuilds what take-away split apart.",
  generate,
  invariant: (d) =>
    d.top === d.bottom + d.ans &&
    d.top <= 9 &&
    d.bottom >= 2 &&
    d.ans >= 2 &&
    d.top2 === d.bottom2 + d.ans2 &&
    d.top2 <= 9 &&
    !(d.bottom2 === d.bottom && d.ans2 === d.ans), // the second puzzle is always fresh
};
