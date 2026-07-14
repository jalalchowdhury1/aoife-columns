// The column-tower model shared by every level: the figure spec, the per-step
// display snapshots, and small digit helpers used by the generators.
import type { FigureSpec, Problem } from "./types";

// A display snapshot of the written work. Snapshots are CUMULATIVE — each
// step's figState is the full picture after that step, not a delta.
export interface ColumnsState {
  // col -> the value now "written above" the top digit of that column.
  //   value === 10 + original digit  → borrow landed here: little 1, no strike
  //   anything else                  → original digit struck, value written above
  cross?: Record<number, number>;
  carry?: number[]; // cols with a little +1 above (addition / detective check)
  ans?: Record<number, number>; // answer digits filled so far (col -> digit)
  reveal?: Partial<Record<"top" | "bottom" | "ans", Record<number, number>>>; // solved detective boxes
  glow?: number; // column being worked on (0 = ones)
}

export interface ColumnsSpec extends FigureSpec {
  kind: "columns";
  op: "+" | "-";
  top: number;
  bottom: number;
  cols: number; // rendered width in columns
  hide?: Partial<Record<"top" | "bottom" | "ans", number[]>>; // detective boxes
  state: ColumnsState;
}

export const COL_NAME = ["ones", "tens", "hundreds"] as const;
export const COL_LETTER = ["O", "T", "H"] as const;

// index 0 = ones. Pads with trailing zeros up to `cols`.
export function digitsOf(n: number, cols: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < cols; i++) out.push(Math.floor(n / 10 ** i) % 10);
  return out;
}

export const numDigits = (n: number) => String(n).length;

export function columnsFigure(
  op: "+" | "-",
  top: number,
  bottom: number,
  extra?: Partial<ColumnsSpec>,
): ColumnsSpec {
  const result = op === "+" ? top + bottom : top - bottom;
  const cols = Math.max(numDigits(top), numDigits(bottom), numDigits(result));
  return { kind: "columns", op, top, bottom, cols, state: { glow: undefined }, ...extra };
}

// Figure to show after `done` completed steps: the latest defined figState.
export function figureAt(problem: Problem, done: number): FigureSpec | undefined {
  const fig = problem.figure;
  if (!fig || fig.kind !== "columns") return fig;
  let state: ColumnsState | undefined;
  for (let i = 0; i < done && i < problem.steps.length; i++) {
    state = problem.steps[i].figState ?? state;
  }
  return state ? { ...fig, state } : fig;
}
