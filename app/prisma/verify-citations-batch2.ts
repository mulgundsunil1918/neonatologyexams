/**
 * Second hand-verification pass, covering the next 40 "untouched" questions (Q000009 through
 * Q000053, the ones with candidate citations but no human_verified source yet — see
 * verify-citations.ts for the methodology and the first 62-question pass).
 *
 * NEW in this pass, per explicit instruction: when the uploaded resources do not establish the
 * correct answer (no citation directly states it), the answer was researched via external medical
 * literature (WebSearch over review articles, standard references, primary studies) and recorded
 * with confidenceStatus "EXTERNAL_VERIFICATION" + sourcedFrom "external_research". This is
 * DELIBERATELY a different, visually distinct status from SOURCE_CONFIRMED/SOURCE_SUPPORTED — it
 * must never be presented as if it came from the uploaded books. Every such answer also gets an
 * Explanation row whose body states this plainly and summarizes the external reasoning/citation,
 * so the UI ("Not yet ingested..." fallback) is replaced with an honest, labeled note instead.
 *
 * Citation verdicts (CONFIRM/SUPPORT/REJECT) follow the exact same rules as verify-citations.ts:
 * - CONFIRM: passage directly/substantively supports the concept or the answer -> SOURCE_CONFIRMED.
 * - SUPPORT: relevant, on-topic, partial/background match -> SOURCE_SUPPORTED.
 * - REJECT: verified wrong (keyword collision on a different condition/topic) -> deleted outright.
 * Anything not listed was left as match-citations.ts produced it (SOURCE_DEPENDENT, unverified).
 */
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./dev.db" });
const db = new PrismaClient({ adapter });

type Verdict = [questionId: string, resourceTitleContains: string, page: number];

const CONFIRM: Verdict[] = [
  ["Q000010", "Avery", 984],
  ["Q000027", "Gomella", 122],
  ["Q000029", "Cloherty", 916],
  ["Q000031", "Fanaroff", 1722],
  ["Q000031", "Additional Protocols", 233],
  ["Q000033", "Fanaroff", 976],
  ["Q000034", "Core Protocols, Vol. 1", 264],
  ["Q000037", "Gomella", 838],
  ["Q000038", "Neonatal Equipment", 240],
  ["Q000040", "Neonatal Equipment", 249],
  ["Q000040", "Gomella", 324],
  ["Q000041", "Volpe", 148],
  ["Q000052", "Fanaroff", 1129],
  ["Q000052", "Volpe", 233],
];

const SUPPORT: Verdict[] = [
  ["Q000013", "Avery", 411],
  ["Q000013", "Core Protocols, Vol. 1", 59],
  ["Q000014", "Core Protocols, Vol. 2", 89],
  ["Q000014", "Cloherty", 1059],
  ["Q000014", "Avery", 1929],
  ["Q000017", "Fanaroff", 1741],
  ["Q000020", "Volpe", 820],
  ["Q000023", "Gomella", 721],
  ["Q000026", "Fanaroff", 1808],
  ["Q000027", "Volpe", 234],
  ["Q000028", "Cloherty", 293],
  ["Q000029", "Fanaroff", 1701],
  ["Q000030", "Avery", 1398],
  ["Q000031", "Cloherty", 920],
  ["Q000033", "Avery", 1076],
  ["Q000033", "Volpe", 149],
  ["Q000034", "Gomella", 60],
  ["Q000034", "Core Protocols, Vol. 2", 73],
  ["Q000037", "Volpe", 643],
  ["Q000038", "Cloherty", 864],
  ["Q000039", "Volpe", 620],
  ["Q000041", "Avery", 1077],
  ["Q000041", "Fanaroff", 974],
  ["Q000042", "Gomella", 439],
  ["Q000043", "Fanaroff", 1944],
  ["Q000045", "Gomella", 386],
  ["Q000046", "Core Protocols, Vol. 2", 168],
  ["Q000051", "Fanaroff", 1061],
  ["Q000052", "Gomella", 74],
];

