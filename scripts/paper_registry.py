"""
CANONICAL STRUCTURAL MAP of "NNF Fellowship All QBANK till 2026 (1).pdf" (276 pages, md5 a210aea3148266dd30b1fadad4a7c98f)

Built by manual page-by-page forensic verification (not just automated heuristics):
- Every duplicate block below was confirmed by exact-hash text comparison (see audit/dup_blocks.json).
- Every "scanned image" block was confirmed by human (vision) transcription against the corresponding
  clean-text pages, OR — where no clean-text twin exists — fully transcribed by hand (April 2024 sitting).
- Boundaries were verified against actual page content, not assumed from page-count arithmetic.

Each sitting = one real-world NNF exam date. "papers" lists the physical paper(s) within that sitting.
"primary" = the page range treated as the canonical source of the question text.
"dup_text" = other page ranges containing the IDENTICAL text (verified by MD5 of whitespace-collapsed text).
"dup_scan" = page ranges that are a re-scanned IMAGE of the same paper (verified by manual transcription
             matching the primary text verbatim, or near-verbatim allowing for handwritten exam markings).
"manual_transcript" = paper has NO clean-text source anywhere in the PDF; the question bank JSON was
             produced by direct human transcription of the scanned pages (see data/manual/*.json).
"qnum_fixes" = known OCR/typography quirks in the primary text that break naive "N." detection but were
             confirmed present on manual review (not lost). Recorded so the parser can special-case them
             instead of silently dropping the question OR being loosened in a way that risks false
             positives elsewhere.
"n_main_questions" = manually verified count of top-level numbered questions/items in that paper (for
             Theory papers, "sub_parts_note" explains where the format is essay-with-lettered-subparts
             rather than 50/100 independently-numbered MCQs).
"blank_pages" = pages confirmed visually blank (page-number footer only) — accounted for, not data loss.
"no_answer_key_expected" = True for essay/theory papers (graded by hand in the original exam, no MCQ key).
"answer_key_pages" = page range holding a lettered answer key, when present in-source.
"images" = pages known to contain a question-embedded figure/table/ECG/MRI etc. that must be preserved as
           an image asset, not flattened to text-only.
"sitting_label" = human-readable identity used throughout the app / citations.
"table_questions" = questions whose content includes a data table (e.g. 2x2 contingency table) that must
           render as a table, not run-on prose.
"format_note" = free-text notes on exam format quirks specific to that sitting (e.g. inverted paper order).
"""

QBANK_FILE = "NNF Fellowship All QBANK till 2026 (1).pdf"
QBANK_MD5 = "a210aea3148266dd30b1fadad4a7c98f"
QBANK_TOTAL_PAGES = 276

