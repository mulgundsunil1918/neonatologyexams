/**
 * Third hand-verification pass — Sunil asked to move fast: lighter/superficial reading of each
 * candidate citation (chapter title + short snippet, not full-page deep reads), and external
 * research used more readily when the resource text doesn't settle the answer outright. Same
 * CONFIRM/SUPPORT/REJECT + SOURCE_ANSWERS/EXTERNAL_ANSWERS structure as batch 1 and batch 2.
 * Confidence is still tracked and noted honestly in each EXTERNAL_ANSWERS explanation — going
 * faster does not mean pretending to more certainty than the quick check actually supports.
 *
 * Covers Q000006 through Q000127 (the MCQ ones only — the long-answer/Theory questions mixed
 * into this id range, e.g. Q000104-Q000117, are handled separately since their content lives in
 * SubParts rather than stem/options).
 */
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./dev.db" });
const db = new PrismaClient({ adapter });

type Verdict = [questionId: string, resourceTitleContains: string, page: number];

const CONFIRM: Verdict[] = [
  ["Q000060", "Volpe", 244],
  ["Q000062", "Cloherty", 368],
  ["Q000085", "Cloherty", 790],
  ["Q000094", "Cloherty", 670],
  ["Q000120", "Avery", 978],
  ["Q000120", "Fanaroff", 1383],
  ["Q000126", "Cloherty", 963],
  ["Q000127", "Core Protocols, Vol. 1", 270],
];

const SUPPORT: Verdict[] = [
  ["Q000054", "Gomella", 363],
  ["Q000055", "Volpe", 270],
  ["Q000055", "Cloherty", 747],
  ["Q000056", "Volpe", 369],
  ["Q000056", "Fanaroff", 1096],
  ["Q000057", "Gomella", 890],
  ["Q000058", "Volpe", 1361],
  ["Q000058", "Fanaroff", 508],
  ["Q000059", "Volpe", 247],
  ["Q000059", "Avery", 1918],
  ["Q000061", "Fanaroff", 993],
  ["Q000061", "Volpe", 127],
  ["Q000062", "Fanaroff", 1906],
  ["Q000063", "Fanaroff", 1323],
  ["Q000063", "Goldsmith", 198],
  ["Q000066", "Avery", 1282],
  ["Q000066", "Core Protocols, Vol. 1", 254],
  ["Q000068", "Avery", 1280],
  ["Q000069", "Cloherty", 29],
  ["Q000070", "Avery", 1281],
  ["Q000070", "Fanaroff", 1821],
  ["Q000071", "Avery", 142],
  ["Q000073", "Fanaroff", 1711],
  ["Q000073", "Avery", 1681],
  ["Q000073", "Cloherty", 360],
  ["Q000074", "Avery", 129],
  ["Q000074", "Fanaroff", 421],
  ["Q000076", "Cloherty", 411],
  ["Q000078", "Fanaroff", 1943],
  ["Q000078", "Gomella", 115],
  ["Q000079", "Avery", 1111],
  ["Q000080", "Cloherty", 844],
  ["Q000080", "Fanaroff", 1003],
  ["Q000080", "Volpe", 482],
  ["Q000081", "Cloherty", 845],
  ["Q000081", "Volpe", 482],
  ["Q000081", "Core Protocols, Vol. 1", 123],
  ["Q000082", "Fanaroff", 221],
  ["Q000082", "Volpe", 26],
  ["Q000083", "Gomella", 25],
  ["Q000085", "Avery", 682],
  ["Q000087", "Cloherty", 776],
  ["Q000087", "Gomella", 398],
  ["Q000087", "Fanaroff", 2051],
  ["Q000088", "Gomella", 693],
  ["Q000088", "Additional Protocols", 145],
  ["Q000090", "Avery", 69],
  ["Q000090", "Fanaroff", 457],
  ["Q000091", "Gomella", 376],
  ["Q000092", "Volpe", 82],
  ["Q000092", "Gomella", 688],
  ["Q000092", "Fanaroff", 1127],
  ["Q000094", "Gomella", 857],
  ["Q000095", "Cloherty", 656],
  ["Q000097", "Core Protocols, Vol. 1", 136],
  ["Q000097", "Cloherty", 601],
  ["Q000097", "Gomella", 831],
  ["Q000098", "Goldsmith", 334],
  ["Q000100", "Avery", 1711],
  ["Q000100", "Gomella", 648],
  ["Q000120", "Cloherty", 516],
  ["Q000122", "Avery", 1915],
  ["Q000123", "Additional Protocols", 211],
  ["Q000124", "Avery", 1258],
  ["Q000125", "Cloherty", 918],
  ["Q000125", "Fanaroff", 1722],
  ["Q000127", "Goldsmith", 522],
];