const REJECT: Verdict[] = [
  ["Q000009", "Avery", 210],
  ["Q000010", "Fanaroff", 1361],
  ["Q000013", "Fanaroff", 617],
  ["Q000015", "Gomella", 121],
  ["Q000015", "Cloherty", 338],
  ["Q000015", "Neonatal Equipment", 296],
  ["Q000016", "Gomella", 241],
  ["Q000016", "Fanaroff", 476],
  ["Q000016", "Avery", 225],
  ["Q000017", "Cloherty", 200],
  ["Q000017", "Avery", 1216],
  ["Q000018", "Gomella", 549],
  ["Q000018", "Fanaroff", 1721],
  ["Q000018", "Core Protocols, Vol. 1", 106],
  ["Q000019", "Gomella", 139],
  ["Q000019", "Avery", 505],
  ["Q000019", "Core Protocols, Vol. 1", 251],
  ["Q000020", "Fanaroff", 158],
  ["Q000020", "Cloherty", 1007],
  ["Q000021", "Core Protocols, Vol. 1", 207],
  ["Q000021", "Gomella", 488],
  ["Q000021", "Fanaroff", 663],
  ["Q000022", "Fanaroff", 536],
  ["Q000022", "Avery", 273],
  ["Q000022", "Volpe", 127],
  ["Q000023", "Additional Protocols", 139],
  ["Q000023", "Volpe", 918],
  ["Q000025", "Avery", 1284],
  ["Q000025", "Core Protocols, Vol. 2", 194],
  ["Q000025", "Cloherty", 310],
  ["Q000026", "Core Protocols, Vol. 1", 283],
  ["Q000026", "Cloherty", 939],
  ["Q000028", "Fanaroff", 719],
  ["Q000030", "Gomella", 417],
  ["Q000030", "Additional Protocols", 142],
  ["Q000032", "Core Protocols, Vol. 1", 268],
  ["Q000032", "Volpe", 320],
  ["Q000032", "Avery", 214],
  ["Q000035", "Fanaroff", 292],
  ["Q000035", "Avery", 1296],
  ["Q000035", "Cloherty", 103],
  ["Q000037", "Core Protocols, Vol. 1", 271],
  ["Q000038", "Avery", 452],
  ["Q000039", "Core Protocols, Vol. 1", 271],
  ["Q000039", "Additional Protocols", 202],
  ["Q000040", "Volpe", 348],
  ["Q000042", "Avery", 482],
  ["Q000042", "Cloherty", 340],
  ["Q000043", "Core Protocols, Vol. 2", 169],
  ["Q000043", "Gomella", 115],
  ["Q000044", "Fanaroff", 1078],
  ["Q000044", "Volpe", 416],
  ["Q000044", "Avery", 1670],
  ["Q000045", "Volpe", 27],
  ["Q000045", "Additional Protocols", 116],
  ["Q000046", "Core Protocols, Vol. 1", 145],
  ["Q000046", "Cloherty", 655],
  ["Q000048", "Neonatal Equipment", 251],
  ["Q000048", "Volpe", 348],
  ["Q000048", "Core Protocols, Vol. 1", 100],
  ["Q000049", "Fanaroff", 1897],
  ["Q000049", "Cloherty", 721],
  ["Q000049", "Avery", 394],
  ["Q000050", "Fanaroff", 1156],
  ["Q000050", "Volpe", 85],
  ["Q000050", "Goldsmith", 610],
  ["Q000051", "Avery", 1133],
  ["Q000051", "Volpe", 361],
  ["Q000053", "Volpe", 796],
  ["Q000053", "Gomella", 766],
  ["Q000053", "Avery", 1067],
];

