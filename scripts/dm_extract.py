#!/usr/bin/env python3
"""
Extraction for the D.M./DrNB Neonatology QBank (The Tamil Nadu Dr. M.G.R. Medical
University, Branch XI - Neonatology), 4 source PDFs — one per paper number (I-IV),
each containing every sitting of that paper concatenated one-page-per-sitting.

Zero-loss requirement (Sunil, verbatim): "dont miss anything, dont add anything, add
everything as is." Every page is expected to yield EXACTLY 12 items (2 "Elaborate on"
@ 15 marks + 10 "Write notes on" @ 7 marks — confirmed uniform across all 80 pages by
direct visual read before writing this parser). Any page that doesn't hit exactly 12
is written to the flagged list for manual review rather than silently guessed at.

Output: data/dm_drnb/extracted.json — one row per PAPER-INSTANCE (80 total), each with
its 12 verbatim question items. No DB writes here — see dm_seed.py for that.
"""
import sys, os, json, re
sys.path.insert(0, os.path.dirname(__file__))
import pymupdf
from normalize import repair

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_DIR = os.path.join(ROOT, "data", "dm_drnb")
OUT_PATH = os.path.join(SRC_DIR, "extracted.json")

FILES = {
    1: "dm neonatology qbank 2011 - 2026 paper 1.pdf",
    2: "dm neonatology qbank 2011 - 2026 paper 2.pdf",
    3: "dm neonatology qbank 2011 - 2026 paper 3.pdf",
    4: "dm neonatology qbank 2011 - 2026 paper 4.pdf",
}

MONTHS = "JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER"
MONTH_YEAR_RE = re.compile(rf'\b({MONTHS})\s+(\d{{4}})\b')
SESSION_RE = re.compile(rf'\(\s*({MONTHS})\s+(\d{{4}})\s+SESSION\s*\)', re.I)
EXAM_CODE_RE = re.compile(r'[\[\(]\s*([A-Z]{2}\s?\d{3,4}|DM\s?\d{4})\s*[\]\)]')
SUB_CODE_RE = re.compile(r'Sub\.?:?\s*Code\s*:?\s*(\d{3,5})', re.I)  # one page reads "Sub: Code:1451"
QP_CODE_RE = re.compile(r'Q\.?\s*P\.?\s*Code\s*:?\s*(\d{5,7})', re.I)

MONTH_NUM = {m: f"{i+1:02d}" for i, m in enumerate(
    "JANUARY FEBRUARY MARCH APRIL MAY JUNE JULY AUGUST SEPTEMBER OCTOBER NOVEMBER DECEMBER".split())}

# Lines that are pure layout noise from the old (2011-2012) per-question Pages/Time/Marks
# table columns, or footers/instructions — stripped before item-splitting, never treated
# as question content. Marks themselves are NOT read from these columns (see MARKS_BY_SECTION
# below) because the values are already fully determined by the section header in literally
# every one of the 80 papers ((2x15=30) / (10x7=70)) — reading them again from the fragile
# floating table cells would just be a second, riskier way to arrive at the same constant.
NOISE_LINE_RES = [
    re.compile(r'^\d{1,3}$'),  # a lone table-column number (page count / time / marks cell)
    re.compile(r'^Pages\s*Time\s*Marks$', re.I),
    re.compile(r'^\(Max\.?\)\s*\(Max\.?\)\s*\(Max\.?\)$', re.I),
    re.compile(r'^Pages\s*\(Max\.?\)\s*Time\s*\(Max\.?\)\s*Marks\s*\(Max\.?\)$', re.I),
    re.compile(r'^Answer ALL questions in the same order\.?$', re.I),
    re.compile(r'^\*+$'),
    re.compile(r'^\.{3,}$'),
    re.compile(r'^THE TAMIL NADU D[Rr]\.? M\.G\.R\. MEDICAL UNIVERSITY$', re.I),
]

ITEM_START_RE = re.compile(r'^(\d{1,2})[\.\)]\s*(.*)$')
SECTION_I_RE = re.compile(r'^I\.?\s*Elaborate\s+on\s*:?', re.I)
SECTION_II_RE = re.compile(r'^II\.?\s*Write\s+(short\s+)?notes\s+on\s*:?', re.I)

MARKS_BY_SECTION = {"I": 15, "II": 7}


def clean_lines(raw_text):
    lines = []
    for ln in repair(raw_text).split("\n"):
        ln = ln.strip()
        if not ln:
            continue
        if any(pat.match(ln) for pat in NOISE_LINE_RES):
            continue
        lines.append(ln)
    return lines


def parse_header(lines):
    """Consumes header metadata from the top of the page; returns (meta, remaining_lines)."""
    head_text = " \n".join(lines[:12])  # header fields are always within the first ~12 lines
    my = MONTH_YEAR_RE.search(head_text)
    if not my:
        raise ValueError("no month/year found in header")
    month, year = my.group(1), my.group(2)
    sess = SESSION_RE.search(head_text)
    session_note = None
    if sess:
        session_note = f"({sess.group(1).title()} {sess.group(2)} session)"
    exam_code_m = EXAM_CODE_RE.search(head_text)
    sub_code_m = SUB_CODE_RE.search(head_text)
    qp_code_m = QP_CODE_RE.search(head_text)
    meta = {
        "month": month.title(),
        "year": int(year),
        "sitting_id": f"{year}-{MONTH_NUM[month]}",
        "session_note": session_note,
        "exam_code": exam_code_m.group(0) if exam_code_m else None,
        "sub_code": sub_code_m.group(1) if sub_code_m else None,
        "qp_code": qp_code_m.group(1) if qp_code_m else None,
    }
    return meta


