#!/usr/bin/env python3
"""10 Missing Digit Detective problems (all 3-digit) -> printable HTML."""
import random

random.seed(20260715)

def make_problem():
    # carry pattern in the check-add (>=1 carry so it's a real detective case)
    c1, c2 = random.choice([(1, 0), (0, 1), (1, 1), (1, 1)])
    while True:
        ao, bo = random.randint(0, 9), random.randint(1, 9)
        if (ao + bo >= 10) == bool(c1):
            break
    to = (ao + bo) % 10
    while True:
        at, bt = random.randint(0, 9), random.randint(1, 9)
        if (at + bt + c1 >= 10) == bool(c2):
            break
    tt = (at + bt + c1) % 10
    while True:
        ah, bh = random.randint(1, 8), random.randint(1, 8)
        if ah + bh + c2 <= 9:
            break
    th = ah + bh + c2

    top = th * 100 + tt * 10 + to
    bottom = bh * 100 + bt * 10 + bo
    ans = ah * 100 + at * 10 + ao
    assert ans + bottom == top and 100 <= bottom <= 999 and 100 <= ans <= 999

    # hide one digit per column, spread across at least two different rows
    while True:
        hide = [random.choice(["top", "bottom", "ans"]) for _ in range(3)]
        if len(set(hide)) >= 2:
            break
    return {"top": top, "bottom": bottom, "ans": ans, "hide": hide}

problems = []
seen = set()
while len(problems) < 10:
    p = make_problem()
    key = (p["top"], p["bottom"])
    if key not in seen:
        seen.add(key)
        problems.append(p)

def cell(n, col, row, hide):
    d = str(n).zfill(3)[2 - col]
    if hide[col] == row:
        return '<td><span class="box"></span></td>'
    return f"<td>{d}</td>"

def tower(i, p):
    rows = []
    for row, n, pre in (("top", p["top"], ""), ("bottom", p["bottom"], "&minus;")):
        tds = "".join(cell(n, c, row, p["hide"]) for c in (2, 1, 0))
        rows.append(f'<tr class="{row}"><td class="op">{pre}</td>{tds}</tr>')
    tds = "".join(cell(p["ans"], c, "ans", p["hide"]) for c in (2, 1, 0))
    rows.append(f'<tr class="ans"><td class="op"></td>{tds}</tr>')
    return f'''<div class="prob">
      <div class="num">{i}</div>
      <table>{"".join(rows)}</table>
    </div>'''

def key_line(i, p):
    def mark(n, row):
        d = str(n).zfill(3)
        return "".join(
            f'<b class="found">{d[2 - c]}</b>' if p["hide"][c] == row else d[2 - c]
            for c in (2, 1, 0)
        )
    return (f'<div class="keyrow"><span class="num2">{i}</span> '
            f'{mark(p["top"], "top")} &minus; {mark(p["bottom"], "bottom")} '
            f'= {mark(p["ans"], "ans")}</div>')

html = f"""<!doctype html><html><head><meta charset="utf-8"><style>
  @page {{ size: letter; margin: 14mm; }}
  * {{ box-sizing: border-box; }}
  body {{ font-family: "Comic Sans MS", "Chalkboard SE", sans-serif; color: #1f1235; margin: 0; }}
  h1 {{ text-align: center; font-size: 21pt; margin: 0 0 2mm; color: #7e22ce; }}
  .sub {{ text-align: center; font-size: 10.5pt; color: #6b21a8; margin-bottom: 4mm; }}
  .nameline {{ display: flex; justify-content: space-between; font-size: 11pt; margin: 0 4mm 5mm; color: #444; }}
  .grid {{ display: grid; grid-template-columns: 1fr 1fr; gap: 5mm 10mm; }}
  .prob {{ border: 2.5px solid #d8b4fe; border-radius: 12px; padding: 4mm 6mm; display: flex; gap: 5mm; align-items: center;
          break-inside: avoid; page-break-inside: avoid; }}
  .num {{ font-size: 13pt; font-weight: bold; color: #fff; background: #a855f7; border-radius: 50%;
         width: 8.5mm; height: 8.5mm; display: flex; align-items: center; justify-content: center; flex: none; }}
  table {{ border-collapse: collapse; margin: 0 auto; }}
  td {{ width: 11.5mm; height: 11.5mm; text-align: center; font-size: 21pt; font-weight: bold; }}
  td.op {{ width: 8mm; color: #be123c; font-size: 18pt; }}
  .box {{ display: inline-block; width: 9.5mm; height: 10.5mm; border: 2.2px dashed #a855f7; border-radius: 3px; vertical-align: middle; }}
  tr.bottom td {{ border-bottom: 2.5px solid #1f1235; }}
  tr.ans td {{ padding-top: 2mm; }}
  .keypage {{ page-break-before: always; }}
  .keyrow {{ font-size: 15pt; margin: 4mm 0; letter-spacing: 1px; }}
  .num2 {{ display: inline-block; width: 9mm; font-weight: bold; color: #a855f7; }}
  .found {{ color: #e11d48; border: 1.6px solid #e11d48; border-radius: 3px; padding: 0 1px; }}
  .hint {{ font-size: 10pt; color: #6b21a8; background: #faf5ff; border: 1.5px solid #e9d5ff;
          border-radius: 8px; padding: 3mm 4mm; margin-bottom: 5mm; text-align: center; }}
</style></head><body>
  <h1>🕵️ Missing Digit Detective</h1>
  <div class="sub">Ten 3-digit mysteries — write the missing digits!</div>
  <div class="nameline"><span>Name: ______________________</span><span>Date: ____________</span></div>
  <div class="hint">🪃 Detective trick: the bottom number + the answer must <b>rebuild the top number</b>.
    Add UP the tower, ones first — don't forget the little carried 1s!</div>
  <div class="grid">{"".join(tower(i + 1, p) for i, p in enumerate(problems))}</div>
  <div class="keypage">
    <h1>🔑 Answer Key</h1>
    <div class="sub">(for grown-ups — the found digits are circled in red)</div>
    {"".join(key_line(i + 1, p) for i, p in enumerate(problems))}
  </div>
</body></html>"""

out = "/private/tmp/claude-501/-Users-jalalchowdhury/c19c61e0-0e5b-4474-a86c-fcf7f3e2f578/scratchpad/worksheet.html"
with open(out, "w") as f:
    f.write(html)
for i, p in enumerate(problems, 1):
    print(i, p["top"], "-", p["bottom"], "=", p["ans"], p["hide"])
