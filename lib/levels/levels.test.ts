// The generator contract (DO NOT BREAK) — every level, 500 seeds.
// Mirrors the aoife-frameworks self-test regime, plus figure-timeline checks.
import { describe, it, expect } from "vitest";
import { makeRng } from "../rng";
import { LEVELS } from "./index";
import { digitsOf, figureAt, numDigits, type ColumnsSpec, type ColumnsState } from "../columns";
import type { Problem } from "../types";

const SEEDS = 500;

// "What is A op B?" decoys must never evaluate to a live answer (rule 5).
const ARITH_RE = /what is (\d+)\s*([+−-])\s*(\d+)\?/i;

function liveAnswers(p: Problem): Set<number> {
  const s = new Set<number>();
  for (const st of p.steps) if (typeof st.answer === "number") s.add(st.answer);
  for (const f of p.finalAnswers) s.add(f.value);
  return s;
}

describe("level registry", () => {
  it("has 8 levels with unique ids", () => {
    expect(LEVELS.length).toBe(8);
    expect(new Set(LEVELS.map((f) => f.id)).size).toBe(8);
  });
});

for (const level of LEVELS) {
  describe(`level: ${level.id}`, () => {
    // track choice-answer positions across seeds (rule 8: no fixed-position
    // correct answers when the correct value never varies)
    const correctValues = new Map<string, Set<string>>();
    const correctIndices = new Map<string, Set<number>>();

    it(`obeys the generator contract across ${SEEDS} seeds`, () => {
      for (let seed = 1; seed <= SEEDS; seed++) {
        const p = level.generate(makeRng(seed));
        const answers = liveAnswers(p);

        // step ids unique within the problem
        expect(new Set(p.steps.map((s) => s.id)).size).toBe(p.steps.length);

        for (const step of p.steps) {
          // rule 1: numeric answers are non-negative integers
          if (step.input === "number") {
            expect(Number.isInteger(step.answer), `${step.id} answer int`).toBe(true);
            expect(Number(step.answer)).toBeGreaterThanOrEqual(0);
          }
          // rule 2: decoys + hint
          expect(step.hint.length, `${step.id} hint`).toBeGreaterThan(0);
          expect(step.decoyQuestions.length, `${step.id} decoys`).toBeGreaterThanOrEqual(2);
          for (const d of step.decoyQuestions) {
            expect(d).not.toBe(step.ask);
            // rule 5: arithmetic decoys can't equal any live answer
            const m = d.match(ARITH_RE);
            if (m) {
              const v = m[2] === "+" ? Number(m[1]) + Number(m[3]) : Number(m[1]) - Number(m[3]);
              expect(answers.has(v), `decoy "${d}" collides`).toBe(false);
            }
          }
          // rule 3: choice steps well-formed
          if (step.input === "choice") {
            expect(step.choices, `${step.id} choices`).toBeDefined();
            expect(step.choices!.length).toBeGreaterThanOrEqual(2);
            const hits = step.choices!.filter((c) => c.value === step.answer);
            expect(hits.length, `${step.id} exactly one correct`).toBe(1);
            const key = step.id;
            if (!correctValues.has(key)) {
              correctValues.set(key, new Set());
              correctIndices.set(key, new Set());
            }
            correctValues.get(key)!.add(String(step.answer));
            correctIndices.get(key)!.add(step.choices!.findIndex((c) => c.value === step.answer));
          }
        }

        // rule 4: finals are ints, reached, and the script ends on a final
        const numericStepAnswers = new Set(
          p.steps.filter((s) => s.input === "number").map((s) => Number(s.answer)),
        );
        for (const f of p.finalAnswers) {
          expect(Number.isInteger(f.value)).toBe(true);
          expect(f.value).toBeGreaterThanOrEqual(0);
          expect(numericStepAnswers.has(f.value), `final ${f.label} reached`).toBe(true);
        }
        const last = p.steps[p.steps.length - 1];
        expect(
          p.finalAnswers.some((f) => f.value === Number(last.answer)),
          "last step answer is a final answer",
        ).toBe(true);

        // rule 6: level invariant
        expect(level.invariant(p.data), `invariant seed ${seed}`).toBe(true);

        // rule 7: figure timeline sanity — the finished figure shows the truth
        const fig = figureAt(p, p.steps.length) as ColumnsSpec;
        expect(fig.kind).toBe("columns");
        const state = fig.state as ColumnsState;
        const result = fig.op === "+" ? fig.top + fig.bottom : fig.top - fig.bottom;
        if (!fig.hide) {
          for (let col = 0; col < numDigits(result); col++) {
            expect(state.ans?.[col], `ans digit col ${col} filled`).toBe(digitsOf(result, 3)[col]);
          }
        } else {
          for (const col of fig.hide.top ?? []) {
            expect(state.reveal?.top?.[col], `top box ${col} revealed`).toBe(digitsOf(fig.top, 3)[col]);
          }
          for (const col of fig.hide.ans ?? []) {
            expect(state.reveal?.ans?.[col], `ans box ${col} revealed`).toBe(digitsOf(result, 3)[col]);
          }
        }
      }

      // rule 8: a constant correct answer must not sit at a constant position
      for (const [stepId, values] of correctValues) {
        if (values.size === 1) {
          expect(
            correctIndices.get(stepId)!.size,
            `${level.id}/${stepId}: correct choice position must vary across seeds`,
          ).toBeGreaterThan(1);
        }
      }
    });
  });
}