def split_items(lines):
    """Returns {'I': [(itemno, text), ...], 'II': [...]}, from the lines AFTER the header."""
    # Find section boundaries.
    i_idx = next((i for i, ln in enumerate(lines) if SECTION_I_RE.match(ln)), None)
    ii_idx = next((i for i, ln in enumerate(lines) if SECTION_II_RE.match(ln)), None)
    if i_idx is None or ii_idx is None or ii_idx <= i_idx:
        raise ValueError(f"could not find both section headers (I={i_idx}, II={ii_idx})")

    def join(parts):
        # Whitespace-only cleanup (PDF line-wrap can leave double spaces where a line
        # boundary fell right after existing inline spacing) — never touches the words.
        return re.sub(r' {2,}', ' ', " ".join(parts).strip())

    def collect(block_lines):
        items = {}
        cur_no, cur_text = None, []
        for ln in block_lines:
            m = ITEM_START_RE.match(ln)
            if m:
                if cur_no is not None:
                    items[cur_no] = join(cur_text)
                cur_no = int(m.group(1))
                cur_text = [m.group(2)] if m.group(2) else []
            else:
                if cur_no is not None:
                    cur_text.append(ln)
        if cur_no is not None:
            items[cur_no] = join(cur_text)
        return items

    section_i_lines = lines[i_idx + 1: ii_idx]
    section_ii_lines = lines[ii_idx + 1:]
    return {"I": collect(section_i_lines), "II": collect(section_ii_lines)}


def parse_page(paper_no, page_no, raw_text):
    lines = clean_lines(raw_text)
    meta = parse_header(lines)
    items_by_section = split_items(lines)

    problems = []
    if sorted(items_by_section["I"].keys()) != [1, 2]:
        problems.append(f"Section I item numbers = {sorted(items_by_section['I'].keys())}, expected [1, 2]")
    if sorted(items_by_section["II"].keys()) != list(range(1, 11)):
        problems.append(f"Section II item numbers = {sorted(items_by_section['II'].keys())}, expected 1..10")
    for sec, items in items_by_section.items():
        for no, text in items.items():
            # Threshold of 3 (not e.g. 8) after manually checking every item under 20 chars
            # against the source: legitimate short prompts exist ("MRSA." at 5 chars is the
            # shortest real one, confirmed against the source page) — anything shorter than
            # that would be a genuine extraction failure, not a short-but-valid question.
            if len(text) < 3:
                problems.append(f"Section {sec} item {no} suspiciously short: {text!r}")

    out_items = []
    for sec in ("I", "II"):
        for no in sorted(items_by_section[sec].keys()):
            out_items.append({
                "section": sec,
                "item_no": no,
                "label": f"{sec}.{no}",
                "text": items_by_section[sec][no],
                "marks": MARKS_BY_SECTION[sec],
            })

    return {
        "paper_no": paper_no,
        "source_file": FILES[paper_no],
        "source_page": page_no + 1,  # 1-indexed for humans
        **meta,
        "n_items": len(out_items),
        "items": out_items,
        "problems": problems,
    }


def main():
    all_papers = []
    for paper_no, fname in FILES.items():
        path = os.path.join(SRC_DIR, fname)
        doc = pymupdf.open(path)
        for page_no in range(len(doc)):
            raw = doc[page_no].get_text("text")
            try:
                rec = parse_page(paper_no, page_no, raw)
            except Exception as e:
                rec = {
                    "paper_no": paper_no, "source_file": fname, "source_page": page_no + 1,
                    "n_items": 0, "items": [], "problems": [f"PARSE FAILURE: {e}"],
                    "raw_text_for_manual_review": raw,
                }
            all_papers.append(rec)
        doc.close()

    clean = [p for p in all_papers if not p["problems"]]
    flagged = [p for p in all_papers if p["problems"]]

    total_items = sum(p["n_items"] for p in all_papers)
    print(f"Papers parsed: {len(all_papers)} (expected 82: 22+20+20+20 across the 4 files)")
    print(f"Clean (exactly 12 items, no problems): {len(clean)}")
    print(f"Flagged for manual review: {len(flagged)}")
    print(f"Total items extracted: {total_items} (expected 984 if all 82 papers are clean)")
    for p in flagged:
        print(f"  FLAGGED paper{p['paper_no']} p{p['source_page']} "
              f"({p.get('month', '?')} {p.get('year', '?')}): {p['problems']}")

    with open(OUT_PATH, "w") as f:
        json.dump(all_papers, f, indent=2, ensure_ascii=False)
    print(f"\nWrote {OUT_PATH}")


if __name__ == "__main__":
    main()