const REJECT: Verdict[] = [
  ["Q000054", "Textbook of Neonatal Ventilation", 54],
  ["Q000054", "Goldsmith", 644],
  ["Q000055", "Core Protocols, Vol. 2", 137],
  ["Q000056", "Gomella", 1018],
  ["Q000057", "Cloherty", 941],
  ["Q000057", "Fanaroff", 1094],
  ["Q000058", "Avery", 1793],
  ["Q000061", "Cloherty", 154],
  ["Q000062", "Gomella", 706],
  ["Q000063", "Avery", 390],
  ["Q000064", "Gomella", 467],
  ["Q000064", "Core Protocols, Vol. 2", 173],
  ["Q000064", "Neonatal Equipment", 287],
  ["Q000065", "Volpe", 868],
  ["Q000065", "Avery", 464],
  ["Q000065", "Goldsmith", 506],
  ["Q000066", "Gomella", 822],
  ["Q000067", "Fanaroff", 400],
  ["Q000067", "Volpe", 583],
  ["Q000067", "Gomella", 794],
  ["Q000068", "Gomella", 1054],
  ["Q000068", "Fanaroff", 770],
  ["Q000069", "Avery", 267],
  ["Q000069", "Fanaroff", 550],
  ["Q000070", "Gomella", 153],
  ["Q000071", "Fanaroff", 1762],
  ["Q000071", "Gomella", 627],
  ["Q000072", "Fanaroff", 1718],
  ["Q000072", "Avery", 1482],
  ["Q000072", "Gomella", 534],
  ["Q000075", "Fanaroff", 405],
  ["Q000075", "Neonatal Equipment", 396],
  ["Q000076", "Gomella", 860],
  ["Q000076", "Fanaroff", 1943],
  ["Q000077", "Avery", 412],
  ["Q000077", "Core Protocols, Vol. 2", 50],
  ["Q000077", "Gomella", 271],
  ["Q000078", "Core Protocols, Vol. 2", 169],
  ["Q000079", "Volpe", 4],
  ["Q000079", "Cloherty", 888],
  ["Q000082", "Avery", 1097],
  ["Q000083", "Cloherty", 146],
  ["Q000083", "Avery", 267],
  ["Q000084", "Fanaroff", 1759],
  ["Q000084", "Gomella", 647],
  ["Q000084", "Avery", 1720],
  ["Q000085", "Gomella", 771],
  ["Q000086", "Additional Protocols", 60],
  ["Q000086", "Core Protocols, Vol. 1", 78],
  ["Q000086", "Fanaroff", 449],
  ["Q000089", "Volpe", 1302],
  ["Q000089", "Gomella", 120],
  ["Q000089", "Avery", 335],
  ["Q000090", "Volpe", 591],
  ["Q000091", "Fanaroff", 1618],
  ["Q000091", "Volpe", 1256],
  ["Q000093", "Textbook of Neonatal Ventilation", 139],
  ["Q000093", "Goldsmith", 148],
  ["Q000093", "Fanaroff", 1523],
  ["Q000095", "Avery", 1467],
  ["Q000095", "Fanaroff", 1501],
  ["Q000096", "Avery", 1057],
  ["Q000096", "Cloherty", 81],
  ["Q000096", "Fanaroff", 1962],
  ["Q000098", "Textbook of Neonatal Ventilation", 32],
  ["Q000098", "Neonatal Equipment", 155],
  ["Q000099", "Fanaroff", 1728],
  ["Q000099", "Avery", 1668],
  ["Q000099", "Gomella", 936],
  ["Q000100", "Fanaroff", 1775],
  ["Q000101", "Cloherty", 414],
  ["Q000101", "Gomella", 859],
  ["Q000101", "Fanaroff", 690],
  ["Q000102", "Fanaroff", 449],
  ["Q000102", "Cloherty", 508],
  ["Q000102", "Additional Protocols", 60],
  ["Q000103", "Fanaroff", 1404],
  ["Q000103", "Avery", 1061],
  ["Q000103", "Additional Protocols", 45],
  ["Q000118", "Gomella", 25],
  ["Q000118", "Avery", 267],
  ["Q000118", "Cloherty", 146],
  ["Q000119", "Avery", 321],
  ["Q000119", "Fanaroff", 1612],
  ["Q000119", "Goldsmith", 516],
  ["Q000121", "Cloherty", 190],
  ["Q000121", "Textbook of Neonatal Ventilation", 22],
  ["Q000121", "Core Protocols, Vol. 1", 72],
  ["Q000122", "Fanaroff", 2026],
  ["Q000122", "Gomella", 76],
  ["Q000123", "Avery", 1869],
  ["Q000123", "Fanaroff", 1997],
  ["Q000124", "Fanaroff", 724],
  ["Q000124", "Additional Protocols", 134],
  ["Q000125", "Gomella", 820],
  ["Q000126", "Fanaroff", 1743],
  ["Q000126", "Gomella", 458],
  ["Q000127", "Fanaroff", 731],
];

