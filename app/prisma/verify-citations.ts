/**
 * Applies a HUMAN-READ verification pass over the auto-generated (SOURCE_DEPENDENT) candidate
 * citations for the highest-value question set: the 12 Orange (verbatim-repeated) questions and
 * the 50 April-2024 questions (the only sitting with a source-confirmed answer key). Every verdict
 * below was reached by actually reading the full page text the citation points to — see the
 * conversation record for the reasoning on each; this file just applies the conclusions.
 *
 * - CONFIRM: the passage directly and substantively supports the concept/answer being tested.
 *   -> confidenceStatus "SOURCE_CONFIRMED", matchMethod "human_verified".
 * - SUPPORT: relevant, on-topic, but a partial/background match rather than a direct statement
 *   of the tested fact. -> confidenceStatus "SOURCE_SUPPORTED", matchMethod "human_verified".
 * - REJECT: verified WRONG — the search matched on shared vocabulary but the passage is actually
 *   about a different condition/concept. Presenting these would mislead a reader, which is worse
 *   than presenting nothing, so they are DELETED rather than merely downgraded.
 *
 * Anything for these 62 questions NOT listed below was left exactly as match-citations.ts
 * produced it (SOURCE_DEPENDENT, unverified) — not silently upgraded.
 */
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./dev.db" });
const db = new PrismaClient({ adapter });

type Verdict = [questionId: string, resourceTitleContains: string, page: number];

const CONFIRM: Verdict[] = [
  ["Q000001", "Gomella", 44], ["Q000001", "Cloherty", 509],
  ["Q000004", "Volpe", 68],
  ["Q000005", "Fanaroff", 993], ["Q000005", "Additional Protocols", 329], ["Q000005", "Volpe", 127],
  ["Q000007", "Fanaroff", 505], ["Q000007", "Cloherty", 128], ["Q000007", "Volpe", 1338],
  ["Q000008", "Additional Protocols", 136], ["Q000008", "Gomella", 693],
  ["Q000012", "Avery", 1929], ["Q000012", "Core Protocols, Vol. 2", 88], ["Q000012", "Fanaroff", 2061],
  ["Q000564", "Gomella", 860], ["Q000564", "Cloherty", 409],
  ["Q000565", "Core Protocols, Vol. 1", 302],
  ["Q000568", "Fanaroff", 672], ["Q000568", "Avery", 1576],
  ["Q000570", "Avery", 984], ["Q000570", "Additional Protocols", 125],
  ["Q000574", "Avery", 1689], ["Q000574", "Fanaroff", 1716], ["Q000574", "Cloherty", 364],
  ["Q000575", "Additional Protocols", 137], ["Q000575", "Avery", 1394],
  ["Q000579", "Fanaroff", 1425],
  ["Q000580", "Additional Protocols", 204], ["Q000580", "Avery", 1429],
  ["Q000581", "Core Protocols, Vol. 1", 285], ["Q000581", "Gomella", 519], ["Q000581", "Fanaroff", 1524],
  ["Q000582", "Avery", 1711],
  ["Q000584", "Gomella", 25], ["Q000584", "Additional Protocols", 283],
  ["Q000585", "Gomella", 831],
];

const SUPPORT: Verdict[] = [
  ["Q000002", "Volpe", 244], ["Q000002", "Gomella", 88],
  ["Q000003", "Core Protocols, Vol. 1", 29],
  ["Q000008", "Avery", 1397],
  ["Q000563", "Additional Protocols", 34],
  ["Q000565", "Fanaroff", 938], ["Q000565", "Avery", 644],
  ["Q000572", "Fanaroff", 1736], ["Q000572", "Avery", 1745], ["Q000572", "Gomella", 936],
  ["Q000579", "Core Protocols, Vol. 1", 171],
  ["Q000584", "Avery", 267],
  ["Q000585", "Avery", 1010],
  ["Q000587", "Cloherty", 316],
];

