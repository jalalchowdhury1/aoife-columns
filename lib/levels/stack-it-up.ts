// Level 1 — single digits. Not about the arithmetic (she can do 9 − 4 in her
// sleep): it teaches the LAYOUT — who sits on top, where the answer lives.
import type { Framework, Problem } from "../types";
import type { Rng } from "../rng";
import { columnsFigure } from "../columns";
import { snapper } from "./shared";

function generate(rng: Rng): Problem {
  const a = rng.int(5, 9);
  const b = rng.int(1, a - 1);
  const snap = snapper();

  return {
    promptText: `Let's learn the column way! Stack the numbers into a tower and solve ${a} − ${b}.`,
    figure: columnsFigure("-", a, b),
    steps: [
      {
        id: "who-top",
        ask: "Which number goes on TOP of the tower?",
        answer: a,
        input: "choice",
        choices: rng.shuffle([
          { label: `${a} — the number we start with`, value: a },
          { label: `${b} — the number we take away`, value: b },
        ]),
        hint: "We START with the big pile and take away from it — the starting number sits on top.",
        decoyQuestions: ["Do both numbers sit side by side?", "Is the answer already written somewhere?"],
      },
      {
        id: "where-answer",
        ask: "Where does the answer go?",
        answer: "under",
        input: "choice",
        choices: rng.shuffle([
          { label: "In the box UNDER the line", value: "under" },
          { label: "On top of the tower", value: "top" },
          { label: "Floating next to the tower", value: "side" },
        ]),
        hint: "The line works just like an = sign. The answer lives below it.",
        decoyQuestions: ["Do I need to borrow anything?", "Which digit is in the ones?"],
      },
      {
        id: "sub-ones",
        ask: `Take away: what is ${a} − ${b}?`,
        answer: a - b,
        input: "number",
        hint: `Count back ${b} from ${a}, one at a time.`,
        decoyQuestions: ["Should I add these numbers instead?", "Does the line change anything?"],
        figState: snap({ ans: { 0: a - b } }),
      },
    ],
    finalAsk: `What is ${a} − ${b}?`,
    finalAnswers: [{ label: `${a} − ${b}`, value: a - b }],
    data: { top: a, bottom: b, ans: a - b },
  };
}

export const stackItUp: Framework = {
  id: "stack-it-up",
  title: "Stack It Up",
  emoji: "🧱",
  family: "➖ Taking Away",
  blurb: "Meet the tower: who goes on top, where the answer lives.",
  generate,
  invariant: (d) => d.top <= 9 && d.bottom >= 1 && d.ans === d.top - d.bottom && d.ans >= 1,
};
