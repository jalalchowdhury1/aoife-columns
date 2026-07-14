// Shared step factories — every level's question-script is assembled from
// these, so the wording of each move is identical across levels.
import type { Rng } from "../rng";
import type { Step, Choice } from "../types";
import { COL_NAME, type ColumnsState } from "../columns";

export const colName = (c: number) => COL_NAME[c];
export const unitName = (c: number) => (c === 2 ? "hundred" : c === 1 ? "ten" : "one");
const cap = (s: string) => s[0].toUpperCase() + s.slice(1);

// Builds CUMULATIVE figure snapshots: each call merges a delta into the running
// state and returns an independent copy (snapshots must never share references).
export function snapper(initial: ColumnsState = {}) {
  let st: ColumnsState = structuredClone(initial);
  return (d: Partial<ColumnsState>): ColumnsState => {
    st = {
      ...st,
      ...d,
      cross: { ...st.cross, ...d.cross },
      strike: d.strike ? [...(st.strike ?? []), ...d.strike] : st.strike,
      carry: d.carry ? [...(st.carry ?? []), ...d.carry] : st.carry,
      ans: { ...st.ans, ...d.ans },
      reveal: d.reveal
        ? {
            top: { ...st.reveal?.top, ...d.reveal.top },
            bottom: { ...st.reveal?.bottom, ...d.reveal.bottom },
            ans: { ...st.reveal?.ans, ...d.reveal.ans },
          }
        : st.reveal,
    };
    return structuredClone(st);
  };
}

export function startColStep(rng: Rng, cols: number, figState?: ColumnsState): Step {
  const opts: Choice[] = [
    { label: "The ones — always start on the right!", value: "ones" },
    { label: "The tens", value: "tens" },
  ];
  if (cols >= 3) opts.push({ label: "The hundreds", value: "hundreds" });
  return {
    id: "start",
    ask: "Which column do we start with?",
    answer: "ones",
    input: "choice",
    choices: rng.shuffle(opts),
    hint: "Column math ALWAYS starts on the right side — the ones.",
    decoyQuestions: ["Which number is bigger?", "Can I solve it all in one go?"],
    figState,
  };
}

// "Can you take b away from a?" — the wrong 'yes' is the classic error of
// subtracting the smaller digit from the bigger one regardless of position.
export function checkTakeStep(
  rng: Rng,
  col: number,
  a: number,
  b: number,
  opts?: { was?: number; figState?: ColumnsState },
): Step {
  const canTake = a >= b;
  const intro =
    opts?.was !== undefined
      ? `Look at the ${colName(col)} — the ${opts.was} is now ${a}:`
      : `Look at the ${colName(col)}:`;
  return {
    id: `check-${colName(col)}`,
    ask: `${intro} can you take ${b} away from ${a}?`,
    answer: canTake ? "yes" : "no",
    input: "choice",
    choices: rng.shuffle([
      { label: `Yes — ${a} is big enough`, value: "yes" },
      { label: `No — ${a} is smaller than ${b}`, value: "no" },
    ]),
    hint: canTake
      ? `Compare the two digits: is ${a} at least as big as ${b}?`
      : `There's only ${a} there, but ${b} to take away — not enough! Time to borrow.`,
    decoyQuestions: [
      "Should I take the top digit away from the bottom digit, whichever is smaller?",
      "Can I skip this column?",
    ],
    figState: opts?.figState,
  };
}

export function borrowStep(col: number, fromDigit: number, figState?: ColumnsState): Step {
  return {
    id: `borrow-${colName(col)}`,
    ask: `Knock next door! Borrow 1 ${unitName(col)} from the ${fromDigit}. What does the ${fromDigit} become?`,
    answer: fromDigit - 1,
    input: "number",
    hint: `Borrowing takes exactly 1 away from the ${fromDigit}. Cross it out and write the new digit above.`,
    decoyQuestions: [
      "Does the neighbour get BIGGER when we borrow?",
      "Should I fill in the answer box first?",
    ],
    figState,
  };
}

export function bumpStep(col: number, oldDigit: number, fromCol: number, figState?: ColumnsState): Step {
  return {
    id: `bump-${colName(col)}`,
    ask: `The borrowed ${unitName(fromCol)} is worth 10 ${colName(col)}! They pour in: 10 + ${oldDigit} = ?`,
    answer: 10 + oldDigit,
    input: "number",
    hint: `The little 1 lands in front of the ${oldDigit} — ten plus ${oldDigit}.`,
    decoyQuestions: [
      `Does the ${oldDigit} just stay the same?`,
      "Do we cross out the bottom number too?",
    ],
    figState,
  };
}

export function subStep(col: number, x: number, y: number, figState?: ColumnsState, note = ""): Step {
  return {
    id: `sub-${colName(col)}`,
    ask: `${cap(colName(col))} column${note}: what is ${x} − ${y}?`,
    answer: x - y,
    input: "number",
    hint: `Count back ${y} from ${x}, one at a time.`,
    decoyQuestions: ["Should I add these digits instead?", "Can I jump straight to the final answer?"],
    figState,
  };
}

export function addStep(col: number, parts: number[], figState?: ColumnsState, note = ""): Step {
  const sum = parts.reduce((a, b) => a + b, 0);
  return {
    id: `add-${colName(col)}`,
    ask: `${cap(colName(col))} column${note}: what is ${parts.join(" + ")}?`,
    answer: sum,
    input: "number",
    hint: `Add them one at a time: start with ${parts[0]}, count on ${parts.slice(1).join(", then ")}.`,
    decoyQuestions: ["Should I take away instead?", "Can I jump straight to the final answer?"],
    figState,
  };
}

export function readStep(op: "+" | "-", top: number, bottom: number, result: number, figState?: ColumnsState): Step {
  return {
    id: "read",
    ask: `Read the answer boxes left to right! ${top} ${op === "+" ? "+" : "−"} ${bottom} = ?`,
    answer: result,
    input: "number",
    hint: "The green boxes spell the answer — read them left to right, like a word.",
    decoyQuestions: ["Do I add the answer boxes together?", "Should I start again from the ones?"],
    figState,
  };
}
