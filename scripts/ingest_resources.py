#!/usr/bin/env python3
"""
Phase 6: extract every reference textbook/protocol into page-level text + a chapter map,
so questions can be cited down to a specific book, chapter, and page — and so a full-text
search index can be built over the actual page content (Part 15/16/17 of the spec).

Output per resource: data/resources/<shortName>_pages.json   [{page, text}, ...]
                      data/resources/<shortName>_chapters.json [{title, level, pageStart, pageEnd}, ...]

Design notes:
- Chapters come from the PDF's embedded outline (TOC), NOT re-derived from page text — that
  keeps chapter titles exactly as the publisher wrote them.
- Boilerplate front/back matter (cover, copyright, preface, index, contributors...) is filtered
  out of the chapter list so citations always point at actual clinical content.
- Two resources (NEOCON Ventilation, AIIMS Vol.2) have NO embedded outline at all. They still
  get full page-text extraction (so search + page-level citation works), just without chapter
  titles — recorded honestly as a single "Full text (no chapter outline available)" entry
  rather than guessing chapter boundaries from prose.
- This is a slow, one-time (per-resource) extraction — runs standalone, not on every app boot.
"""
import sys, os, json, re, glob

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, "data", "resources")
os.makedirs(OUT_DIR, exist_ok=True)

sys.path.insert(0, os.path.dirname(__file__))
import pymupdf
from normalize import repair

BOILERPLATE_RE = re.compile(
    r'^(front\s*cover|back\s*cover|inside\s*(front|back)\s*cover|cover|half\s*title|title\s*page|'
    r'copyright|dedication|contributors?|preface|foreword|acknowledg|contents|index|'
    r'about\s+the\s+(book|author)|front\s*matter|back\s*matter|'
    r'praise\s+for|also\s+by|list\s+of\s+(figures|tables|contributors|abbreviations)|'
    r'appendix\s*[a-z0-9]*$)',
    re.I,
)

RESOURCES = [
    # (shortName, glob_pattern, has_toc)
    ("goldsmith", "Goldsmiths_Assisted_Ventilation_of_the_Neonate_E_Book_nodrm-Copy.pdf"),
    ("gomella", "Gomella.pdf"),
    ("neocon-ventilation", "Neonatal ventilation NEOCON.pdf"),
    ("neonatal-equipment", "Neonatal Equipment 5th Edition.pdf"),
    ("cloherty-stark", None),  # resolved via glob (curly apostrophe in filename)
    ("avery", "Avery 10th.pdf"),
    ("aiims-vol1", "aiims volume 1.pdf"),
    ("aiims-vol2", "aiims volume 2.pdf"),
    ("aiims-vol3", "aiims volume 3 - additional protocols .pdf"),
    ("fanaroff-martin", None),
    ("volpe", None),
]


def resolve_path(short, filename):
    if filename:
        return os.path.join(ROOT, filename)
    patterns = {
        "cloherty-stark": "Cloherty*.pdf",
        "fanaroff-martin": "Fanaroff*.pdf",
        "volpe": "Volpe*.pdf",
    }
    matches = glob.glob(os.path.join(ROOT, patterns[short]))
    if not matches:
        raise FileNotFoundError(f"No file matching {patterns[short]}")
    return matches[0]


def extract_chapters(doc):
    toc = doc.get_toc()
    n = doc.page_count
    kept = []
    for level, title, page in toc:
        title_clean = title.strip()
        if page < 1 or page > n:
            continue
        if BOILERPLATE_RE.match(title_clean):
            continue
        kept.append((level, title_clean, page))

    if not kept:
        return [{"title": "Full text (no chapter outline available)", "level": 1, "pageStart": 1, "pageEnd": n}]

    chapters = []
    for i, (level, title, page) in enumerate(kept):
        end = (kept[i + 1][2] - 1) if i + 1 < len(kept) else n
        if end < page:
            end = page
        chapters.append({"title": title, "level": level, "pageStart": page, "pageEnd": end})
    return chapters


def extract_pages(doc):
    pages = []
    for i in range(doc.page_count):
        try:
            text = repair(doc[i].get_text("text"))
        except Exception as e:
            text = ""
            print(f"    WARN: page {i+1} text extraction failed: {e}")
        pages.append({"page": i + 1, "text": text})
    return pages


def main():
    only = sys.argv[1:] if len(sys.argv) > 1 else None
    summary = []
    for short, filename in RESOURCES:
        if only and short not in only:
            continue
        path = resolve_path(short, filename)
        print(f"=== {short}  ({os.path.basename(path)}) ===")
        doc = pymupdf.open(path)
        n = doc.page_count

        pages = extract_pages(doc)
        chapters = extract_chapters(doc)

        json.dump(pages, open(os.path.join(OUT_DIR, f"{short}_pages.json"), "w"))
        json.dump(chapters, open(os.path.join(OUT_DIR, f"{short}_chapters.json"), "w"), indent=2)

        total_chars = sum(len(p["text"]) for p in pages)
        print(f"    {n} pages, {total_chars:,} chars extracted, {len(chapters)} chapters")
        summary.append({"shortName": short, "pages": n, "chars": total_chars, "chapters": len(chapters)})
        doc.close()

    print("\n" + "=" * 60)
    print(f"{'RESOURCE':<20}{'PAGES':<8}{'CHARS':<12}{'CHAPTERS'}")
    for s in summary:
        print(f"{s['shortName']:<20}{s['pages']:<8}{s['chars']:<12,}{s['chapters']}")


if __name__ == "__main__":
    main()
