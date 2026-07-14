import type { FigureSpec } from "../types";
import { ColumnStack } from "./ColumnStack";

export function Figure({ spec }: { spec?: FigureSpec }) {
  if (!spec) return null;
  switch (spec.kind) {
    case "columns":
      return <ColumnStack spec={spec} />;
    default:
      return null;
  }
}
