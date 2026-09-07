# Neonatology Fellowship Study Platform

A fully offline exam-prep app for the NNF Fellowship, built from the question bank and
reference library in `../` (the project root). Every question traces back to its original
paper, page, and occurrence — see `../scripts/paper_registry.py` for the source-of-truth
mapping and `../artifacts/phase1-3-report.html` for the full forensic audit.

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind v4 · shadcn/ui (Base UI primitives) ·
Prisma 7 + SQLite (`prisma/dev.db`, a single file — no external database service).
Fully offline: nothing here calls out to the network at runtime.

## First-time setup

```bash
npm install
npx prisma migrate dev   # creates prisma/dev.db from the schema
npx tsx prisma/seed.ts   # loads ../data/master + ../data/manual into it
npm run dev
```

Re-run `npx tsx prisma/seed.ts` any time the extraction pipeline in `../scripts/` produces
new output — it rebuilds all content tables from the JSON files (user attempts/bookmarks/notes
are cleared too, since they FK-reference content; see the comment at the top of `seed.ts`).

## What's real vs. not yet built

Dashboard, MCQ Master (with filters), Paper-wise solving (full exam-runner with scoring),
System-wise browsing, Theory list, Resource Library, and Bookmarks all read live data and
work end-to-end, including submitting answers and getting graded where a source-confirmed
answer exists (currently only the April 2024 sitting has a printed key — everything else
correctly shows "not found in uploaded resources" rather than a guess).

Clinical Cases and Analytics are placeholder pages — they need content authoring / more
attempt history to be worth building, respectively. Notes has the data model but no editor UI
yet. Yellow-tier (concept-level) repetition classification and textbook/protocol source
citations are both explicitly deferred, not faked — see the confidence-status badges on any
question page.

## Data flow

```
../data/extracted/occurrences.json         (Python: scripts/extract_qbank.py)
../data/master/master_questions_classified.json  (Python: scripts/build_master_questions.py + classify_systems.py)
../data/manual/*.json                       (hand-transcribed sittings with no clean-text source)
        ↓
prisma/seed.ts  →  prisma/dev.db
        ↓
Next.js Server Components (src/app/**/page.tsx) read directly via src/lib/db.ts
```

## Toward a Flutter app

The content is entirely in `../data/*.json` — plain, engine-agnostic JSON that a Flutter app
could bundle as an asset and load into its own local `sqflite` database without depending on
this Next.js backend at all (matching the "fully offline" requirement on both sides). If a
shared HTTP backend is wanted instead, add route handlers under `src/app/api/` — the Prisma
layer and schema already support that without changes.
