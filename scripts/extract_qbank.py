#!/usr/bin/env python3
"""
Phase 2 ingestion: extract every question from the NNF QBank into structured JSON,
with a hard per-paper validation gate (Part 3 / Part 27 of the project spec:
"If Extracted != Assigned, STOP and report the discrepancy").

Output: data/extracted/occurrences.json  (one row per ORIGINAL paper occurrence —
        the same question appearing in 3 papers yields 3 occurrence records here;
        master-question de-duplication happens in a later pass, deliberately kept
        separate so this stage's only job is "did we get every original question".)
"""
import sys, os, json, re, hashlib
sys.path.insert(0, os.path.dirname(__file__))
import pymupdf
from normalize import repair, clean
from paper_registry import SITTINGS, QBANK_FILE, QBANK_MD5, BLANK_PAGES

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
QBANK_PATH = os.path.join(ROOT, QBANK_FILE)

# ---- known OCR/typography quirks, applied as literal text substitutions before splitting ----
# Keyed by (sitting_id, paper_no) -> list of (find, replace) applied to the whole paper's raw text.
QNUM_TEXT_FIXES = {
    ("2019-10", 1): [
        ("5 9:A 2-day-old", "59. A 2-day-old"),
        ("9 3.Normal cardiac", "93. Normal cardiac"),
    ],
    ("2025-10", 2): [
        ("27 Syndrome of inappropriate", "27. Syndrome of inappropriate"),
    ],
}

# Page-furniture blocks that look like numbered/lettered questions but are NOT exam content
# (format-instruction "sample" blocks). Stripped verbatim before question splitting.
PREAMBLE_STRIPS = {
    ("2025-10", 2): [
        "Sample question  \nA. Capital of India  \n1. Delhi  \n2. Bombay  \n3. Chennai \n4. Trivandrum  \n \n",
    ],
}

OPTION_LETTERS = "ABCDE"
QNUM_RE = re.compile(r'(?m)^[ \t]*(\d{1,3})[ \t]*[\.\)][ \t]*')
OPT_RE = re.compile(r'(?m)^[ \t]*([A-Ea-e])[ \t]*[\.\),][ \t]*')
# 2019-10 Paper 2 (Theory) uses "Q1." / "Q.2." style main-question numbering instead of a bare digit.
QNUM_RE_Q_PREFIX = re.compile(r'(?m)^[ \t]*Q[ \t]*\.?[ \t]*(\d{1,3})[\.\)][ \t]*')
Q_PREFIX_PAPERS = {("2019-10", 2)}


def load_pdf():
    d = pymupdf.open(QBANK_PATH)
    real_md5 = hashlib.md5(open(QBANK_PATH, 'rb').read()).hexdigest()
    if real_md5 != QBANK_MD5:
        raise SystemExit(f"FATAL: QBank file changed on disk (md5 {real_md5} != registry {QBANK_MD5}). "
                          f"Registry page mapping is no longer trustworthy — re-verify before ingesting.")
    return d


def page_range_text(doc, a, b):
    return repair("\n".join(doc[i].get_text("text") for i in range(a - 1, b)))


def split_questions(raw_text, expected_n, sitting_id, paper_no):
    for find, repl in QNUM_TEXT_FIXES.get((sitting_id, paper_no), []):
        raw_text = raw_text.replace(find, repl)
    for block in PREAMBLE_STRIPS.get((sitting_id, paper_no), []):
        raw_text = raw_text.replace(block, "")

    qnum_re = QNUM_RE_Q_PREFIX if (sitting_id, paper_no) in Q_PREFIX_PAPERS else QNUM_RE
    matches = list(qnum_re.finditer(raw_text))

    # Pass 1: decide which matches are REAL question markers vs stray numbers embedded in a
    # question's own body (e.g. a matching-question's "1. TGA / 2. HLHS" sub-list, or a mark
    # allocation). Require a strictly increasing sequence of accepted numbers.
    accepted_idx = []
    last = 0
    for i, m in enumerate(matches):
        num = int(m.group(1))
        if num == last + 1:
            accepted_idx.append(i)
            last = num
        elif num > last and num <= expected_n and not accepted_idx:
            accepted_idx.append(i)
            last = num
        # else: reject — a stray number inside a body, not a new question.

    # Pass 2: NOW slice bodies using only the accepted matches as boundaries, so a rejected
    # stray number in between does not truncate the real question's body.
    filtered = []
    for j, i in enumerate(accepted_idx):
        m = matches[i]
        num = int(m.group(1))
        start = m.end()
        end = matches[accepted_idx[j + 1]].start() if j + 1 < len(accepted_idx) else len(raw_text)
        body = raw_text[start:end].strip()
        filtered.append((num, body))
    return filtered


