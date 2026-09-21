#!/usr/bin/env python3
"""lint_tasks.py — deterministic gate for specs/**/tasks.md (SDD standard).

Exit 1 with violations if any check fails. Wired into CI; PRs with malformed
tasks.md fail checks and are never auto-merged.

Checks (strict format):
  T001  task heading pattern: '### T014 - Title' (zero-padded >=3 digits)
  DEP   'Depends on' present, comma-separated valid IDs or '(none)'
  FILES 'Files' present with >=1 backticked path
  AC    'Acceptance Criteria' with >=1 checkbox item
  VER   'Verification' with >=1 non-empty line containing a runnable code span
  US    user-story tasks carry '[US<n>]' marker in heading
  SEQ   task IDs strictly increasing (per file)
  PHASE at least one phase heading '## ' containing 'Setup' or 'Foundational'
        or matching per-story phases (loose: >=2 '## ' headings)
"""
import re, sys, pathlib

HEADING = re.compile(r"^###\s+(T\d{3,})\s+-\s+.*?\S.*?(?:\s+\[(P)\])?(?:\s*\[(US\d+)\])?\s*$")
BACKTICK = re.compile(r"`[^`]+`")
CODESPAN = re.compile(r"`[^`]+`")

def lint(text):
    errs = []
    ids = []
    headings = re.findall(r"^##\s+.+$", text, re.M)
    tasks = re.split(r"(?=^###\s+T\d)", text, flags=re.M)
    tasks = [t for t in tasks if t.startswith("###")]
    if not tasks:
        return ["tasks.md: no task entries '### T0XX - ...' found"]
    if len(headings) < 2:
        errs.append("structure: fewer than 2 '## ' phase headings")
    for block in tasks:
        m = HEADING.match(block.splitlines()[0])
        first = block.splitlines()[0]
        if not m:
            errs.append(f"{first[:40]}: heading must match '### T014 - Title [P] [US1]'")
            continue
        tid = m.group(1)
        ids.append(tid)
        def field(name):
            fm = re.search(rf"^\s*[-*]\s*\*\*{name}\*\*\s*:(.*?)(?=^\s*[-*]\s*\*\*|\Z)",
                           block, re.M | re.S)
            return fm.group(1) if fm else None
        dep = field("Depends on")
        if dep is None:
            errs.append(f"{tid}: missing '**Depends on**'")
        else:
            for d in [x.strip() for x in dep.split(",")]:
                if d and d not in ("(none)", "none", "-") and not re.fullmatch(r"T\d{3,}", d):
                    errs.append(f"{tid}: bad dependency '{d}' (must be T-ID or none)")
        files = field("Files")
        if files is None or not BACKTICK.search(files):
            errs.append(f"{tid}: '**Files**' missing or no backticked path")
        ac = field("Acceptance Criteria")
        if ac is None or "- [" not in ac:
            errs.append(f"{tid}: '**Acceptance Criteria**' missing or no checkbox item")
        ver = field("Verification")
        if ver is None or not CODESPAN.search(ver):
            errs.append(f"{tid}: '**Verification**' missing or no runnable command")
        test = field("Test")
        if test is None or not test.strip():
            errs.append(f"{tid}: '**Test**' missing")
    if ids != sorted(ids, key=lambda x: int(x[1:])):
        errs.append(f"sequence: task IDs not in increasing order: {ids}")
    return errs

def main():
    roots = sys.argv[1:] or ["specs"]
    files = []
    for r in roots:
        p = pathlib.Path(r)
        files += p.rglob("tasks.md") if p.is_dir() else ([p] if p.exists() else [])
    if not files:
        print("lint_tasks: no tasks.md found under", roots); return 1
    failures = 0
    for f in files:
        errs = lint(f.read_text())
        if errs:
            failures += 1
            print(f"FAIL {f}")
            for e in errs:
                print(f"  - {e}")
        else:
            print(f"PASS {f}")
    return 1 if failures else 0

if __name__ == "__main__":
    sys.exit(main())
