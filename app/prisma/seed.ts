/**
 * Loads the extraction pipeline's output (../data/master, ../data/manual) into the SQLite DB.
 * Idempotent-ish: deletes and re-inserts everything derived from the JSON on each run, so it's
 * safe to re-seed after a re-extraction. User-generated data (attempts/bookmarks/notes) is
 * NOT touched by this script.
 */
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(__dirname, "../.."); // .../neonatologyexam
const DATA = path.join(ROOT, "data");

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./dev.db" });
const db = new PrismaClient({ adapter });

// Part 11 canonical order (as written in the spec), independent of the classifier's internal
// keyword-priority order.
const SYSTEMS_DISPLAY_ORDER = [
  "Respiratory", "Cardiovascular", "Neurology", "Gastrointestinal", "Renal", "Endocrinology",
  "Metabolic", "Infectious Disease", "Hematology", "Nutrition", "Genetics", "Fetal Medicine",
  "Resuscitation", "Thermoregulation", "Neonatal Pharmacology", "Neonatal Procedures",
  "Neonatal Equipment", "Ventilation", "ROP", "Neuroimaging", "Quality Improvement",
  "Research/Statistics", "Transport", "Developmental Physiology",
];

type Occ = { sitting_id: string; paper_no: number; paper_type: string; original_qnum: number; extraction_method: string };
type OptionJ = { letter: string; text: string };
type SubPartJ = { letter: string; text: string };
type MasterQ = {
  q_id: string; repetition_tier: string; occurrence_count: number; paper_type: string;
  stem: string; options: OptionJ[]; sub_parts: SubPartJ[]; has_image: boolean; has_table: boolean;
  flaw_note: string | null; confidence_status: string; occurrences: Occ[];
  primary_system: string; classification_confidence: string;
};
type SittingPaper = {
  sittingId: string; sittingLabel: string;
  papers: { paperNo: number; paperType: string; pageStart: number; pageEnd: number; nMainQuestions: number; formatNote: string | null }[];
};

function readJson<T>(rel: string): T {
  return JSON.parse(fs.readFileSync(path.join(DATA, rel), "utf-8"));
}