const REJECT: Verdict[] = [
  ["Q000001", "Goldsmith", 211],
  ["Q000002", "Fanaroff", 521],
  ["Q000003", "Gomella", 770], ["Q000003", "Fanaroff", 327],
  ["Q000004", "Fanaroff", 981],
  ["Q000006", "Fanaroff", 791], ["Q000006", "Gomella", 382], ["Q000006", "Cloherty", 256],
  ["Q000009", "Volpe", 570], ["Q000009", "Gomella", 53],
  ["Q000011", "Goldsmith", 86], ["Q000011", "Fanaroff", 99], ["Q000011", "Avery", 447],
  ["Q000566", "Core Protocols, Vol. 1", 278], ["Q000566", "Core Protocols, Vol. 2", 206], ["Q000566", "Additional Protocols", 259],
  ["Q000567", "Additional Protocols", 15], ["Q000567", "Core Protocols, Vol. 1", 15], ["Q000567", "NEOCON", 38],
  ["Q000568", "Gomella", 447],
  ["Q000569", "NEOCON", 56], ["Q000569", "Fanaroff", 1148], ["Q000569", "Gomella", 233],
  ["Q000570", "Fanaroff", 1384],
  ["Q000571", "Neonatal Equipment", 160], ["Q000571", "Additional Protocols", 307], ["Q000571", "NEOCON", 43],
  ["Q000573", "Avery", 232], ["Q000573", "Volpe", 658], ["Q000573", "Fanaroff", 566],
  ["Q000576", "Gomella", 1085], ["Q000576", "Fanaroff", 2154], ["Q000576", "Goldsmith", 268],
  ["Q000577", "Fanaroff", 1109], ["Q000577", "Cloherty", 1020],
  ["Q000578", "Gomella", 518], ["Q000578", "Cloherty", 399], ["Q000578", "Avery", 686],
  ["Q000579", "Cloherty", 515],
  ["Q000582", "Gomella", 557], ["Q000582", "Cloherty", 100],
  ["Q000583", "Volpe", 753], ["Q000583", "Fanaroff", 218], ["Q000583", "Additional Protocols", 50],
  ["Q000586", "Goldsmith", 617], ["Q000586", "Core Protocols, Vol. 2", 90], ["Q000586", "Neonatal Equipment", 435],
  ["Q000587", "Avery", 1268],
];

async function findRow(questionId: string, titleContains: string, page: number) {
  return db.questionSource.findFirst({
    where: {
      masterQuestionId: questionId,
      pageRef: String(page),
      resource: { title: { contains: titleContains } },
    },
  });
}

async function main() {
  let confirmed = 0, supported = 0, rejected = 0, notFound: Verdict[] = [];

  for (const v of CONFIRM) {
    const row = await findRow(...v);
    if (!row) { notFound.push(v); continue; }
    await db.questionSource.update({ where: { id: row.id }, data: { confidenceStatus: "SOURCE_CONFIRMED", matchMethod: "human_verified" } });
    confirmed++;
  }
  for (const v of SUPPORT) {
    const row = await findRow(...v);
    if (!row) { notFound.push(v); continue; }
    await db.questionSource.update({ where: { id: row.id }, data: { confidenceStatus: "SOURCE_SUPPORTED", matchMethod: "human_verified" } });
    supported++;
  }
  for (const v of REJECT) {
    const row = await findRow(...v);
    if (!row) { notFound.push(v); continue; }
    await db.questionSource.delete({ where: { id: row.id } });
    rejected++;
  }

  console.log(`Confirmed: ${confirmed}/${CONFIRM.length}`);
  console.log(`Supported: ${supported}/${SUPPORT.length}`);
  console.log(`Rejected (deleted): ${rejected}/${REJECT.length}`);
  if (notFound.length) {
    console.log(`\nWARNING: ${notFound.length} verdicts didn't match any row (already cleaned up by the filter fix, or a typo):`);
    for (const v of notFound) console.log("  ", v);
  }

  await db.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