SITTINGS = [
    {
        "sitting_id": "2019-10",
        "sitting_label": "NNF Doctor's Fellowship Exit Examination, October 2019",
        "format_note": "Paper order is INVERTED vs all later sittings: Paper 1 = MCQ (100Q), Paper 2 = Theory.",
        "papers": [
            {
                "paper_no": 1, "paper_type": "MCQ",
                "primary": (1, 20), "dup_text": [], "dup_scan": [],
                "n_main_questions": 100,
                "qnum_fixes": {59: "OCR split as '5 9:A 2-day-old...' (space+colon) — content present, verified p1-20 raw text.",
                               93: "OCR split as '9 3.Normal cardiac output...' (space-split digits) — content present."},
                "answer_key_pages": None, "no_answer_key_expected": False,
            },
            {
                "paper_no": 2, "paper_type": "THEORY",
                "primary": (21, 22), "dup_text": [], "dup_scan": [],
                "n_main_questions": 4,
                "sub_parts_note": "Q1 (a-e), Q2 (a-h), Q3 (single), Q4 (a-b) — numbered 'Q1.' / 'Q.2.' style, not plain digit.",
                "no_answer_key_expected": True,
            },
        ],
    },
    {
        "sitting_id": "2022-04",
        "sitting_label": "NNF Fellowship Examination, April 2022",
        "papers": [
            {
                "paper_no": 1, "paper_type": "THEORY",
                "primary": (23, 24), "dup_text": [], "dup_scan": [(161, 163)],
                "n_main_questions": 10, "no_answer_key_expected": True,
            },
            {
                "paper_no": 2, "paper_type": "MCQ",
                "primary": (25, 35), "dup_text": [], "dup_scan": [(164, 174)],
                "n_main_questions": 50,
                "images": [48],  # Q48: ECG tracing (electrolyte disturbance) — seen on dup_scan p174, applies to primary too
                "format_note": "dup_scan p164-174 is a hand-marked candidate answer script (checkmarks/circles) of this same paper.",
            },
        ],
    },
    {
        "sitting_id": "2021-07",
        "sitting_label": "NNF Fellowship Examination, 22nd July 2021",
        "papers": [
            {
                "paper_no": 2, "paper_type": "MCQ",
                "primary": (36, 57), "dup_text": [(106, 127)], "dup_scan": [],
                "n_main_questions": 100,
            },
            {
                "paper_no": 1, "paper_type": "THEORY",
                "primary": (58, 60), "dup_text": [(103, 105)], "dup_scan": [(128, 129)],
                "n_main_questions": 10, "no_answer_key_expected": True,
            },
        ],
    },
    {
        "sitting_id": "2021-10",
        "sitting_label": "NNF Fellowship Exit Exam, 21st October 2021",
        "papers": [
            {
                "paper_no": 2, "paper_type": "MCQ",
                "primary": (61, 80), "dup_text": [(81, 100)], "dup_scan": [(130, 149)],
                "n_main_questions": 100,
                "images": [149],  # Q100: neonatal MRI (HIE) figure
            },
            {
                "paper_no": 1, "paper_type": "THEORY",
                "primary": (101, 102), "dup_text": [], "dup_scan": [],
                "n_main_questions": 10, "no_answer_key_expected": True,
            },
        ],
    },
    {
        "sitting_id": "2022-10",
        "sitting_label": "NNF Fellowship Examination, October 2022",
        "papers": [
            {
                "paper_no": 1, "paper_type": "THEORY",
                "primary": (150, 151), "dup_text": [], "dup_scan": [],
                "n_main_questions": 10, "no_answer_key_expected": True,
            },
            {
                "paper_no": 2, "paper_type": "MCQ",
                "primary": (152, 160), "dup_text": [], "dup_scan": [],
                "n_main_questions": 50,
            },
        ],
    },
    {
        "sitting_id": "2023-04",
        "sitting_label": "NNF Fellowship Examination, April 2023",
        "papers": [
            {
                "paper_no": 1, "paper_type": "THEORY",
                "primary": (175, 177), "dup_text": [], "dup_scan": [],
                "n_main_questions": 10, "no_answer_key_expected": True,
            },
            {
                "paper_no": 2, "paper_type": "MCQ",
                "primary": (178, 185), "dup_text": [], "dup_scan": [],
                "n_main_questions": 50,
            },
        ],
    },
    {
        "sitting_id": "2023-10",
        "sitting_label": "NNF Fellowship for Doctors, October 2023 Examination",
        "papers": [
            {
                "paper_no": 1, "paper_type": "THEORY",
                "primary": (186, 188), "dup_text": [], "dup_scan": [],
                "n_main_questions": 9,
                "format_note": "Verified complete at Q9 (text ends cleanly, no truncation). This paper genuinely has 9 main questions, not 10.",
                "no_answer_key_expected": True,
            },
            {
                "paper_no": 2, "paper_type": "MCQ",
                "primary": (193, 200), "dup_text": [], "dup_scan": [],
                "n_main_questions": 50,
                "images": [195],  # Q16: lung-ultrasound waveform image referenced in stem
            },
        ],
    },
    {
        "sitting_id": "2024-04",
        "sitting_label": "NNF Fellowship for Doctors, April 2024 Examination",
        "format_note": "NEW SITTING recovered from scanned-image pages with NO clean-text duplicate anywhere else "
                        "in the PDF. Fully hand-transcribed from page images; see data/manual/*.json.",
        "papers": [
            {
                "paper_no": 1, "paper_type": "THEORY",
                "primary": (189, 192), "dup_text": [], "dup_scan": [],
                "manual_transcript": "data/manual/2024-04_paper1_theory.json",
                "n_main_questions": 11, "no_answer_key_expected": True,
            },
            {
                "paper_no": 2, "paper_type": "MCQ",
                "primary": (201, 208), "dup_text": [], "dup_scan": [],
                "manual_transcript": "data/manual/2024-04_paper2_mcq.json",
                "n_main_questions": 50,
                "answer_key_pages": (209, 210),
            },
        ],
    },
    {
        "sitting_id": "2025-04",
        "sitting_label": "NNF Clinical Fellowship for Doctors, 25th April 2025",
        "papers": [
            {
                "paper_no": 1, "paper_type": "THEORY",
                "primary": (211, 213), "dup_text": [], "dup_scan": [],
                "n_main_questions": 10, "no_answer_key_expected": True,
            },
            {
                "paper_no": 2, "paper_type": "MCQ",
                "primary": (214, 228), "dup_text": [], "dup_scan": [],
                "n_main_questions": 50,
            },
        ],
    },
    {
        "sitting_id": "2025-10",
        "sitting_label": "Clinical Fellowship in Neonatology for Doctors, October 2025",
        "papers": [
            {
                "paper_no": 1, "paper_type": "THEORY",
                "primary": (229, 231), "dup_text": [], "dup_scan": [(246, 248)],
                "n_main_questions": 10, "no_answer_key_expected": True,
            },
            {
                "paper_no": 2, "paper_type": "MCQ",
                "primary": (232, 245), "dup_text": [], "dup_scan": [(249, 261)],
                "n_main_questions": 50,
                "qnum_fixes": {27: "OCR runs '27 Syndrome of inappropriate...' with no '.'/')' delimiter — content present."},
                "table_questions": [28],  # 2x2 oxygen/ROP contingency table
            },
        ],
    },
    {
        "sitting_id": "2026-04",
        "sitting_label": "Exit Exam for NNF Clinical Fellowship for Doctors, 24th April 2026",
        "papers": [
            {
                "paper_no": 1, "paper_type": "THEORY",
                "primary": (263, 265), "dup_text": [], "dup_scan": [],
                "n_main_questions": 10, "no_answer_key_expected": True,
            },
            {
                "paper_no": 2, "paper_type": "MCQ",
                "primary": (266, 276), "dup_text": [], "dup_scan": [],
                "n_main_questions": 50,
            },
        ],
    },
]

# Pages confirmed BLANK on visual inspection (page-number footer only) — zero content lost.
BLANK_PAGES = [20, 60, 105, 245, 262]

# All page ranges accounted for above, for the completeness cross-check in the audit script.
def all_accounted_ranges():
    ranges = []
    for s in SITTINGS:
        for p in s["papers"]:
            ranges.append(p["primary"])
            ranges.extend(p.get("dup_text", []))
            ranges.extend(p.get("dup_scan", []))
            if p.get("answer_key_pages"):
                ranges.append(p["answer_key_pages"])
    for pg in BLANK_PAGES:
        ranges.append((pg, pg))
    return ranges