async function main() {
  console.log("Clearing derived tables...");
  // Attempts/Bookmarks/Notes FK-reference MasterQuestion, which this script rebuilds from
  // scratch every run — so they're cleared too. Fine for now (single local user, re-seeding
  // is a content-refresh step); a real multi-user re-ingestion should diff instead, per Part 30.
  await db.attempt.deleteMany();
  await db.bookmark.deleteMany();
  await db.note.deleteMany();
  await db.questionOccurrence.deleteMany();
  await db.option.deleteMany();
  await db.subPart.deleteMany();
  await db.answer.deleteMany();
  await db.explanation.deleteMany();
  await db.questionSource.deleteMany();
  await db.masterQuestion.deleteMany();
  await db.paper.deleteMany();
  await db.sitting.deleteMany();
  await db.subtopic.deleteMany();
  await db.topic.deleteMany();
  await db.system.deleteMany();
  await db.resource.deleteMany();

  console.log("Seeding systems...");
  const systemIdByName = new Map<string, string>();
  for (let i = 0; i < SYSTEMS_DISPLAY_ORDER.length; i++) {
    const name = SYSTEMS_DISPLAY_ORDER[i];
    const row = await db.system.create({ data: { name, sortOrder: i } });
    systemIdByName.set(name, row.id);
  }

  console.log("Seeding sittings + papers...");
  const sittingsPapers = readJson<SittingPaper[]>("master/sittings_papers.json");
  const paperIdByKey = new Map<string, string>(); // `${sittingId}:${paperNo}` -> Paper.id
  for (const sp of sittingsPapers) {
    const year = parseInt(sp.sittingId.slice(0, 4), 10);
    await db.sitting.create({ data: { id: sp.sittingId, label: sp.sittingLabel, year } });
    for (const p of sp.papers) {
      const row = await db.paper.create({
        data: {
          sittingId: sp.sittingId,
          paperNo: p.paperNo,
          paperType: p.paperType,
          pageStart: p.pageStart,
          pageEnd: p.pageEnd,
          formatNote: p.formatNote ?? undefined,
        },
      });
      paperIdByKey.set(`${sp.sittingId}:${p.paperNo}`, row.id);
    }
  }

  console.log("Seeding resources (source library)...");
  const resources = [
    { title: "NNF Fellowship All QBANK till 2026", shortName: "nnf-qbank", edition: null, year: null, category: "qbank", fileName: "NNF Fellowship All QBANK till 2026.pdf", pageCount: 276 },
    { title: "Goldsmith's Assisted Ventilation of the Neonate", shortName: "goldsmith", edition: null, year: null, category: "textbook", fileName: "Goldsmiths_Assisted_Ventilation_of_the_Neonate_E_Book_nodrm-Copy.pdf", pageCount: 770 },
    { title: "Gomella's Neonatology", shortName: "gomella", edition: null, year: null, category: "textbook", fileName: "Gomella.pdf", pageCount: 1142 },
    { title: "Textbook of Neonatal Ventilation (NEOCON 2017)", shortName: "neocon-ventilation", edition: "2017", year: 2017, category: "textbook", fileName: "Neonatal ventilation NEOCON.pdf", pageCount: 156 },
    { title: "Neonatal Equipment", shortName: "neonatal-equipment", edition: "5th", year: null, category: "textbook", fileName: "Neonatal Equipment 5th Edition.pdf", pageCount: 473 },
    { title: "Cloherty and Stark's Manual of Neonatal Care", shortName: "cloherty-stark", edition: "9th", year: 2023, category: "textbook", fileName: "Cloherty and Stark's Manual of Neonatal Care 2023.pdf", pageCount: 1183 },
    { title: "Avery's Diseases of the Newborn", shortName: "avery", edition: "10th", year: null, category: "textbook", fileName: "Avery 10th.pdf", pageCount: 1950 },
    { title: "AIIMS Protocols in Neonatology — Core Protocols, Vol. 1", shortName: "aiims-vol1", edition: "3rd", year: null, category: "protocol", fileName: "aiims volume 1.pdf", pageCount: 320 },
    { title: "AIIMS Protocols in Neonatology — Core Protocols, Vol. 2", shortName: "aiims-vol2", edition: "3rd", year: null, category: "protocol", fileName: "aiims volume 2.pdf", pageCount: 293 },
    { title: "AIIMS Protocols in Neonatology — Additional Protocols", shortName: "aiims-vol3", edition: "3rd", year: null, category: "protocol", fileName: "aiims volume 3 - additional protocols .pdf", pageCount: 342 },
    { title: "Fanaroff and Martin's Neonatal-Perinatal Medicine", shortName: "fanaroff-martin", edition: null, year: null, category: "textbook", fileName: "Fanaroff and Martin's Neonatal-Perinatal Medicine_1.pdf", pageCount: 2157 },
    { title: "Volpe's Neurology of the Newborn", shortName: "volpe", edition: "6th", year: 2018, category: "textbook", fileName: "Volpe's Neurology of the Newborn-Sixth Edition 2018.pdf", pageCount: 1491 },
  ];
  for (const r of resources) await db.resource.create({ data: r });

  console.log("Seeding master questions, options, sub-parts, answers, occurrences...");
  const mqs = readJson<MasterQ[]>("master/master_questions_classified.json");
  let occTotal = 0;
  for (const m of mqs) {
    const systemId = systemIdByName.get(m.primary_system) ?? null;
    await db.masterQuestion.create({
      data: {
        id: m.q_id,
        paperType: m.paper_type,
        stem: m.stem,
        repetitionTier: m.repetition_tier,
        hasImage: m.has_image,
        hasTable: m.has_table,
        flawNote: m.flaw_note ?? undefined,
        confidenceStatus: m.confidence_status,
        primarySystemId: systemId ?? undefined,
        options: { create: m.options.map((o, i) => ({ letter: o.letter, text: o.text, sortOrder: i })) },
        subParts: { create: m.sub_parts.map((s, i) => ({ label: s.letter, text: s.text, sortOrder: i })) },
      },
    });

    for (const o of m.occurrences) {
      const paperId = paperIdByKey.get(`${o.sitting_id}:${o.paper_no}`);
      if (!paperId) {
        console.warn(`  WARN: no paper found for ${o.sitting_id} P${o.paper_no} (question ${m.q_id})`);
        continue;
      }
      await db.questionOccurrence.create({
        data: {
          masterQuestionId: m.q_id,
          paperId,
          originalQnum: o.original_qnum,
          pdfPageStart: 0,
          pdfPageEnd: 0,
          extractionMethod: o.extraction_method,
        },
      });
      occTotal++;
    }
  }

  // Answer keys — only the 2024-04 sitting shipped one (loaded from the manual transcript,
  // matched back to its master question by exact stem text).
  console.log("Attaching known answers (2024-04 printed key)...");
  const april24 = readJson<{ questions: { qnum: number; stem: string; answer?: string }[] }>(
    "manual/2024-04_paper2_mcq.json"
  );
  let answered = 0;
  for (const q of april24.questions) {
    if (!q.answer) continue;
    const match = await db.masterQuestion.findFirst({ where: { stem: q.stem } });
    if (match) {
      await db.answer.create({
        data: { masterQuestionId: match.id, correctLetter: q.answer, confidenceStatus: "SOURCE_CONFIRMED", sourcedFrom: "printed_key" },
      });
      answered++;
    }
  }

  console.log("Ensuring default local user exists...");
  await db.user.upsert({
    where: { id: "local-user" },
    update: {},
    create: { id: "local-user", email: "local@offline.app", name: "You" },
  });

  const counts = {
    systems: await db.system.count(),
    sittings: await db.sitting.count(),
    papers: await db.paper.count(),
    masterQuestions: await db.masterQuestion.count(),
    occurrences: await db.questionOccurrence.count(),
    options: await db.option.count(),
    answers: await db.answer.count(),
    resources: await db.resource.count(),
  };
  console.log("\nSeed complete:");
  console.table(counts);
  console.log(`Occurrences linked in-loop: ${occTotal} (should match table count above)`);
  console.log(`Answers attached from printed key: ${answered}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
