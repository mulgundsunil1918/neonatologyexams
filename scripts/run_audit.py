#!/usr/bin/env python3
"""
npm run audit (Part 26 / Part 27 of the project spec).
Produces /audit/*.json and prints the console summary in the exact format the spec requires.
Exits non-zero ("FAILURE") if any critical value is non-zero.
"""
import sys, os, json, collections
sys.path.insert(0, os.path.dirname(__file__))
from paper_registry import SITTINGS, QBANK_FILE

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AUDIT_DIR = os.path.join(ROOT, "audit")
os.makedirs(AUDIT_DIR, exist_ok=True)


def main():
    occ = json.load(open(os.path.join(ROOT, "data", "extracted", "occurrences.json")))
    mq = json.load(open(os.path.join(ROOT, "data", "master", "master_questions.json")))

    n_papers = sum(len(s["papers"]) for s in SITTINGS)
    n_extracted = len(occ)
    n_unique = len(mq)
    n_assigned = sum(m["occurrence_count"] for m in mq)  # every occurrence belongs to exactly one master q
    n_unassigned = n_extracted - n_assigned  # must be 0 by construction, checked explicitly below

    tier_counts = collections.Counter(m["repetition_tier"] for m in mq)

    # Option-letter census (MCQ only)
    letter_census = collections.Counter()
    missing_options = 0
    missing_answer = 0
    missing_qbank_page_ref = 0  # every occurrence carries its QBank page range by construction;
                                 # checked explicitly rather than assumed.
    # "source citation" in the textbook/protocol sense (Part 1: book, edition, chapter, page) is a
    # SEPARATE, not-yet-run pass — every occurrence lacks one right now, and this is reported
    # honestly as such rather than conflated with having a QBank page reference.
    missing_textbook_citation = 0
    mcq_total = 0
    for o in occ:
        if o["paper_type"] != "MCQ":
            continue
        mcq_total += 1
        if len(o["options"]) == 0:
            missing_options += 1
        else:
            for x in o["options"]:
                letter_census[x["letter"]] += 1
        if not o.get("answer"):
            missing_answer += 1
        if not o.get("source_pages"):
            missing_qbank_page_ref += 1
        if not o.get("book_citation"):
            missing_textbook_citation += 1

    # duplicate RECORD check: no occurrence should appear in two different master-question groups
    seen_occ_keys = set()
    duplicate_records = 0
    for m in mq:
        for o in m["occurrences"]:
            k = (o["sitting_id"], o["paper_no"], o["original_qnum"])
            if k in seen_occ_keys:
                duplicate_records += 1
            seen_occ_keys.add(k)

    report = {
        "files_processed": 1,
        "source_file": QBANK_FILE,
        "papers_processed": n_papers,
        "questions_extracted": n_extracted,
        "question_occurrences": n_extracted,
        "unique_master_questions": n_unique,
        "repetition_tiers": {
            "RED": tier_counts.get("RED", 0),
            "ORANGE": tier_counts.get("ORANGE", 0),
            "YELLOW": tier_counts.get("YELLOW", 0),
            "WHITE": tier_counts.get("WHITE", 0),
        },
        "yellow_tier_status": "NOT YET RUN — requires concept-level (not text-similarity) review; "
                               "see docstring in build_master_questions.py. All non-repeated questions "
                               "currently sit in WHITE pending that pass.",
        "assigned": n_assigned,
        "unassigned": n_unassigned,
        "missing": 0,
        "duplicate_records": duplicate_records,
        "mcq_total": mcq_total,
        "options_parsed_by_letter": dict(letter_census),
        "questions_with_missing_options": missing_options,
        "questions_without_answer": missing_answer,
        "questions_without_qbank_page_ref": missing_qbank_page_ref,
        "questions_without_textbook_citation": missing_textbook_citation,
    }
    json.dump(report, open(os.path.join(AUDIT_DIR, "question-count-report.json"), "w"), indent=2)

    # duplicate-questions.json: the ORANGE/RED groups (genuine verbatim repeats across sittings)
    dup_groups = [m for m in mq if m["repetition_tier"] in ("RED", "ORANGE")]
    json.dump(dup_groups, open(os.path.join(AUDIT_DIR, "duplicate-questions.json"), "w"), indent=2)

    # missing-questions.json: always empty at this stage because the extractor hard-stops on any
    # per-paper mismatch before this script can even run — kept as a file so the pipeline shape
    # matches the spec, and so a future ingestion that DOES fail some paper has somewhere to land.
    json.dump([], open(os.path.join(AUDIT_DIR, "missing-questions.json"), "w"), indent=2)

    # answer-review.json: every MCQ occurrence without a sourced answer, for the next phase
    # (cross-referencing against the textbook/protocol library) to work through.
    no_answer = [{"sitting_id": o["sitting_id"], "paper_no": o["paper_no"], "original_qnum": o["original_qnum"],
                  "stem": o["stem"]} for o in occ if o["paper_type"] == "MCQ" and not o.get("answer")]
    json.dump(no_answer, open(os.path.join(AUDIT_DIR, "answer-review.json"), "w"), indent=2)

    # source-errors.json: placeholder — no source-citation pass has run yet (that requires the
    # textbook library to be ingested first); recorded explicitly rather than silently omitted.
    json.dump({"status": "NOT YET RUN — textbook/protocol library not yet ingested; "
                          "no question has a book-chapter citation yet."},
              open(os.path.join(AUDIT_DIR, "source-errors.json"), "w"), indent=2)

    print("=====================================")
    print("NNF QBANK AUDIT")
    print("=====================================\n")
    print(f"Files processed: {report['files_processed']} ({QBANK_FILE})")
    print(f"Papers processed: {n_papers}\n")
    print(f"Questions extracted: {n_extracted}")
    print(f"Question occurrences: {n_extracted}")
    print(f"Unique questions: {n_unique}\n")
    print(f"Red: {report['repetition_tiers']['RED']}")
    print(f"Orange: {report['repetition_tiers']['ORANGE']}")
    print(f"Yellow: {report['repetition_tiers']['YELLOW']}  (NOT YET RUN — see note below)")
    print(f"White: {report['repetition_tiers']['WHITE']}  (includes all Yellow-pending questions)\n")
    print(f"Assigned: {n_assigned}")
    print(f"Unassigned: {n_unassigned}\n")
    print(f"Missing: 0")
    print(f"Duplicate records: {duplicate_records}\n")
    print("Options parsed:")
    for letter in "ABCDE":
        print(f"  {letter}: {letter_census.get(letter, 0)}")
    print(f"\nQuestions with missing options: {missing_options}")
    print(f"\nQuestions without answer: {missing_answer}  (expected — see /audit/answer-review.json; "
          f"only the 2024-04 sitting ships a printed key)")
    print(f"\nQuestions without QBank page reference: {missing_qbank_page_ref}")
    print(f"Questions without TEXTBOOK/PROTOCOL citation: {missing_textbook_citation} / {mcq_total} MCQ "
          f"(book-chapter sourcing pass not yet run — this is expected at this stage, not a defect)")
    print("\n=====================================")

    critical_fail = (n_unassigned != 0) or (duplicate_records != 0) or (missing_options != 0) \
                    or (missing_qbank_page_ref != 0)
    if critical_fail:
        print("RESULT: FAILURE — a critical value above is non-zero.")
        sys.exit(1)
    else:
        print("RESULT: PASS on all zero-loss / zero-duplicate / zero-missing-option checks.")
        print("(Yellow concept-tiering and book-sourced answers are separate follow-on passes, not failures.)")


if __name__ == "__main__":
    main()
