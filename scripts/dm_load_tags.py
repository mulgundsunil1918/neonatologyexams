#!/usr/bin/env python3
"""
Loads DmQuestionItem.topicTag values from one or more tag-batch JSON files (produced by the
tagging agents, each an array of {"id": "<DmQuestionItem.id>", "topicTag": "<tag>"}) into
app/dev.db, via stdlib sqlite3 directly — never Prisma migrate/push (standing project rule).

Usage: .venv/bin/python3 scripts/dm_load_tags.py recovered/consolidated/dm_paper1_batch*.json
"""
import sqlite3, json, os, sys, glob

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(ROOT, "app", "dev.db")


def main():
    patterns = sys.argv[1:]
    if not patterns:
        raise SystemExit("Usage: dm_load_tags.py <tag-batch-file.json> [more files/globs...]")

    paths = []
    for p in patterns:
        matches = glob.glob(p) if any(c in p for c in "*?[") else [p]
        paths.extend(matches)
    if not paths:
        raise SystemExit(f"No files matched: {patterns}")

    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()

    total, applied, missing_ids = 0, 0, []
    for path in sorted(paths):
        rows = json.load(open(path))
        for r in rows:
            total += 1
            cur.execute('UPDATE "DmQuestionItem" SET topicTag = ? WHERE id = ?', (r["topicTag"], r["id"]))
            if cur.rowcount == 1:
                applied += 1
            else:
                missing_ids.append(r["id"])
        print(f"{path}: {len(rows)} rows")

    con.commit()

    cur.execute('SELECT COUNT(*) FROM "DmQuestionItem" WHERE topicTag IS NOT NULL')
    n_tagged = cur.fetchone()[0]
    cur.execute('SELECT COUNT(*) FROM "DmQuestionItem"')
    n_total = cur.fetchone()[0]
    con.close()

    print(f"\nRows in input files: {total}")
    print(f"Rows actually updated (id found): {applied}")
    if missing_ids:
        print(f"IDs not found in DmQuestionItem ({len(missing_ids)}): {missing_ids[:10]}{'...' if len(missing_ids) > 10 else ''}")
    print(f"DmQuestionItem now tagged: {n_tagged} / {n_total}")


if __name__ == "__main__":
    main()