def split_options(body):
    matches = list(OPT_RE.finditer(body))
    if not matches:
        return body.strip(), []
    stem = body[:matches[0].start()].strip()
    opts = []
    for i, m in enumerate(matches):
        letter = m.group(1).upper()
        start = m.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(body)
        text = clean(body[start:end])
        if text:  # drop vestigial empty option lines present in the source PDF (e.g. a stray "E." with no text)
            opts.append({"letter": letter, "text": text})
    return clean(stem), opts


# ---- Hand-verified corrections for questions whose option lettering the source PDF renders
# irregularly (no punctuation after the letter, nested lettered sub-blocks, etc.) — confirmed
# against the raw extracted text by direct human review. Applied as a targeted post-processing
# step so the fix is auditable and does not loosen the general regex (which would risk silently
# corrupting the 790+ questions that already parse correctly).
MANUAL_OPTION_OVERRIDES = {
    ("2021-07", 2, 32): {
        "options": [
            {"letter": "A", "text": "Air bubble in the arterial sample"},
            {"letter": "B", "text": "Venous admixture"},
            {"letter": "C", "text": "Excess heparin"},
            {"letter": "D", "text": "All the above"},
        ]
    },
    ("2021-07", 2, 35): {
        "options": [
            {"letter": "A", "text": "Lability"},
            {"letter": "B", "text": "Response to NO"},
            {"letter": "C", "text": "SpO2 difference of 10% between right upper limb and lower limb"},
            {"letter": "D", "text": "BP difference of 10mmHg right upper limb and lower limb"},
        ]
    },
    ("2021-07", 2, 39): {
        "options": [
            {"letter": "A", "text": "Main source of IL is soybean oil"},
            {"letter": "B", "text": "20% solution has higher ratio of phospholipids to triglycerides than 10% solution"},
            {"letter": "C", "text": "Can be infused via a peripheral vein"},
            {"letter": "E", "text": "IL should not be frozen"},
        ],
        "flaw_note": "Source paper's option list skips 'D' — goes A, B, C, E. Preserved as printed in the original exam paper; not a parsing error.",
        "confidence_status": "QUESTION_OPTION_FLAWED",
    },
    ("2021-07", 2, 73): {
        "options": [
            {"letter": "A", "text": "Periventricular haemorrhages occur in 25% of very low birth weight infants."},
            {"letter": "B", "text": "Bleeds into the germinal matrix are unlikely to be associated with long term sequelae"},
            {"letter": "C", "text": "Most haemorrhages occur in the first 72 hours of life."},
            {"letter": "D", "text": "Ischaemic lesions are easily detected in the paraventricular area."},
        ]
    },
    ("2021-07", 2, 74): {
        "options": [
            {"letter": "A", "text": "Hereditary spherocytosis"},
            {"letter": "B", "text": "Glucose 6 phosphate dehydrogenase deficiency"},
            {"letter": "C", "text": "ABO incompatibility"},
            {"letter": "D", "text": "Vitamin K1 deficiency"},
        ]
    },
    ("2021-07", 2, 75): {
        "options": [
            {"letter": "A", "text": "Blood flows from right to left through the foramen ovale."},
            {"letter": "B", "text": "Blood in the ascending aorta has a higher oxygen content than in the descending aorta."},
            {"letter": "C", "text": "The ductus arteriosus is closed."},
            {"letter": "D", "text": "The haemoglobin may be 20g/dl."},
        ]
    },
    ("2021-10", 2, 92): {
        "stem": "Kindly match following national health programmes with their aims. Items: 1. MAA  2. SUMAN  3. LaQshya  4. Dakshata. Descriptions: A. Assured delivery of quality healthcare services to any woman and newborn visiting a public health facility to end maternal and newborn deaths and morbidities  B. Empowering health care Providers for Improved MNH Care during Institutional Deliveries  C. Nationwide programme to promote breastfeeding and provision of counselling services for supporting breastfeeding  D. A quality improvement initiative in labour room & maternity OT, aimed at improving quality of care for mothers and newborn during intrapartum and immediate post-partum period.",
        "options": [
            {"letter": "A", "text": "1a, 2b, 3c, 4d"},
            {"letter": "B", "text": "1c, 2b, 3d, 4a"},
            {"letter": "C", "text": "1c, 2a, 3d, 4b"},
            {"letter": "D", "text": "1d, 2c, 3a, 4b"},
        ],
        "has_table": True,
    },
    ("2021-10", 2, 95): {
        "options": [
            {"letter": "A", "text": "Type A"},
            {"letter": "B", "text": "Type C"},
            {"letter": "C", "text": "Type E"},
            {"letter": "D", "text": "Type D"},
        ],
        "has_image": True,
    },
    ("2021-10", 2, 96): {
        "options": [
            {"letter": "A", "text": "It is an IQ test"},
            {"letter": "B", "text": "It can be used till the age of 6 years"},
            {"letter": "C", "text": "It is not a predictor of later development"},
            {"letter": "D", "text": "It assesses child social skills as well"},
        ],
        "has_image": True,
    },
    ("2025-10", 2, 24): {
        "options": [
            {"letter": "A", "text": "Stage 3"},
            {"letter": "B", "text": "Stage 2"},
            {"letter": "C", "text": "Stage 4 A"},
            {"letter": "D", "text": "Stage 4 B"},
        ]
    },
}


