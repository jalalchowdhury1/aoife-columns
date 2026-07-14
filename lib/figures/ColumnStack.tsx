import type { FigureSpec } from "../types";
import type { ColumnsSpec, ColumnsState } from "../columns";
import { digitsOf, COL_LETTER } from "../columns";

// The column tower: H/T/O letters, an "above" row for borrow rewrites and
// carried 1s, top number, operator + bottom number, the line, answer boxes.
// Everything the child would write by hand appears in pink as steps complete.

const CELL = "w-14 h-14 flex items-center justify-center text-4xl font-bold";

function AboveCell({ col, state, topDigit }: { col: number; state: ColumnsState; topDigit: number }) {
  const cross = state.cross?.[col];
  const carried = state.carry?.includes(col);
  if (cross === undefined && !carried) return <div className="w-14 h-7" />;
  return (
    <div className="w-14 h-7 flex items-end justify-center text-xl font-bold text-pink-600 leading-none">
      {carried && <span className="mr-0.5">+1</span>}
      {cross !== undefined && cross !== 10 + topDigit && <span>{cross}</span>}
    </div>
  );
}

function TopCell({ col, spec, present }: { col: number; spec: ColumnsSpec; present: boolean }) {
  const { state } = spec;
  const hidden = spec.hide?.top?.includes(col);
  const revealed = state.reveal?.top?.[col];
  if (!present) return <div className={CELL} />;
  const digit = digitsOf(spec.top, spec.cols)[col];
  if (hidden) {
    // a box can be struck out (it lent 1) even before its digit is known
    const struck = state.strike?.includes(col) || state.cross?.[col] !== undefined;
    return <BoxCell value={revealed} struck={struck} />;
  }
  const cross = state.cross?.[col];
  if (cross === undefined) return <div className={`${CELL} text-purple-800`}>{digit}</div>;
  if (cross === 10 + digit) {
    // borrow landed here: little pink 1 in front, digit untouched
    return (
      <div className={`${CELL} text-purple-800`}>
        <span className="text-xl text-pink-600 mr-0.5">1</span>
        {digit}
      </div>
    );
  }
  // digit was borrowed FROM: strike it (its new value sits in the above row)
  return <div className={`${CELL} text-gray-400 line-through decoration-pink-500 decoration-4`}>{digit}</div>;
}

function BottomCell({ col, spec, present }: { col: number; spec: ColumnsSpec; present: boolean }) {
  if (!present) return <div className={CELL} />;
  const hidden = spec.hide?.bottom?.includes(col);
  const revealed = spec.state.reveal?.bottom?.[col];
  if (hidden) return <BoxCell value={revealed} />;
  return <div className={`${CELL} text-purple-800`}>{digitsOf(spec.bottom, spec.cols)[col]}</div>;
}

function AnsCell({ col, spec }: { col: number; spec: ColumnsSpec }) {
  const hidden = spec.hide?.ans?.includes(col);
  const revealed = spec.state.reveal?.ans?.[col];
  if (hidden) return <BoxCell value={revealed} />;
  const filled = spec.state.ans?.[col];
  return (
    <div className="w-14 h-14 p-1">
      <div
        className={`w-full h-full rounded-lg border-4 flex items-center justify-center text-3xl font-bold ${
          filled !== undefined ? "border-green-300 bg-green-50 text-green-700" : "border-purple-200 bg-white text-purple-200"
        }`}
      >
        {filled ?? ""}
      </div>
    </div>
  );
}

// A detective box: dashed until its digit is found. `struck` draws the same
// pink strike a borrowed-from digit gets — the box lent 1 like any neighbour.
function BoxCell({ value, struck }: { value?: number; struck?: boolean }) {
  return (
    <div className="w-14 h-14 p-1">
      <div
        className={`w-full h-full rounded-lg border-4 border-dashed flex items-center justify-center text-3xl font-bold ${
          value !== undefined ? "border-pink-400 bg-pink-50 text-pink-600" : "border-purple-300 bg-purple-50 text-purple-300"
        }`}
      >
        <span className={struck ? "line-through decoration-pink-500 decoration-4" : ""}>{value ?? "?"}</span>
      </div>
    </div>
  );
}

export function ColumnStack({ spec }: { spec: FigureSpec }) {
  const s = spec as ColumnsSpec;
  const cols = Array.from({ length: s.cols }, (_, i) => s.cols - 1 - i); // left → right
  const topLen = String(s.top).length;
  const botLen = String(s.bottom).length;
  const glow = (col: number) =>
    s.state.glow === col ? "bg-amber-100 rounded-xl" : "";

  return (
    <div className="flex justify-center mb-3">
      <div className="bg-white border-4 border-purple-200 rounded-2xl px-5 py-3 shadow-lg inline-flex items-end gap-0">
        {/* operator gutter */}
        <div className="flex flex-col items-center mr-1">
          <div className="h-5" />
          <div className="h-7" />
          <div className={CELL} />
          <div className={`${CELL} text-pink-500`}>{s.op === "+" ? "+" : "−"}</div>
          <div className="w-full h-1 bg-transparent my-1" />
          <div className="w-14 h-14" />
        </div>
        {cols.map((col) => (
          <div key={col} className={`flex flex-col items-center ${glow(col)}`}>
            <div className="h-5 text-xs font-bold text-purple-300">{COL_LETTER[col]}</div>
            <AboveCell col={col} state={s.state} topDigit={digitsOf(s.top, s.cols)[col]} />
            <TopCell col={col} spec={s} present={col < topLen} />
            <BottomCell col={col} spec={s} present={col < botLen} />
            <div className="w-full h-1 bg-purple-700 rounded my-1" />
            <AnsCell col={col} spec={s} />
          </div>
        ))}
      </div>
    </div>
  );
}