type SourcedAnswer = [questionId: string, correctLetter: string, note: string];
const SOURCE_ANSWERS: SourcedAnswer[] = [
  ["Q000060", "B", "Volpe p.244 describes exactly this reflex: hand opening present by 28 weeks, extension/abduction of the arms, embracing flexion, audible cry — the Moro reflex."],
  ["Q000062", "A", "Cloherty p.368: heme oxygenase \"oxidizes the heme ring...to biliverdin (transient) and carbon monoxide\" — equimolar CO production is the basis for using it to measure bilirubin production rate."],
  ["Q000085", "D", "Cloherty p.790 states directly: \"Transplacental transmission of T. pallidum can occur throughout pregnancy.\""],
  ["Q000094", "C", "Cloherty p.670's polycythemia/hyperviscosity management table uses a 65% venous hematocrit threshold to define the condition."],
  ["Q000120", "C", "Avery p.978 (\"Normal Fetal Pulmonary Vascular Development and Transition\") and Fanaroff p.1383 (\"Mediators of Fetal Pulmonary Vascular Tone\") are both chapters specifically about this transition and its NO/prostacyclin-mediated vasodilation."],
  ["Q000126", "C", "Cloherty p.963's thyroid interpretation table shows permanent dysgenesis presenting with TSH elevated — the vignette's normal TSH with low T4 and normal imaging rules dysgenesis out, leaving hypothyroxinemia of prematurity (immature hypothalamic-pituitary-thyroid axis) as the fitting diagnosis."],
  ["Q000127", "C", "AIIMS Core Protocols Vol.1 p.270 defines \"adjustable fortification\" as based on monitoring the infant's protein adequacy/labs — by contrast, fortification based on the milk's own analyzed macronutrient content is \"targeted fortification.\""],
];