def apply_manual_overrides(occurrences):
    applied = []
    for o in occurrences:
        key = (o["sitting_id"], o["paper_no"], o["original_qnum"])
        if key in MANUAL_OPTION_OVERRIDES:
            fix = MANUAL_OPTION_OVERRIDES[key]
            if "stem" in fix:
                o["stem"] = fix["stem"]
            o["options"] = fix["options"]
            if fix.get("has_image"):
                o["has_image"] = True
            if fix.get("has_table"):
                o["has_table"] = True
            if fix.get("flaw_note"):
                o["flaw_note"] = fix["flaw_note"]
            o["confidence_status"] = fix.get("confidence_status", "SOURCE_CONFIRMED_MANUAL_FIX")
            applied.append(key)
    return applied


def main():
    doc = load_pdf()
    occurrences = []
    paper_reports = []
    fatal_errors = []

    for sitting in SITTINGS:
        for paper in sitting["papers"]:
            sid, pno, ptype = sitting["sitting_id"], paper["paper_no"], paper["paper_type"]
            expected = paper["n_main_questions"]

            if paper.get("manual_transcript"):
                mpath = os.path.join(ROOT, paper["manual_transcript"])
                if not os.path.exists(mpath):
                    fatal_errors.append(f"{sid} P{pno}: manual_transcript file missing: {mpath}")
                    paper_reports.append({"sitting": sid, "paper": pno, "type": ptype,
                                           "expected": expected, "found": 0, "status": "MISSING_MANUAL_FILE"})
                    continue
                mdata = json.load(open(mpath))
                found = len(mdata["questions"])
                for q in mdata["questions"]:
                    raw_subparts = q.get("sub_parts", [])
                    occurrences.append({
                        "sitting_id": sid, "paper_no": pno, "paper_type": ptype,
                        "original_qnum": q["qnum"], "stem": q["stem"],
                        "options": [] if ptype == "THEORY" else q.get("options", []),
                        "sub_parts": [{"letter": sp["label"].upper(), "text": sp["text"]} for sp in raw_subparts]
                                     if ptype == "THEORY" else [],
                        "answer": q.get("answer"), "source_pages": paper["primary"],
                        "extraction_method": "manual_vision_transcription",
                        "has_image": q.get("has_image", False),
                    })
                status = "OK" if found == expected else "MISMATCH"
                paper_reports.append({"sitting": sid, "paper": pno, "type": ptype,
                                       "expected": expected, "found": found, "status": status})
                if status != "OK":
                    fatal_errors.append(f"{sid} P{pno}: manual transcript has {found}, expected {expected}")
                continue

            a, b = paper["primary"]
            raw = page_range_text(doc, a, b)
            blocks = split_questions(raw, expected, sid, pno)
            found = len(blocks)
            status = "OK" if found == expected else "MISMATCH"
            paper_reports.append({"sitting": sid, "paper": pno, "type": ptype,
                                   "expected": expected, "found": found, "status": status,
                                   "pages": f"{a}-{b}"})
            if status != "OK":
                fatal_errors.append(f"{sid} P{pno} (p{a}-{b}): extracted {found}, expected {expected} "
                                     f"— nums found: {[n for n,_ in blocks]}")
                continue

            for num, body in blocks:
                stem, opts = split_options(body)
                record = {
                    "sitting_id": sid, "paper_no": pno, "paper_type": ptype,
                    "original_qnum": num, "stem": stem,
                    "answer": None, "source_pages": [a, b],
                    "extraction_method": "text_parse",
                    "has_image": num in paper.get("images", []),
                    "has_table": num in paper.get("table_questions", []),
                }
                if ptype == "THEORY":
                    # Lettered a)/b)/c) blocks in a Theory paper are essay SUB-PARTS with mark
                    # allocations, not multiple-choice options — keep the schema honest about that.
                    record["options"] = []
                    record["sub_parts"] = opts
                else:
                    record["options"] = opts
                    record["sub_parts"] = []
                occurrences.append(record)

    applied_overrides = apply_manual_overrides(occurrences)

    os.makedirs(os.path.join(ROOT, "data", "extracted"), exist_ok=True)
    with open(os.path.join(ROOT, "data", "extracted", "occurrences.json"), "w") as f:
        json.dump(occurrences, f, indent=2)

    print(f"{'SITTING':<10}{'PAPER':<7}{'TYPE':<7}{'EXPECTED':<10}{'FOUND':<8}STATUS")
    print("-" * 60)
    total_expected = total_found = 0
    for r in paper_reports:
        print(f"{r['sitting']:<10}{r['paper']:<7}{r['type']:<7}{r['expected']:<10}{r['found']:<8}{r['status']}")
        total_expected += r["expected"]
        total_found += r["found"]
    print("-" * 60)
    print(f"{'TOTAL':<24}{total_expected:<10}{total_found:<8}{'OK' if total_expected==total_found else 'MISMATCH'}")

    print(f"\nManual option-overrides applied: {len(applied_overrides)} / {len(MANUAL_OPTION_OVERRIDES)} defined")
    for k in MANUAL_OPTION_OVERRIDES:
        if k not in applied_overrides:
            print(f"  WARNING: override defined for {k} but no matching occurrence found — key may be stale")
    print(f"\nTotal occurrence records written: {len(occurrences)}")
    print(f"Output: data/extracted/occurrences.json")

    if fatal_errors:
        print("\n" + "=" * 60)
        print("FATAL: extraction/assignment mismatch detected. STOPPING per zero-loss rule.")
        print("=" * 60)
        for e in fatal_errors:
            print(" - " + e)
        sys.exit(1)
    else:
        print("\nAll papers: Extracted == Expected. Zero-loss check PASSED at page-and-paper level.")


if __name__ == "__main__":
    main()
