import type { Framework } from "../types";
import { stackItUp } from "./stack-it-up";
import { onesFirst } from "./ones-first";
import { borrowNextDoor } from "./borrow-next-door";
import { bigBorrow } from "./big-borrow";
import { doubleBorrow } from "./double-borrow";
import { carryTheOne } from "./carry-the-one";
import { bigCarry } from "./big-carry";
import { missingDigits } from "./missing-digits";

// Ladder order — Level 1..8. The home page shows a "⭐ start here" ring on the
// first level without a solo pass. Nothing is ever locked.
export const LEVELS: Framework[] = [
  stackItUp,
  onesFirst,
  borrowNextDoor,
  bigBorrow,
  doubleBorrow,
  carryTheOne,
  bigCarry,
  missingDigits,
];

export const FAMILIES = ["➖ Taking Away", "➕ Adding Up", "🕵️ Missing Digits"];

export const LEVEL_NUM: Record<string, number> = Object.fromEntries(
  LEVELS.map((f, i) => [f.id, i + 1]),
);

export const byId = (id: string) => LEVELS.find((f) => f.id === id);
