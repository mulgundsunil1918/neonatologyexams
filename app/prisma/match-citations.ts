/**
 * Phase 6b: generate CANDIDATE source citations for every master question by full-text
 * searching the indexed textbook/protocol pages (see prisma/seed.ts for how that index is
 * built). This is a mechanical keyword match, not a verified citation — every row it writes
 * gets confidenceStatus "SOURCE_DEPENDENT" ("a search match found this; the passage has not
 * been read and confirmed to actually support this answer"). Upgrading specific citations to
 * SOURCE_CONFIRMED is a separate, deliberate verification step (see verify-citations.ts),
 * never done automatically here — that distinction is the whole point of Part 25 of the spec.
 */
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./dev.db" });
const db = new PrismaClient({ adapter });

// Words that appear in almost every exam question and carry no discriminating power for
// search — stripped before building an FTS query. This is deliberately broader than a general
// English stopword list: it also strips clinical-VIGNETTE scaffolding (presents, examination,
// weighing, gestation, mother...) that shows up in nearly every case-based stem regardless of
// what condition it's actually about, which otherwise drowns out the one or two words that
// actually identify the concept.
const NOISE_WORDS = new Set(`
  a an the is are was were be been being this that these those which what who whom whose
  of in on at to for from with without into onto by as it its their his her they them he she
  all any each every most least more less than then not no nor so such very
  and or but if else when while
  following true false except correct incorrect likely unlikely most least common rare
  neonate neonatal newborn infant infants baby babies term preterm postterm day days week weeks
  month months year years hour hours minute minutes old born delivery delivered deliveries
  presents presented presenting present below above statement statements regarding case scenario
  history examination examined shows showed reveals revealed found noted note admission admitted
  weighing weighs weight weighed gestation gestational mother father parent parents family
  likely diagnosis management treatment requires required develops developed developing review
  reviewing appropriate following patient patients male female child children
`.split(/\s+/).filter(Boolean));

function fold(s: string) {
  return s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9\s]/g, " ");
}

/** Pages that are clearly not explanatory content — a bibliography, an index of further
 *  reading — rank highly on keyword density (author names, drug names in citation titles)
 *  without actually explaining anything. Excluded from citation candidates outright. */
function isNonContentChapter(title: string | undefined): boolean {
  if (!title) return false;
  const t = title.trim();
  // Exact boilerplate labels, or short (<=25 char) titles that are essentially just a
  // "references" label with a one-word qualifier ("Key references", "Selected References").
  if (/^(references?|suggested readings?|further reading|bibliography|recommended readings?)\.?$/i.test(t)) return true;
  if (t.length <= 25 && /\breferences?\b/i.test(t)) return true;
  return false;
}

function buildQuery(stem: string, correctOptionText?: string): string | null {
  // Tier 1: capitalized abbreviations/proper nouns from the ORIGINAL (unfolded) text — drug
  // names, eponyms, acronyms (NEC, PIH, ROP...) are usually the single best search anchor and
  // get lost the moment everything is lowercased.
  const tier1 = new Set<string>();
  for (const src of [correctOptionText, stem]) {
    if (!src) continue;
    const caps = src.match(/\b[A-Z][A-Za-z]{2,}\b/g) ?? [];
    for (const w of caps) {
      const lw = w.toLowerCase();
      if (!NOISE_WORDS.has(lw)) tier1.add(w);
    }
  }

  // Tier 2: remaining significant lowercase terms once vignette scaffolding is stripped.
  const tier2 = new Set<string>();
  for (const src of [correctOptionText, stem]) {
    if (!src) continue;
    for (const w of fold(src).split(/\s+/)) {
      if (w.length >= 4 && !NOISE_WORDS.has(w) && !/^\d+$/.test(w) && !tier1.has(w)) tier2.add(w);
    }
  }

  const terms = [...tier1].slice(0, 5).concat([...tier2].slice(0, 5));
  if (terms.length < 2) return null; // too little signal to search meaningfully
  return terms.map((t) => `"${fold(t).trim()}"`).filter((t) => t !== '""').join(" OR ");
}