type ExternalAnswer = [questionId: string, correctLetter: string, note: string, confidence: "high" | "medium" | "low"];
const EXTERNAL_ANSWERS: ExternalAnswer[] = [
  ["Q000006", "B", "Periconceptional folic acid supplementation is the standard, well-established intervention to reduce recurrence risk of neural tube defects like spina bifida in a subsequent pregnancy.", "high"],
  ["Q000011", "B", "Fishbone (Ishikawa) analysis is the standard quality-improvement tool specifically used for root-cause analysis, distinct from PDSA (testing a change) or run/control charts (monitoring variation over time).", "high"],
  ["Q000024", "B", "In gastroschisis the exposed bowel loops are typically edematous, thickened, and sometimes matted or foreshortened from amniotic fluid exposure — they are not \"always normal,\" unlike the other three listed (right-sided defect, uncommon liver herniation, and early antenatal detection are all accurate).", "high"],
  ["Q000036", "C", "REM (active) sleep predominates in preterm infants and is understood to support brain maturation; the other options reflect outdated or harmful practices (bright light and constant music exposure are avoided in NICU care, and current understanding is that preterm infants do feel and are affected by pain).", "high"],
  ["Q000047", "D", "Tone and reflex maturation in preterm infants progresses caudocephalad (legs before arms) — deep tendon reflexes and flexor tone both mature in the lower extremities roughly 2-3 weeks before the upper extremities, the opposite of what this option states.", "medium"],
  ["Q000048", "B", "Standard cooling protocol calls for initiating hypothermia as promptly/rapidly as possible once indicated (within 6 hours of birth) — it is REWARMING that must be slow; \"initiation should be slow\" reverses this.", "high"],
  ["Q000054", "C", "Blunted central chemoreceptor response to hypercapnia (immature respiratory drive) is the principal established mechanism of apnea of prematurity, more so than the other listed mechanisms.", "high"],
  ["Q000055", "C", "The combination of low glucose, markedly high protein, and a colorless (non-xanthochromic) sample with a mild pleocytosis fits bacterial meningitis in a term infant best; the colorless character argues against a hemorrhage-related origin (post-hemorrhagic hydrocephalus / grade I IVH would tend toward xanthochromia).", "medium"],
  ["Q000056", "A", "Phenytoin is well known to precipitate in dextrose-containing IV solutions and must be diluted/flushed with normal saline only — a standard medication-safety fact.", "high"],
  ["Q000057", "C", "2 mL/kg of 10% dextrose (200 mg/kg glucose) IV push is the standard bolus for symptomatic neonatal hypoglycemia/seizures.", "high"],
  ["Q000058", "B", "Traumatic (forceps-related) neonatal facial nerve palsy resolves spontaneously in the large majority of infants, with recovery reported from hours up to about 6 months — matching the 3-6 month option as the outer bound by which most have recovered.", "medium"],
  ["Q000059", "C", "The pupillary light reflex is absent before ~30 weeks, develops through 32-35 weeks, and is consistently present by term — 32 weeks is the closest standard \"expected by\" milestone among the options.", "medium"],
  ["Q000061", "A", "Achondroplasia is classically associated with relative macrocephaly/frontal bossing (from disproportionate skeletal growth), not microcephaly, unlike the other three listed conditions.", "high"],
  ["Q000063", "A", "Biphasic stridor (both inspiratory and expiratory) indicates a fixed subglottic-level lesion, in contrast to laryngomalacia's classic inspiratory-only, position-dependent stridor — and a weak cry further points to a glottic/subglottic problem rather than a lower tracheal (vascular) compression.", "medium"],
  ["Q000064", "D", "Colostrum's specific gravity is cited in dairy/lactation references as roughly 1.040-1.060, higher than mature milk — 1.04 is the closest of the given options.", "medium"],
  ["Q000065", "C", "Neonates have a substantially higher glucose utilization/production rate per kg body weight than adults, classically cited as roughly double, reflecting their higher brain-to-body-mass ratio and metabolic rate.", "high"],
  ["Q000066", "B", "Human breast milk is well known to be relatively poor in vitamin K (the reason for routine vitamin K prophylaxis at birth); cow's milk contains substantially more.", "high"],
  ["Q000067", "C", "Lactase activity matures latest among the disaccharidases in fetal life (not reaching full levels until close to term), which is why relative lactose intolerance is common in preterm infants — sucrase and maltase activities mature earlier.", "high"],
  ["Q000068", "C", "Iron from human breast milk is very efficiently absorbed, classically cited at about 50%, versus roughly 10% from cow's milk/formula — a well-known point made to explain why breastfed infants maintain adequate iron status despite breast milk's low iron content.", "high"],
  ["Q000069", "B", "Trisomy 16 is the single most common trisomy across all human conceptions (the large majority ending in early miscarriage) — the phrase \"irrespective of viability\" specifically points away from trisomy 21, which is only the most common trisomy among live births.", "medium"],
  ["Q000070", "D", "Copper deficiency in neonates (typically from prolonged unsupplemented parenteral nutrition) classically produces anemia, neutropenia, and bone demineralization together — all three are well-documented features.", "high"],
  ["Q000071", "C", "Major congenital malformation rates in infants of diabetic mothers are consistently cited in large studies at roughly 6-9%, several times the general-population background rate.", "high"],
  ["Q000072", "D", "Blue diaper syndrome is a hereditary tryptophan transport/malabsorption disorder — intestinal bacterial breakdown products of unabsorbed tryptophan oxidize to indigo blue in the diaper.", "high"],
  ["Q000073", "B", "The nadir of early-onset neonatal hypocalcemia is classically described around 24 hours of postnatal age, placing it within the 12-24 hour window.", "medium"],
  ["Q000074", "D", "Achondroplasia is a non-lethal skeletal dysplasia that does not classically cause hydrops, unlike congenital nephrosis (hypoproteinemia), congenital syphilis (a classic infectious cause), and osteopetrosis (via marrow infiltration/severe anemia in severe forms).", "medium"],
  ["Q000075", "D", "Body-water compartment physiology: intracellular fluid rises to about 60% and extracellular to about 40% of total body water by the end of the first year of life, essentially converging toward the adult ratio — the classic \"crossover\" point cited is around 1 year.", "high"],
  ["Q000076", "C", "Term-neonate maximal urinary concentrating ability is classically cited around 600-800 mOsm/L, well below the adult maximum of ~1200-1400.", "medium"],
  ["Q000077", "C", "The great majority of normal term newborns (commonly cited around 95%) void within the first 24 hours of life, with nearly all having done so by 48 hours.", "medium"],
  ["Q000078", "A", "Insensible water loss in full-term neonates is classically cited at roughly 15-20 mL/kg/day (much lower than the substantially higher preterm/ELBW figures), matching the lowest option.", "high"],
  ["Q000079", "B", "The Volpe grading system classically refers to grading germinal matrix/intraventricular hemorrhage by cranial ultrasound (grades I-IV), not CT.", "high"],
  ["Q000080", "C", "Banker and Larroche's 1962 neuropathologic description is the classic, specifically-named first description of periventricular leukomalacia.", "high"],
  ["Q000081", "C", "Pre-oligodendrocytes are the classically cited most vulnerable/most affected cell population in periventricular leukomalacia of prematurity.", "high"],
  ["Q000082", "B", "The \"banana sign\" (an abnormally curved, flattened cerebellum) is the classic prenatal ultrasound sign of Chiari II malformation; the \"lemon sign\" instead describes the frontal bone scalloping of the skull.", "high"],
  ["Q000083", "D", "The standard second-trimester quad screen comprises AFP, hCG, unconjugated estriol, and inhibin A; PAPP-A is a first-trimester marker (combined with nuchal translucency and hCG), not part of the quad screen.", "high"],
  ["Q000084", "B", "Fetal eyelids fuse around 9-10 weeks and separate again later in gestation (commonly cited around the mid-second trimester); among the given options, 22 weeks is the closest approximation, though the classic teaching figure (~26 weeks) doesn't exactly match any option here.", "low"],
  ["Q000086", "A", "Congenital varicella syndrome's classic triad includes cicatricial (zigzag) skin scarring and limb hypoplasia, distinct from the other listed TORCH-type infections.", "high"],
  ["Q000087", "D", "Chlamydial conjunctivitis classically presents later than gonococcal conjunctivitis, typically starting around 5-14 days after birth — 5 days is the closest/earliest bound among the given options.", "medium"],
  ["Q000088", "C", "Reovirus (type 3) is the virus classically implicated in the pathogenesis of biliary atresia in the standard teaching literature.", "high"],
  ["Q000089", "C", "An enlarged clitoris (clitoromegaly) is not a normal newborn finding and suggests virilization (e.g., from CAH), unlike physiologic phimosis, benign neonatal breast changes, and normally palpable newborn kidneys.", "medium"],
  ["Q000090", "B", "Cotyledon is the classically taught gross \"functional unit\" of the placenta (its lobular subdivisions), the traditional obstetric teaching term, though some newer embryology sources instead emphasize the villus as the microscopic functional unit.", "medium"],
  ["Q000091", "A", "Listeria classically causes neonatal sepsis/meningitis rather than a bloody-diarrhea GI presentation, unlike Shigella, Salmonella, and Campylobacter, which are classic enteroinvasive causes of bloody diarrhea.", "medium"],
  ["Q000092", "C", "Congenital toxoplasmosis is the classic TORCH infection associated with aqueductal stenosis/obstructive hydrocephalus, alongside intracranial calcifications and chorioretinitis.", "high"],
  ["Q000093", "B", "Normal preterm infants can have mildly higher baseline methemoglobin than term infants due to relative reductase-enzyme immaturity, generally cited in the low single digits (roughly 1-4.5%) rather than under 1% or into pathological ranges.", "low"],
  ["Q000095", "A", "Fetal hemoglobin (HbF) constitutes roughly 70-80% of total hemoglobin at birth in a term infant, matching the highest option.", "high"],
  ["Q000096", "D", "Fetal combined cardiac output is classically cited as markedly higher per kilogram than postnatal output, around 450 mL/kg/min, reflecting the parallel fetal circulation.", "medium"],
  ["Q000097", "D", "This question is somewhat ambiguous, since low platelet count, renal impairment, and NEC are all classically cited contraindications/cautions for indomethacin (only hypoglycemia is not) — of the three genuine contraindications, active or suspected NEC is generally the most emphatically absolute one (indomethacin further reduces mesenteric blood flow), so it was selected as the single best answer, but this is a low-confidence pick given more than one option is defensible.", "low"],
  ["Q000098", "B", "Target tidal volume for neonatal ventilation is a standard 4-6 mL/kg across preterm and term infants.", "high"],
  ["Q000099", "A", "Human placental lactogen (human chorionic somatomammotropin) is the hormone classically described as functioning analogously to growth hormone during fetal life, since pituitary GH has a limited direct role in fetal growth.", "high"],
  ["Q000100", "B", "External genital virilization in CAH becomes evident once genital differentiation is underway and androgen exposure acts on the developing labioscrotal folds/clitoris, classically placed in the 9-16 week window.", "medium"],
  ["Q000101", "D", "Absence of colonic ganglion cells is Hirschsprung disease, not a component of the classic Prune Belly triad (abdominal wall muscular deficiency, urinary tract dilation/hydronephrosis, and bilateral cryptorchidism).", "high"],
  ["Q000102", "D", "Toxoplasmosis, syphilis, and CMV are classic chronic/congenital (TORCH) intrauterine infections, whereas herpes simplex is classically an acute infection acquired peripartum rather than a \"chronic intrauterine\" one.", "high"],
  ["Q000103", "B", "Maternal systemic lupus erythematosus (via anti-Ro/anti-La antibodies) is the classic maternal condition associated with fetal complete heart block and resulting bradycardia.", "high"],
  ["Q000118", "A", "Twin/multiple pregnancy is the classic cause of an elevated absolute PAPP-A (and hCG) level in first-trimester screening, simply from the contribution of two placentas — in contrast, it is a LOW PAPP-A that is associated with aneuploidy and growth restriction.", "medium"],
  ["Q000119", "A", "Essential fatty acid deficiency can develop very rapidly — within about 3 days — in extremely preterm infants given their minimal fat stores, faster than the roughly 1-week figure sometimes quoted for the general population.", "medium"],
  ["Q000121", "D", "The standard NRP target preductal SpO2 table specifies roughly 80-85% at 5 minutes after birth for a term/preterm infant during resuscitation.", "high"],
  ["Q000122", "B", "The standard newborn red-reflex examination technique holds the ophthalmoscope roughly 12-18 inches (an arm's length) from the infant's eyes.", "medium"],
  ["Q000123", "C", "A young infant with recurrent thrush, failure to thrive-type presentation, and low WBC count fits the primary immunodeficiency table's description of SCID (recurrent life-threatening infections with persistent thrush) most closely among the four options; a negative NBT test argues against chronic granulomatous disease.", "medium"],
  ["Q000124", "B", "Fat/fatty-acid composition is actually the single most maternal-diet-dependent component of breast milk, but that isn't one of the four options offered here; among vitamins, proteins, lactose, and immunoglobulin, vitamin content (particularly fat-soluble vitamins and B12) is the most recognized as varying with maternal diet/intake, while lactose and immunoglobulin levels are comparatively stable.", "low"],
  ["Q000125", "B", "Serum phosphorus depletion (from inadequate phosphate intake relative to rapid bone mineral demand) is classically described as an earlier biochemical change than alkaline phosphatase elevation or radiographic changes in osteopenia of prematurity.", "medium"],
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
    const prefix = `External/current verification — this answer is NOT stated in the uploaded resources; it was determined via external medical knowledge/research (confidence: ${confidence}). `;
    await upsertAnswer(questionId, correctLetter, "EXTERNAL_VERIFICATION", "external_research", prefix + note);
  }
  console.log(`Answers recorded via external research (EXTERNAL_VERIFICATION): ${EXTERNAL_ANSWERS.length}`);

  await db.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
