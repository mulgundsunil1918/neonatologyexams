#!/usr/bin/env python3
"""
Loads data/dm_drnb/extracted.json (built by dm_extract.py) into app/dev.db, using the
stdlib sqlite3 module directly — never Prisma migrate/db push (this project's standing
rule: the FTS5 search tables were never Prisma-managed and always trigger a false drift
warning that threatens `migrate reset`, which would wipe the whole DB).

Deterministic IDs (sitting_id, "<sitting_id>-p<paperNo>", "<paperId>-<label>") rather than
random cuids, specifically so this script is idempotent — re-running it after a fix to
dm_extract.py replaces existing rows instead of duplicating them.
"""
import sqlite3, json, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(ROOT, "app", "dev.db")
EXTRACTED_PATH = os.path.join(ROOT, "data", "dm_drnb", "extracted.json")

PAPER_TITLES = {
    1: "Applied Basic Sciences as Applied to Neonatology and Perinatology; Research Methods",
    2: "Clinical Neonatology",
    3: "Clinical Neonatology and Neonatal Intensive Care including Neonatal Transport",
    4: "Community Neonatology, National MCH Programmes, Allied Disciplines, Neuro Development "
       "Follow up, Recent Advances, Rehabilitation etc.",
}

MONTH_NUM = {m: i + 1 for i, m in enumerate(
    "January February March April May June July August September October November December".split())}


def main():
    papers = json.load(open(EXTRACTED_PATH))
    bad = [p for p in papers if p["problems"]]
    if bad:
        raise SystemExit(f"Refusing to seed: {len(bad)} paper(s) still flagged in extracted.json. "
                          f"Fix dm_extract.py and re-run it first.")

    # Chronological sitting order: year, then month number. (De-duplicate: several papers
    # share the same sitting.)
    sittings = {}
    for p in papers:
        sittings[p["sitting_id"]] = {
            "id": p["sitting_id"],
            "label": f"{p['month']} {p['year']}",
            "session_note": p["session_note"],
            "sort_key": (p["year"], MONTH_NUM[p["month"]]),
        }
    ordered_sittings = sorted(sittings.values(), key=lambda s: s["sort_key"])

    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()

    cur.execute('DELETE FROM "DmBookmark"')  # FK-dependent children first
    cur.execute('DELETE FROM "DmAnswer"')
    cur.execute('DELETE FROM "DmQuestionItem"')
    cur.execute('DELETE FROM "DmPaper"')
    cur.execute('DELETE FROM "DmSitting"')

    for i, s in enumerate(ordered_sittings):
        cur.execute(
            'INSERT INTO "DmSitting" (id, label, sessionNote, sortOrder) VALUES (?, ?, ?, ?)',
            (s["id"], s["label"], s["session_note"], i),
        )

    n_papers, n_items = 0, 0
    for p in papers:
        paper_id = f"{p['sitting_id']}-p{p['paper_no']}"
        cur.execute(
            'INSERT INTO "DmPaper" (id, sittingId, paperNo, title, subCode, qpCode, examCode, '
            'sourceFile, sourcePage) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            (paper_id, p["sitting_id"], p["paper_no"], PAPER_TITLES[p["paper_no"]],
             p["sub_code"], p["qp_code"], p["exam_code"], p["source_file"], p["source_page"]),
        )
        n_papers += 1
        for item in p["items"]:
            item_id = f"{paper_id}-{item['label']}"
            cur.execute(
                'INSERT INTO "DmQuestionItem" (id, paperId, section, itemNo, label, text, marks, topicTag) '
                'VALUES (?, ?, ?, ?, ?, ?, ?, NULL)',
                (item_id, paper_id, item["section"], item["item_no"], item["label"],
                 item["text"], item["marks"]),
            )
            n_items += 1

    con.commit()

    # Post-write sanity check, not just a trust-the-script assertion.
    cur.execute('SELECT COUNT(*) FROM "DmSitting"')
    n_sittings = cur.fetchone()[0]
    cur.execute('SELECT COUNT(*) FROM "DmPaper"')
    n_papers_db = cur.fetchone()[0]
    cur.execute('SELECT COUNT(*) FROM "DmQuestionItem"')
    n_items_db = cur.fetchone()[0]
    con.close()

    print(f"Sittings: {n_sittings}")
    print(f"Papers:   {n_papers_db} (inserted {n_papers})")
    print(f"Items:    {n_items_db} (inserted {n_items})")
    assert n_papers_db == n_papers and n_items_db == n_items, "row count mismatch after insert"
    print("OK — dev.db seeded.")


if __name__ == "__main__":
    main()