async function findChapterFor(resourceId: string, pageNumber: number) {
  // Prefer the MOST SPECIFIC (smallest page range) chapter containing this page — with the
  // deeply-nested outlines extracted (see ingest_resources.py), that's the actual sub-heading,
  // not just the containing top-level chapter.
  const candidates: { id: string; title: string; pageStart: number; pageEnd: number }[] =
    await db.$queryRawUnsafe(
      `SELECT id, title, pageStart, pageEnd FROM Chapter
       WHERE resourceId = ? AND pageStart <= ? AND pageEnd >= ?
       ORDER BY (pageEnd - pageStart) ASC LIMIT 1`,
      resourceId, pageNumber, pageNumber
    );
  return candidates[0] ?? null;
}

async function main() {
  const limitArg = process.argv[2] ? parseInt(process.argv[2], 10) : undefined;

  await db.questionSource.deleteMany({ where: { matchMethod: "keyword_search" } });

  const questions = await db.masterQuestion.findMany({
    include: { options: true, answer: true },
    orderBy: { id: "asc" },
    ...(limitArg ? { take: limitArg } : {}),
  });

  let withCandidates = 0, withoutSignal = 0, withoutHits = 0, totalSources = 0;

  for (const q of questions) {
    const correctText = q.answer?.correctLetter
      ? q.options.find((o) => o.letter === q.answer!.correctLetter)?.text
      : undefined;
    const query = buildQuery(q.stem, correctText);
    if (!query) {
      withoutSignal++;
      continue;
    }

    const hits: { resourcePageId: string; resourceId: string; pageNumber: number; text: string; rank: number }[] =
      await db.$queryRawUnsafe(
        `SELECT resourcePageId, resourceId, pageNumber, text, bm25(resource_page_fts) as rank
         FROM resource_page_fts WHERE resource_page_fts MATCH ?
         ORDER BY rank LIMIT 20`,
        query
      );

    if (hits.length === 0) {
      withoutHits++;
      continue;
    }

    // Walk hits best-first, resolve each one's chapter, and skip anything landing on a
    // References/Suggested-Reading page (see isNonContentChapter) rather than accept it just
    // because it ranked well on keyword density. Keep the first good hit per resource, up to
    // 3 distinct resources.
    const seenResource = new Set<string>();
    const accepted: { hit: (typeof hits)[number]; chapter: Awaited<ReturnType<typeof findChapterFor>> }[] = [];
    for (const hit of hits) {
      if (seenResource.has(hit.resourceId)) continue;
      const chapter = await findChapterFor(hit.resourceId, hit.pageNumber);
      if (isNonContentChapter(chapter?.title)) continue;
      seenResource.add(hit.resourceId);
      accepted.push({ hit, chapter });
      if (accepted.length >= 3) break;
    }

    for (let i = 0; i < accepted.length; i++) {
      const { hit, chapter } = accepted[i];
      const snippet = hit.text.replace(/\s+/g, " ").trim().slice(0, 280);

      await db.questionSource.create({
        data: {
          masterQuestionId: q.id,
          resourceId: hit.resourceId,
          chapterId: chapter?.id,
          role: i === 0 ? "primary" : "additional",
          chapter: chapter?.title,
          pageRef: String(hit.pageNumber),
          matchedSnippet: snippet,
          confidenceStatus: "SOURCE_DEPENDENT",
          matchMethod: "keyword_search",
        },
      });
      totalSources++;
    }
    withCandidates++;
  }

  console.log(`Questions processed: ${questions.length}`);
  console.log(`  with candidate citation(s): ${withCandidates}`);
  console.log(`  no search signal (stem too generic/short): ${withoutSignal}`);
  console.log(`  had signal but zero hits in the library: ${withoutHits}`);
  console.log(`Total QuestionSource rows created: ${totalSources}`);

  await db.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
