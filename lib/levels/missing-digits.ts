// Level 8 — the test question that started this whole app: a subtraction with
// hidden digits (8□□ − 34 = □77 style). The detective trick: the answer plus
// the bottom number always rebuilds the top — so ADD upwards, column by
// column, and every box reveals itself. Both columns carry, exactly like the
// real Continual Assessment problem.
import type { Framework, Problem } from "../types";
import type { Rng } from "../rng";
import { columnsFigure } from "../columns";
import { snapper } from "./shared";

function generate(rng: Rng): Problem {
  const bo = rng.int(1, 9);
  const ao = rng.int(Math.max(1, 10 - bo), 9); // ones of the check-add carry
  const bt = rng.int(1, 8);
  const at = rng.int(9 - bt, 9); // tens carry too (with the little 1)
  const ah = rng.int(1, 8);

  const s0 = ao + bo; // 10..18
  const d0 = s0 % 10; // hidden top ones
  const s1 = at + bt + 1; // 10..19
  const d1 = s1 % 10; // hidden top tens
  const topH = ah + 1;

  const top = topH * 100 + d1 * 10 + d0;
  const bottom = bt * 10 + bo;
  const ans = ah * 100 + at * 10 + ao;

  // Known: top hundreds, all of bottom, answer tens + ones.
  // Hidden: top tens, top ones, answer hundreds.
  const snap = snapper({ ans: { 0: ao, 1: at } });

  return {
    promptText: `Detective time! ${topH}◻◻ − ${bottom} = ◻${at}${ao} — three digits are hiding. Find them!`,
    figure: columnsFigure("-", top, bottom, {
      hide: { top: [0, 1], ans: [2] },
      state: { ans: { 0: ao, 1: at } },
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
        figState: snap({ glow: 0 }),
      },
      {
        id: "add-ones",
        ask: `Add up the ones: ${ao} + ${bo} = ?`,
        answer: s0,
        input: "number",
        hint: `Start at ${ao} and count on ${bo} more.`,
        decoyQuestions: ["Should I take away instead?", "Can I start with the hundreds?"],
      },
      {
        id: "top-ones",
        ask: `${s0}: write the ones digit, carry the 1. So the TOP ones box is…?`,
        answer: d0,
        input: "number",
        hint: `${s0} is 1 ten and some ones — only the ones digit fits in the box.`,
        decoyQuestions: ["Does the whole number fit in the box?", "Do I skip the carry?"],
        figState: snap({ reveal: { top: { 0: d0 } }, carry: [1], glow: 1 }),
      },
      {
        id: "add-tens",
        ask: `Add up the tens — count the little 1 too! 1 + ${at} + ${bt} = ?`,
        answer: s1,
        input: "number",
        hint: `The carried 1 joins in: one, then ${at} more, then ${bt} more.`,
        decoyQuestions: ["Should I take away instead?", "Did the little 1 disappear?"],
      },
      {
        id: "top-tens",
        ask: `${s1}: write the tens digit, carry the 1 again. So the TOP tens box is…?`,
        answer: d1,
        input: "number",
        hint: `Keep just the ones digit of ${s1} — the extra ten carries on.`,
        decoyQuestions: ["Does the whole number fit in the box?", "Is the puzzle finished?"],
        figState: snap({ reveal: { top: { 1: d1 } }, carry: [2], glow: 2 }),
      },
      {
        id: "ans-hundreds",
        ask: `Hundreds: the little 1 + the answer box must make ${topH}. What's in the answer box?`,
        answer: ah,
        input: "number",
        hint: `Which number plus 1 makes ${topH}?`,
        decoyQuestions: ["Is it always the same as the top digit?", "Do hundreds ever carry?"],
        figState: snap({ reveal: { ans: { 2: ah } }, glow: undefined }),
      },
    ],
    finalAsk: "Fill in the missing digits — ones first, like a detective!",
    finalAnswers: [
      { label: "Top ones box", value: d0 },
      { label: "Top tens box", value: d1 },
      { label: "Answer hundreds box", value: ah },
    ],
    data: { top, bottom, ans, s0, s1 },
  };
}

export const missingDigits: Framework = {
  id: "missing-digits",
  title: "Missing Digit Detective",
  emoji: "🕵️",
  family: "🕵️ Missing Digits",
  blurb: "The test puzzle: find the hidden digits by adding up!",
  generate,
  invariant: (d) =>
    d.ans + d.bottom === d.top &&
    d.top >= 100 &&
    d.bottom >= 10 &&
    d.bottom <= 99 &&
    d.s0 >= 10 && // ones carry
    d.s1 >= 10, // tens carry — same shape as the real test problem
};