// Answers the uploaded resources themselves establish (the CONFIRM citation above directly
// states the tested fact) -> SOURCE_CONFIRMED, sourcedFrom "textbook_citation".
type SourcedAnswer = [questionId: string, correctLetter: string, note: string];
const SOURCE_ANSWERS: SourcedAnswer[] = [
  ["Q000010", "D", "Avery's Diseases of the Newborn p.984: inhaled nitric oxide \"activates soluble guanylate cyclase\" — the cGMP pathway, not cAMP."],
  ["Q000027", "B", "Gomella's Neonatology p.122: \"Intrauterine head growth is 0.5-0.8 cm/wk... average head circumference growth is 0.9 cm/wk in VLBW infants\" — within the 0.5-1.0 cm/week range."],
  ["Q000029", "A", "Cloherty and Stark's Manual p.916: \"intrauterine mineral accretion rates of approximately 120 mg of calcium and 60 mg of phosphorus/kg/day\" — an exact match."],
  ["Q000031", "D", "Fanaroff p.1722 and AIIMS Additional Protocols p.233 both explicitly list furosemide, methylxanthines/caffeine, and steroids as risk factors for osteopenia of prematurity; phenytoin is not named in either as a cause."],
  ["Q000033", "B", "Fanaroff p.976: cortical anisotropy (marking active neuronal migration along the radial glial scaffolding) rises from 15 weeks' gestation to ~26 weeks, matching the 12-24 week window and ruling out the other three ranges."],
  ["Q000034", "B", "AIIMS Core Protocols Vol.1 p.264: \"Fenton growth charts... are used to classify 'size-at-birth'\"."],
  ["Q000037", "B", "Gomella p.838: \"Watershed predominant pattern... results from partial prolonged asphyxia\", versus \"basal ganglia/thalamus predominant pattern... results from acute profound asphyxia.\""],
  ["Q000038", "C", "Neonatal Equipment p.240 confirms initiation within 6 hours, slow rewarming, and a 33.5-34.5°C target as the real protocol elements — it says nothing about an Apgar-at-1-minute criterion, which (per external verification below) is not part of standard cooling-trial inclusion criteria."],
  ["Q000040", "D", "Gomella p.324 explicitly lists arrhythmia/bradycardia as a hypothermia complication (\"most common cardiovascular complication\"); Neonatal Equipment p.249's complications table separately confirms thrombocytopenia and coagulopathy (↑PT/PTT) — together these source-confirm all three named complications."],
  ["Q000041", "C", "Volpe's Neurology of the Newborn p.148: \"The major disorders are listed in Table 6.4... considered migrational disorders conventionally\" — corpus callosum agenesis is a disorder of commissuration, not this conventional migrational-disorder list."],
  ["Q000052", "C", "Fanaroff p.1129 (\"scaphocephaly, or 'boat-shaped head'\" from sagittal craniosynostosis) and Volpe p.233 (\"the 'keel-shaped' head of sagittal synostosis is termed... scaphocephaly\") both state this directly."],
];

