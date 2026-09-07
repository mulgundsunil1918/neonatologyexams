#!/usr/bin/env python3
"""
Phase 2b: group occurrences into MASTER QUESTIONS (Part 2 of the project spec) and run the
exact/near-exact-text repetition tiering (Part 7) — RED (3+) / ORANGE (2x) / WHITE (1x, no
repeat found).

IMPORTANT — what this script does NOT do: YELLOW classification (same clinical concept, different
wording/format) requires comparing diagnosis/mechanism/management/investigation/drug/threshold
concepts, not text similarity — the spec explicitly warns against a superficial-text approach for
it. This script groups by normalized-text equality only (a safe, deterministic, mechanical step),
so every group it finds is a GENUINE same-wording repeat. Concept-level YELLOW linking across
these WHITE-tier master questions is a separate follow-up pass (semantic, needs review) and is
left as "PENDING_CONCEPT_REVIEW" here rather than guessed.
"""
import sys, os, json, hashlib
sys.path.insert(0, os.path.dirname(__file__))
from normalize import fold

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def question_fold_key(o):
    opt_text = " ".join(sorted(x["text"] for x in o["options"])) if o["options"] else \
               " ".join(sorted(x["text"] for x in o.get("sub_parts", [])))
    return fold(o["stem"] + " || " + opt_text)


def main():
    occ = json.load(open(os.path.join(ROOT, "data", "extracted", "occurrences.json")))

    groups = {}
    for i, o in enumerate(occ):
        key = question_fold_key(o)
        groups.setdefault(key, []).append(i)

    master_questions = []
    for gi, (key, idxs) in enumerate(sorted(groups.items(), key=lambda kv: -len(kv[1])), start=1):
        qid = f"Q{gi:06d}"
        n = len(idxs)
        tier = "RED" if n >= 3 else ("ORANGE" if n == 2 else "WHITE")
        occurrences = []
        for i in idxs:
            o = occ[i]
            occurrences.append({
                "sitting_id": o["sitting_id"], "paper_no": o["paper_no"],
                "paper_type": o["paper_type"], "original_qnum": o["original_qnum"],
                "extraction_method": o["extraction_method"],
            })
        rep = occ[idxs[0]]
        master_questions.append({
            "q_id": qid,
            "repetition_tier": tier,
            "yellow_concept_review": "PENDING" if tier == "WHITE" else "N/A",
            "occurrence_count": n,
            "paper_type": rep["paper_type"],
            "stem": rep["stem"],
            "options": rep["options"],
            "sub_parts": rep.get("sub_parts", []),
            "has_image": any(occ[i]["has_image"] for i in idxs),
            "has_table": any(occ[i].get("has_table") for i in idxs),
            "flaw_note": rep.get("flaw_note"),
            "confidence_status": rep.get("confidence_status", "SOURCE_CONFIRMED"),
            "occurrences": occurrences,
        })

    os.makedirs(os.path.join(ROOT, "data", "master"), exist_ok=True)
    with open(os.path.join(ROOT, "data", "master", "master_questions.json"), "w") as f:
        json.dump(master_questions, f, indent=2)

    tier_counts = {"RED": 0, "ORANGE": 0, "WHITE": 0}
    tier_occurrences = {"RED": 0, "ORANGE": 0, "WHITE": 0}
    for mq in master_questions:
        tier_counts[mq["repetition_tier"]] += 1
        tier_occurrences[mq["repetition_tier"]] += mq["occurrence_count"]

    print("REPETITION AUDIT (exact/near-exact text match only — see docstring re: YELLOW)")
    print("-" * 60)
    for t in ("RED", "ORANGE", "WHITE"):
        print(f"{t:<8} master questions: {tier_counts[t]:<6} occurrences: {tier_occurrences[t]}")
    print("-" * 60)
    total_master = len(master_questions)
    total_occ = sum(tier_occurrences.values())
    print(f"TOTAL UNIQUE MASTER QUESTIONS: {total_master}")
    print(f"ALL ORIGINAL QUESTION OCCURRENCES: {total_occ}")
    print(f"(cross-check against extraction total: {len(occ)}  {'MATCH' if total_occ==len(occ) else 'MISMATCH!!'})")

    print(f"\nTop 10 RED (repeated 3+) master questions by occurrence count:")
    reds = [mq for mq in master_questions if mq["repetition_tier"] == "RED"]
    for mq in sorted(reds, key=lambda m: -m["occurrence_count"])[:10]:
        where = ", ".join(f"{o['sitting_id']}-P{o['paper_no']}-Q{o['original_qnum']}" for o in mq["occurrences"])
        print(f"  {mq['q_id']} ({mq['occurrence_count']}x): {mq['stem'][:75]!r}")
        print(f"      -> {where}")

    return master_questions, occ


if __name__ == "__main__":
    main()
