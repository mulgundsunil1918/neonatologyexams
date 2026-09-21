#!/usr/bin/env python3
"""
Loads DmAnswer rows from one or more answer-batch JSON files (produced by the model-answer
writing agents, each an array of {"id": "<DmQuestionItem.id>", "body": "<markdown answer>"})
into app/dev.db, via stdlib sqlite3 directly — never Prisma migrate/push.

Usage: .venv/bin/python3 scripts/dm_load_answers.py recovered/consolidated/dm_answers_2011-08-p1.json [...]
"""
import sqlite3, json, os, sys, glob, uuid

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(ROOT, "app", "dev.db")


def main():
    patterns = sys.argv[1:]
    if not patterns:
        raise SystemExit("Usage: dm_load_answers.py <answer-batch-file.json> [more files/globs...]")

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
            item_id, body = r["id"], r["body"]
            cur.execute('SELECT id FROM "DmQuestionItem" WHERE id = ?', (item_id,))
            if cur.fetchone() is None:
                missing_ids.append(item_id)
                continue
            cur.execute('SELECT id FROM "DmAnswer" WHERE itemId = ?', (item_id,))
            existing = cur.fetchone()
            if existing:
                cur.execute('UPDATE "DmAnswer" SET body = ? WHERE itemId = ?', (body, item_id))
            else:
                cur.execute(
                    'INSERT INTO "DmAnswer" (id, itemId, body) VALUES (?, ?, ?)',
                    (str(uuid.uuid4()), item_id, body),
                )
            applied += 1
        print(f"{path}: {len(rows)} rows")

    con.commit()

    cur.execute('SELECT COUNT(*) FROM "DmAnswer"')
    n_total = cur.fetchone()[0]
    con.close()

    print(f"\nRows in input files: {total}")
    print(f"Rows applied (item found): {applied}")
    if missing_ids:
        print(f"IDs not found in DmQuestionItem ({len(missing_ids)}): {missing_ids[:10]}")
    print(f"DmAnswer now has: {n_total} rows total")


if __name__ == "__main__":
    main()