// Answers NOT established by any uploaded resource — researched externally per the user's
// explicit instruction ("if not in resources then search the answers in relevant articles,
// research papers... and mention so"). Every note names this is external, not from the books.
type ExternalAnswer = [questionId: string, correctLetter: string, note: string, confidence: "high" | "medium" | "low"];
const EXTERNAL_ANSWERS: ExternalAnswer[] = [
  ["Q000009", "B", "Quickening (first maternal perception of fetal movement) is standardly taught at 16-25 weeks overall — 18-20 weeks in primigravidae, roughly 1-2 weeks earlier (~16-18 wks) in multigravidae.", "high"],
  ["Q000013", "D", "All three statements check out in the general obstetric/neonatal literature: hypothermia is linked to increased mortality in preterm neonates; food-grade heat-resistant plastic wrap/bags under a radiant warmer is standard practice for <28-week infants; and intrapartum maternal fever is an established risk factor for neonatal encephalopathy, seizures, cerebral palsy, and death.", "medium"],
  ["Q000014", "B", "Binocular indirect ophthalmoscopy remains the gold-standard technique for ROP screening, ahead of wide-field digital imaging alternatives.", "high"],
  ["Q000015", "B", "Arithmetic/pharmacology fact rather than a citable passage: 15% KCl = 150 mg/mL; KCl's molecular weight (~74.5 g/mol) makes that ~2 mmol/mL = 2 mEq/mL for the monovalent K+ ion — a figure also given directly in clinical dosing references.", "high"],
  ["Q000016", "D", "Classic Erb (C5-C6) palsy exam: the Moro reflex is absent/asymmetric on the affected side because shoulder abduction/extension is weak, while the grasp reflex is intact because it is mediated by the lower brachial plexus (C8-T1), which is spared.", "high"],
  ["Q000017", "D", "The described picture (lethargy, prolonged jaundice, constipation, hypothermia, bradycardia, abdominal distension) is the classic constellation of congenital hypothyroidism; T4/TSH is the appropriate test. The uploaded Fanaroff text (p.1741) already links prolonged jaundice to hypothyroidism — external sources confirm the rest of the constellation.", "high"],
  ["Q000018", "B", "Neonatal hypoglycemia plus microphallus (± prolonged/cholestatic jaundice) in a male infant is described in the literature as presumptive evidence of congenital hypopituitarism (GH/ACTH/gonadotropin deficiency).", "high"],
  ["Q000019", "D", "Working through each option against the vignette: term infants' iron stores are adequate until 4-6 months (rules out a 1-month-old's iron level as a concern), feeding on demand with a plausible weight for age is not a caloric red flag, and frequent greenish stools are a recognized normal breastfed-infant variant — so none of the listed findings should actually be concerning. Lower-moderate confidence: this is an inference from ruling out each distractor, not a single source stating the answer.", "medium"],
  ["Q000020", "C", "Intrauterine (intravascular) fetal blood transfusion via the umbilical vein is the long-established, standard antenatal treatment for severe Rh alloimmunization/fetal anemia. Medium confidence: antenatal corticosteroids (option B) are also a genuine antenatal intervention, so the question hinges on which the exam-writer intended as \"most correct\" — duodenal atresia (surgical, not antenatally treatable) and atropine for fetal heart block (real treatment is maternal steroids/beta-agonists, not atropine) are the clearer wrong options.", "medium"],
  ["Q000021", "D", "Epstein pearls, milia neonatorum, and Mongolian spots are all near-universal benign newborn variants; a simple/simian palmar crease occurs in only ~1-5% of normal newborns and is the finding classically flagged as not part of routine normal newborn skin/exam findings (though it is not itself diagnostic of any condition).", "high"],
  ["Q000022", "C", "Standard teratogen-association tables pair valproate with neural tube defects (spina bifida) as its hallmark effect, not a generic \"cranial defect\" label — making that the mismatched (incorrect) pairing among four otherwise-standard associations (alcohol/IUGR-microcephaly-ocular anomalies, methimazole/aplasia cutis of the scalp, lithium/Ebstein anomaly).", "medium"],
  ["Q000023", "B", "Under the Saudubray \"intoxication-type\" IEM framework, urea cycle defects (hyperammonemia), maple syrup urine disease, and molybdenum cofactor deficiency all present with acute encephalopathy after a symptom-free interval; fatty acid oxidation disorders instead present with hypoketotic hypoglycemia, hepatomegaly, and cardiomyopathy — a different (energy-deficiency) category.", "medium"],
  ["Q000026", "D", "Raised 17-OHP with dehydration/shock signals classic salt-wasting congenital adrenal hyperplasia (21-hydroxylase deficiency); aldosterone deficiency causes hyponatremia and hyperkalemia, and the resulting hypoperfusion/hyperkalemia produce a metabolic acidosis.", "high"],
  ["Q000030", "A", "Genuinely mixed in the literature: Western sources often cite alpha-1-antitrypsin deficiency as the leading genetic/metabolic cause of neonatal cholestasis, while galactosemia is the answer conventionally taught in Indian pediatric texts (Ghai/IAP) for \"most common metabolic liver disease of the neonate,\" which this question's phrasing appears to follow. Lower confidence — flagged as a genuine point of disagreement across sources rather than a settled fact.", "low"],
  ["Q000032", "B", "In the de Vries sonographic grading of periventricular leukomalacia, cysts confined to periventricular white matter (not extending into deep/subcortical white matter) are grade III; extension into deep white matter is what defines the more severe grade IV. \"Sparing deep white matter\" therefore places this at grade III.", "medium"],
  ["Q000035", "B", "Nutrition/protein-energy deficits, GI losses such as regurgitation/reflux, and anemia (including iatrogenic phlebotomy losses) are all well-documented, frequently-cited drivers of poor postnatal growth in preterm NICU infants; chronic hypothermia is comparatively rarely cited as an independent major cause in the growth-failure literature, making it the more likely \"except.\"", "low"],
  ["Q000038", "C", "Standard cooling-trial inclusion criteria use an Apgar score ≤5 at 10 minutes (or ≥10 minutes of resuscitation, or severe acidosis) — not an Apgar-at-1-minute threshold — so \"Apgar <3 at 1 minute\" is not a real criterion, while ≥35-36 weeks GA, birth weight ≥1800g, and a 33.5-34.5°C target are all genuine, source-supported criteria.", "medium"],
  ["Q000039", "B", "Periventricular leukomalacia is consistently described as the most common ischemic white-matter injury pattern in preterm infants, in contrast to watershed/parasagittal injury in term infants.", "high"],
  ["Q000042", "D", "Non-oliguric hyperkalemia of prematurity in ELBW infants is attributed to a shift of potassium from the intracellular to the extracellular space, driven by immature Na+/K+-ATPase activity — not intake, tubular reabsorption, or tubular excretion.", "high"],
  ["Q000043", "D", "Each statement checks out: insensible water loss is a large share of a preterm infant's total water requirement, antenatal corticosteroids measurably reduce transepidermal (insensible) water loss by improving skin barrier maturation, and skin losses dominate over respiratory losses in the typical (non-ventilated/non-humidified) preterm scenario this question describes.", "medium"],
  ["Q000044", "C", "The SRY gene (sex-determining region Y), expressed in the bipotential gonad from about 6 weeks' gestation, is the initiating trigger of the testis-differentiation cascade — upstream of Leydig-cell testosterone and its 5-alpha-reductase/DHT and Sertoli-cell MIS products.", "high"],
  ["Q000045", "D", "Lower confidence: sepsis, adrenal hemorrhage/crisis, and hypoglycemia are all frequently and specifically described in the literature as causing neonatal cyanotic/apneic spells, whereas neonatal meningitis is more classically characterized by nonspecific neurologic signs (lethargy, irritability, poor feeding) rather than cyanotic spells as a headline feature — tentatively taken as the intended \"except,\" but this was the least clean-cut of this batch's external lookups.", "low"],
  ["Q000025", "A", "Neonates (especially preterm) have immature pancreatic lipase and a limited bile-salt pool, making fat the macronutrient that is comparatively least efficiently digested at birth — compensated for by gastric lipase and human milk's own bile-salt-stimulated lipase; carbohydrate and protein digestion are relatively more mature.", "high"],
  ["Q000049", "D", "Cow's-milk/high-phosphate-load feeding causing late neonatal hypocalcemia (presenting with tetany/seizures around day 5-10 of life) is a specifically-documented, classic clinical entity in the literature.", "high"],
  ["Q000050", "B", "Benign familial/idiopathic neonatal seizures, primary subarachnoid hemorrhage, and late-onset hypocalcemia are each described in the literature as having excellent, usually-benign long-term outcomes, whereas neonatal hypoglycemia (particularly if severe, early, or recurrent) is consistently linked to a less favorable, more variable neurodevelopmental prognosis.", "high"],
  ["Q000051", "C", "Post-rewarming brain MRI is reported to have the highest predictive value of the available modalities (ahead of aEEG and clinical exam) for death/long-term neurodevelopmental disability in neonates with HIE managed with therapeutic hypothermia.", "medium"],
  ["Q000053", "D", "The initial compensatory cerebral response to hypoxia is vasodilation and an INCREASE in cerebral blood flow (not a decrease) — the opposite direction from hypocapnia and hyperoxia, which both cause vasoconstriction and reduced flow — making decreased pO2 the correct \"except.\"", "high"],
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

async function upsertAnswer(questionId: string, correctLetter: string, confidenceStatus: string, sourcedFrom: string, note: string) {
  await db.answer.upsert({
    where: { masterQuestionId: questionId },
    create: { masterQuestionId: questionId, correctLetter, confidenceStatus, sourcedFrom },
    update: { correctLetter, confidenceStatus, sourcedFrom },
  });
  await db.explanation.upsert({
    where: { masterQuestionId: questionId },
    create: { masterQuestionId: questionId, body: note },
    update: { body: note },
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

  console.log(`Citations — Confirmed: ${confirmed}/${CONFIRM.length}, Supported: ${supported}/${SUPPORT.length}, Rejected: ${rejected}/${REJECT.length}`);
  if (notFound.length) {
    console.log(`WARNING: ${notFound.length} citation verdicts didn't match any row:`);
    for (const v of notFound) console.log("  ", v);
  }

  for (const [questionId, correctLetter, note] of SOURCE_ANSWERS) {
    await upsertAnswer(questionId, correctLetter, "SOURCE_CONFIRMED", "textbook_citation", note);
  }
  console.log(`Answers recorded from uploaded resources (SOURCE_CONFIRMED): ${SOURCE_ANSWERS.length}`);

  for (const [questionId, correctLetter, note, confidence] of EXTERNAL_ANSWERS) {
    const prefix = `External/current verification — this answer is NOT stated in the uploaded resources; it was determined by searching external medical literature (confidence: ${confidence}). `;
    await upsertAnswer(questionId, correctLetter, "EXTERNAL_VERIFICATION", "external_research", prefix + note);
  }
  console.log(`Answers recorded via external research (EXTERNAL_VERIFICATION): ${EXTERNAL_ANSWERS.length}`);

  await db.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
