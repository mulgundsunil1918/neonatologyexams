/**
 * First model-answer pass for long-answer (Theory) questions. Per Sunil's explicit instruction,
 * these are written directly from standard neonatology knowledge (fast/superficial pass, not a
 * page-by-page resource read), with a couple of external lookups only for the newer/regional
 * topics (MIS-N, the MAA programme, ALPS-trial-era late-preterm steroid guidance). Every answer
 * is recorded as EXTERNAL_VERIFICATION / sourcedFrom "external_research" — none of this is claimed
 * as confirmed by the uploaded textbooks, consistent with the rest of the app's labeling.
 *
 * Covers Q000104-Q000117 (the Theory questions bundled into batch 3's id range). 90 more Theory
 * questions remain in the bank for a future pass — see memory.
 */
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./dev.db" });
const db = new PrismaClient({ adapter });

const ANSWERS: Record<string, string> = {
  Q000104: `A) Neonatal pain — assessment and management
Assessment: pain is under-recognized in neonates because they cannot self-report. Use validated composite scales combining physiologic + behavioral cues — PIPP-R (Premature Infant Pain Profile-Revised), NIPS (Neonatal Infant Pain Scale), N-PASS, and CRIES for postoperative pain. Cues include facial expression (brow bulge, eye squeeze, nasolabial furrow), cry, body movements, heart rate/oxygen saturation changes.
Management — non-pharmacological: swaddling/facilitated tucking, non-nutritive sucking, kangaroo mother care, breastfeeding/expressed milk, oral sucrose/glucose for brief procedural pain (heel prick, venipuncture, immunization).
Pharmacological: paracetamol for mild-moderate pain; opioids (morphine, fentanyl) for ventilated infants/major procedures/surgery; topical anesthetics (EMLA/lidocaine) before invasive procedures; sedatives are not analgesics and should not substitute for analgesia. Avoid routine opioid infusions without clear indication (risk of tolerance, withdrawal, and no proven benefit on long-term outcome from most trials).

B) Counselling parents planning a second child when the first child has Down syndrome
Explain recurrence risk: for standard trisomy 21 (nondisjunction, ~95% of cases) recurrence risk is low but slightly above background (~1% or maternal-age-related risk, whichever is higher). If the child's trisomy 21 is due to a parental balanced Robertsonian translocation, recurrence risk is much higher (up to 10-15% if mother is the carrier, ~2-5% if father, and near 100% if a rare 21;21 translocation) — so karyotyping the affected child (and parents, if a translocation is found) is essential before counselling.
Offer: genetic counselling, prenatal diagnosis options in the next pregnancy (first-trimester NT + serum screening, NIPT, and definitive testing via CVS/amniocentesis with karyotype if risk is elevated or parents desire certainty).
Address emotional and psychosocial dimensions — many parents fear recurrence disproportionately; reassure with actual numbers, discuss support systems, early intervention services for the affected child, and reproductive options (including that most recurrence risk is low for standard trisomy 21).

C) Hyperglycemia in the neonate
Definition: blood glucose >125-150 mg/dL (varies by protocol; some use >145 mg/dL, others >150-180 in VLBW on parenteral nutrition).
Causes: iatrogenic (excess IV dextrose infusion, common in ELBW on high GIR), stress response (sepsis, surgery, pain, asphyxia), relative insulin resistance/immature pancreatic response of prematurity, drugs (steroids, caffeine), transient neonatal diabetes mellitus (rare).
Investigations: bedside glucose monitoring trend, review GIR/infusion rate, sepsis screen if clinically indicated, urine for glycosuria/osmotic diuresis, serum/urine ketones, consider insulin and C-peptide levels and genetic testing if persistent (>2 weeks) — for transient neonatal diabetes (commonly 6q24 abnormalities).
Management: first reduce GIR gradually (do not stop abruptly — risk of rebound hypoglycemia); ensure adequate but not excessive caloric/dextrose delivery; treat underlying cause (sepsis, pain); insulin infusion only if hyperglycemia is severe/persistent (>250 mg/dL with glycosuria) despite GIR reduction, titrated carefully with frequent glucose monitoring due to high risk of hypoglycemia in tiny infants.

D) Transient disorders of thyroid function in neonates
Transient hypothyroxinemia of prematurity: low T4 with normal/low-normal TSH in preterm infants from hypothalamic-pituitary-thyroid axis immaturity; usually does not need treatment, resolves spontaneously; distinguished from primary hypothyroidism (which shows elevated TSH) and central hypothyroidism.
Transient neonatal hypothyroidism: seen with maternal antithyroid drug use (goitrogens), maternal iodine deficiency or excess (e.g., povidone-iodine antiseptic exposure, amiodarone), transplacental maternal TSH-receptor blocking antibodies (from maternal autoimmune thyroiditis) — resolves as the causative exposure/antibody clears, usually within weeks to months.
Transient neonatal hyperthyroidism (thyrotoxicosis): from transplacental passage of maternal TSH-receptor stimulating antibodies in mothers with Graves disease (active or even previously treated); presents with tachycardia, irritability, poor weight gain, goiter; self-limited as maternal antibody titers decline (weeks to ~3 months) but needs monitoring/treatment (antithyroid drugs, beta-blockers) if symptomatic given risk of high-output cardiac failure.

E) Thermal management of a 27-week, 900g preterm with axillary temperature 31°C (severe hypothermia, <32°C)
This is a NICU/inborn emergency — severe hypothermia carries high mortality/morbidity risk (cold stress → increased O2 consumption, hypoglycemia, metabolic acidosis, coagulopathy, IVH, death).
Immediate steps: place under a pre-warmed radiant warmer (skin-servo mode set ~0.5-1°C above current temperature, not directly to 36.5°C, to allow controlled rewarming and avoid rebound apnea/hypotension from too-rapid warming); use a heated, humidified incubator alternative if available; cover with plastic wrap and use a cap to reduce further evaporative/convective losses; warm all fluids and inspired gases.
Rewarm gradually (~0.5-1°C/hour) with continuous temperature, heart rate, respiratory, and glucose monitoring — check blood glucose (hypoglycemia common), blood gas (acidosis), coagulation screen, and evaluate/treat for sepsis (hypothermia can be a presenting sign). Ensure minimal handling, provide oxygen/respiratory support as needed, and delay non-urgent procedures until stable and normothermic. Investigate and correct the root cause of the hypothermic episode (equipment failure, delayed resuscitation, prolonged transport, etc.) to prevent recurrence.`,

  Q000105: `A) HHFNC (Heated Humidified High-Flow Nasal Cannula) — principle and difference from CPAP
Principle: delivers heated (37°C), humidified gas at flows typically 2-8 L/min via nasal prongs, generating a variable, flow-dependent distending pressure, washing out nasopharyngeal dead space (reducing CO2 rebreathing), and reducing the work of breathing/resistance of nasal breathing.
Difference from CPAP: CPAP delivers a set, more predictable and consistent continuous distending pressure via a sealed interface (regardless of the infant's own flow/breathing pattern); HHFNC pressure is variable, dependent on flow rate, cannula-to-nares fit, and whether the infant's mouth is open (pressure is far less predictable and can even be near zero with an open mouth or leak). HHFNC is generally easier to apply, better tolerated (nasal trauma risk lower), and easier for parental interaction/kangaroo care, but is considered a somewhat weaker mode of respiratory support with more mixed evidence for extubation/primary support in the most immature infants — CPAP remains standard first-line in many units for significant RDS, especially <28 weeks.

B) Downe's score and Silverman-Anderson score
Both are clinical scores (0-2 per component) for grading severity of respiratory distress in a newborn without needing a blood gas.
Downe's score (0-10, used widely in India): respiratory rate, cyanosis (and response to O2), retractions, grunting, air entry on auscultation. Score <4 = mild distress, 4-6 = moderate (consider CPAP/further workup), >6 = severe (impending respiratory failure, consider blood gas/ventilation).
Silverman-Anderson score (0-10, higher = worse, unlike Apgar): upper chest movement, lower chest (intercostal) retraction, xiphoid retraction, nasal flaring, expiratory grunt. Used more for tracking RDS severity trend over time than as an absolute treatment trigger.

C) Probiotics and NEC in preterm infants — evidence
Multiple RCTs and meta-analyses (Cochrane reviews) show probiotic supplementation (commonly Lactobacillus/Bifidobacterium strains, alone or combined) in preterm infants reduces the incidence of severe (stage ≥2) NEC and all-cause mortality, with no significant increase in sepsis from probiotic organisms themselves. Evidence is strongest/most consistent for infants <34 weeks or <1500g. However, there is no single standardized strain/dose/duration, product quality and regulation vary widely (not pharmaceutical-grade in many settings), and rare cases of probiotic-organism sepsis have been reported in extremely preterm/immunocompromised infants — so many major bodies (including AAP) have stopped short of a blanket recommendation, urging use of a well-studied product with quality assurance where local unit protocols support it, particularly in high-NEC-incidence settings.

D) MAA Programme
"Mother's Absolute Affection" — a Government of India (Ministry of Health & Family Welfare) nationwide programme launched in 2016 to promote, protect, and support breastfeeding and optimal infant and young child feeding (IYCF) practices through the public health system. Objectives include community awareness generation, training of ASHAs/ANMs/nursing staff in lactation support and counselling, strengthening breastfeeding support at delivery points (promoting early initiation within 1 hour, exclusive breastfeeding for 6 months), and linking with the Baby-Friendly Hospital Initiative (BFHI) at facility level.

E) Epidermolysis bullosa (EB)
A group of rare, mostly inherited, mechanobullous skin disorders characterized by skin/mucosal fragility with blister/erosion formation from minor mechanical trauma or friction. Classified by the level of skin cleavage: EB simplex (intraepidermal, keratin gene defects, generally mildest), Junctional EB (lamina lucida, laminin/collagen XVII defects, can be severe/lethal in the Herlitz subtype), Dystrophic EB (sublamina densa, collagen VII defect, can be dominant or recessive, prone to scarring/mitten deformities and long-term skin cancer risk). Neonatal management is largely supportive: minimal handling, non-adherent/silicone dressings (avoid tape directly on skin), specialized wound care, meticulous infection/sepsis surveillance, adequate analgesia and nutrition (high protein/calorie needs from chronic wound losses), and a multidisciplinary approach (dermatology, genetics) — the Herlitz junctional and severe generalized recessive dystrophic subtypes carry high neonatal mortality.

F) Customized (targeted) breast milk fortification
Standard fortification adds a fixed amount of fortifier regardless of the mother's own milk composition, which is known to vary considerably. Targeted fortification analyzes the individual mother's expressed milk (using a human milk analyzer) for its actual protein/fat/carbohydrate/energy content and adjusts fortifier/supplement composition to meet the specific preterm infant's calculated nutrient targets, aiming to more reliably prevent postnatal growth failure than a one-size-fits-all approach — though it requires access to milk-analysis equipment and is not yet universally available.

G) Antenatal corticosteroids for late preterm delivery — current guidelines
Based on the ALPS RCT, a single course of betamethasone given to women at risk of late-preterm delivery (34 0/7 to 36 6/7 weeks) who have not previously received antenatal steroids reduces short-term neonatal respiratory morbidity — significant reductions in the need for respiratory support and in transient tachypnea/severe RDS. ACOG and similar bodies now recommend offering a single course in this window when delivery is expected within 7 days and steroids haven't already been given. Caveat: increased risk of neonatal hypoglycemia is reported, so glucose monitoring is recommended after exposure; a long-term (ALPS follow-up) study found no significant difference in early-childhood neurodevelopmental outcome between exposed and unexposed groups. Steroids are not recommended for elective late-preterm cesarean delivery without another indication for early delivery, and repeat courses beyond one in this window are not established practice.

H) Strategies for placental transfusion at birth
Aims to transfer additional placental blood volume to the neonate at delivery, improving blood volume/hemoglobin, iron stores and reducing need for transfusion — now standard of care where the infant does not need immediate resuscitation.
Delayed cord clamping (DCC): clamping the cord after a defined delay (commonly 30-60 seconds, some protocols up to 60-180s) while holding/placing the infant at or below the level of the placenta/introitus (for vaginal delivery) or a similar level for cesarean.
Umbilical cord milking (UCM): the cord is manually "milked" toward the infant several times before clamping — a faster alternative, but current evidence (and a signal of harm — increased severe IVH) has led most bodies to advise AGAINST cord milking in very preterm infants (<28-32 weeks), reserving DCC as the preferred, evidence-supported strategy for both term and preterm infants who don't need immediate resuscitation.`,

  Q000106: `Multi-drug-resistant (carbapenem-resistant) Klebsiella outbreak in a shared NICU room — containment and combating strategies

Immediate case-level measures:
• Isolate/cohort the index (colonized/infected) ELBW infant — ideally a single room; if not available, strict physical separation with dedicated equipment (stethoscope, thermometer, feeding supplies) not shared with other babies.
• Contact precautions: gown and gloves for all contact with the infant or their immediate environment, removed before touching another infant; strict hand hygiene (alcohol-based rub) before AND after every contact, for every baby in the room, by every staff member and parent.
• Treat the infected infant per sensitivity report (often colistin, tigecycline, or aminoglycoside-based combination therapy for carbapenem-resistant organisms, guided by microbiology/ID input) — colonization alone (without clinical infection) is not usually treated with systemic antibiotics, to avoid further resistance pressure.

Unit/outbreak-level containment (the other 3 ELBW + 4 VLBW infants in the room are contacts at risk):
• Active surveillance cultures (rectal/throat/skin swabs) of all co-located infants to detect silent colonization; cohort colonized infants together, separate from culture-negative infants, ideally with dedicated (cohorted) nursing staff for each group ("cohort nursing") to prevent cross-transmission via staff hands.
• Enhanced environmental cleaning and disinfection of the room, incubators, and shared equipment (with an agent effective against gram-negative organisms); review and restrict any unnecessary shared equipment/multi-dose vials.
• Reinforce strict hand hygiene compliance (audit/feedback), alcohol-based hand rub at every bedside, and antiseptic use before procedures.
• Review antibiotic stewardship in the unit — restrict/rationalize carbapenem and broad-spectrum antibiotic use (a key driver of resistance selection), de-escalate based on cultures wherever possible.
• Consider temporary closure of the unit/room to new admissions until the outbreak is controlled, if ongoing transmission is confirmed, per infection-control team decision.
• Notify hospital infection control/microbiology team formally, initiate outbreak documentation, and report per institutional/national nosocomial-infection surveillance policy.
• Investigate potential source/vehicle (contaminated equipment, breast milk, parenteral fluids, staff hands/rings/nails, understaffing/overcrowding contributing to breached hand hygiene) and address root cause.
• Continue surveillance cultures at intervals until the outbreak is declared over (per infection control criteria), and review nurse-to-patient ratios/staffing (overcrowding and understaffing are well-established outbreak risk factors in NICUs).
• Communicate transparently with parents of all exposed infants about the exposure, monitoring plan, and signs of infection to watch for.`,

  Q000107: `A) Lung-protective ventilation strategies in the neonate
Goal: minimize ventilator-induced lung injury (volutrauma, barotrauma, atelectrauma, biotrauma, oxytrauma) while achieving adequate gas exchange.
• Prefer non-invasive respiratory support (CPAP/NIPPV) as first-line where possible, avoiding intubation.
• Volume-targeted ventilation (rather than pressure-limited alone) to avoid volutrauma from variable lung compliance — target tidal volumes ~4-6 mL/kg.
• Adequate PEEP to maintain functional residual capacity and prevent atelectasis/atelectrauma from repeated alveolar collapse-reopening.
• Permissive hypercapnia (tolerating a somewhat higher PaCO2, e.g. 45-55-60 mmHg, with pH >7.20-7.25) to allow lower tidal volumes/pressures.
• Avoid hyperoxia — target appropriate SpO2 ranges (commonly 90-95% for preterm infants) using the lowest FiO2 needed; avoid unnecessary hyperventilation.
• Early surfactant administration (including minimally/less-invasive surfactant administration, LISA/MIST, to avoid intubation) for RDS.
• Synchronized modes of ventilation (SIMV, assist-control) to reduce patient-ventilator asynchrony.
• Early extubation to non-invasive support as soon as feasible; caffeine for apnea of prematurity to facilitate extubation.
• High-frequency ventilation as a rescue/alternative strategy in severe disease, using an "open lung" approach.

B) Pharmacological management of PDA
Indication: hemodynamically significant PDA (hsPDA — large left-to-right shunt causing pulmonary overcirculation/systemic steal, evidenced by echo criteria such as large ductal diameter, LA:Ao ratio, retrograde diastolic flow in descending aorta/other systemic vessels, plus clinical signs like bounding pulses, widened pulse pressure, hyperdynamic precordium, increasing ventilatory/oxygen requirement).
Agents:
• Indomethacin — cyclooxygenase (COX) inhibitor, effective but more renal/GI vasoconstriction, relatively contraindicated with thrombocytopenia, active bleeding, significant renal impairment, or NEC.
• Ibuprofen (IV or oral) — similarly effective COX inhibitor, generally preferred now over indomethacin due to a lower reported risk of renal impairment, NEC and reduced cerebral blood flow, though still requires similar caution around renal function and platelets.
• Paracetamol (IV or oral) — an emerging alternative (inhibits prostaglandin synthesis via a different pathway), increasingly used especially when NSAIDs are contraindicated (thrombocytopenia, renal dysfunction, NEC) — comparable closure rates in several trials with a more favorable renal/GI side-effect profile, though longer-term safety data are still accumulating.
General approach: current practice has shifted away from prophylactic/very early treatment of an asymptomatic PDA toward a more conservative, targeted approach — treating (pharmacologically or, if refractory, surgically/via transcatheter closure) only ductus that are hemodynamically significant and symptomatic, given evidence that many PDAs close spontaneously and that treatment itself carries risk.`,

  Q000108: `A) Stages of lactogenesis
Lactogenesis I (mid-pregnancy to ~day 2-3 postpartum): the mammary gland becomes capable of secreting milk components; colostrum is produced (small volume, rich in immunoglobulins/protein) — progesterone from the placenta keeps copious milk secretion suppressed.
Lactogenesis II ("milk coming in," ~day 2-5 postpartum): triggered by the sharp drop in progesterone (and estrogen) after placental delivery, with prolactin now driving copious milk secretion — volume increases markedly, composition shifts from colostrum toward more mature milk.
Lactogenesis III (galactopoiesis, from about day 9-10 onward through the rest of lactation): milk production becomes primarily under autocrine/local control ("supply = demand") — driven by frequency and completeness of milk removal (via the whey protein feedback inhibitor of lactation, FIL) rather than hormone withdrawal, and is maintained by this local/autocrine mechanism for the duration of breastfeeding.

B) Causes of lactation failure
Maternal factors: primary glandular insufficiency/insufficient glandular tissue, previous breast surgery (reduction, some augmentation, biopsy disrupting ducts), severe postpartum hemorrhage with Sheehan syndrome (pituitary infarction → prolactin deficiency), retained placental fragments (progesterone persists, delaying lactogenesis II), maternal illness/severe stress/pain, certain medications (e.g., some hormonal contraceptives, bromocriptine/cabergoline, pseudoephedrine), smoking, obesity, and — most commonly — poor early breastfeeding technique/management: delayed initiation, infrequent or ineffective milk removal, early supplementation with formula (reducing demand), poor positioning/latch, and lack of skilled lactation support.
Infant factors: prematurity/illness precluding effective sucking, ineffective/poor latch (e.g., tongue-tie), cleft lip/palate, neurological impairment affecting suck-swallow-breathe coordination, separation from mother (NICU admission without adequate pumping support).

C) Steps to improve breastfeeding
• Early initiation of breastfeeding within the first hour of life (skin-to-skin contact immediately after birth).
• Exclusive breastfeeding on demand, rooming-in (mother and baby together 24 hours), avoiding unnecessary prelacteal feeds/formula supplementation or pacifiers in the early weeks.
• Ensure correct positioning and attachment/latch — assessed and corrected by trained staff/lactation counsellor.
• Frequent, effective milk removal (8-12 times/day for a term infant) — for a separated/preterm infant, early and regular pumping (within hours of birth, 8+ times/day) to establish and maintain supply.
• Address any pain (cracked nipples, engorgement, mastitis) promptly rather than allowing it to reduce feeding frequency.
• Family/community support — counsel and involve family members (per the MAA programme model), avoid conflicting advice, provide continued lactation support after discharge (follow-up visits, helplines, support groups).
• Avoid unnecessary maternal-infant separation, and support mothers returning to work with expressed-milk strategies.
• Staff training (BFHI's "Ten Steps to Successful Breastfeeding") to ensure consistent, evidence-based counselling across the facility.`,

  Q000109: `A) Pulse oximetry screening for critical congenital heart disease (CCHD)
Timing: after 24 hours of age (to reduce false positives from normal transitional circulation) and before discharge.
Method: measure preductal (right hand) and postductal (either foot) SpO2.
Pass: both readings ≥95% AND the difference between the two ≤3%.
Fail: either reading <90%, OR both readings 90-94% (or a >3% difference) on 3 measurements each separated by an hour → fail, needs echocardiography/pediatric cardiology evaluation.
Rationale: aims to detect critical, duct-dependent CHD (e.g., hypoplastic left heart, transposition of great arteries, coarctation, TAPVC) that may be missed by antenatal ultrasound and clinical exam alone, before the baby decompensates after ductal closure — it is a screening adjunct, not a replacement for clinical exam or antenatal ultrasound, and does not detect all CHD (e.g., some coarctations, most acyanotic lesions).

B) Screening for developmental dysplasia of the hip (DDH)
Clinical exam: Barlow maneuver (attempts to dislocate a located, reducible hip posteriorly) and Ortolani maneuver (attempts to reduce/relocate a dislocated hip, felt as a "clunk") performed in the newborn period; look for asymmetric thigh/gluteal skin folds, limited hip abduction, apparent limb-length discrepancy (Galeazzi sign) in older infants.
Risk factors warranting more active screening/imaging even with a normal exam: breech presentation (especially in the third trimester), family history of DDH, female sex, first-born, oligohydramnios, congenital muscular torticollis/foot deformities.
Imaging: ultrasound of the hip is the investigation of choice up to about 4-6 months of age (before ossification of the femoral head, when x-ray becomes reliable) — used for infants with an abnormal exam, risk factors, or per universal-screening protocols in some countries; plain radiograph is used after ~4-6 months.

C) Red reflex
Technique: performed with a direct ophthalmoscope (or indirect ophthalmoscope) held about 12-18 inches from the infant's eyes in a dim room, viewing both eyes simultaneously to compare symmetry of the reflected red-orange glow from the retina.
Purpose: screens for conditions obstructing the visual axis or affecting the posterior segment — congenital cataract, retinoblastoma (may show white "leukocoria" instead of red, or an asymmetric reflex), retinal detachment, significant refractive error, corneal opacity, and vitreous hemorrhage.
An abnormal, absent, white, or asymmetric red reflex requires prompt ophthalmology referral — timely detection (e.g., of congenital cataract or retinoblastoma) is vision- and, in the case of retinoblastoma, life-saving. This should be performed on every newborn before discharge as part of the routine exam.`,

  Q000110: `A) Benefits of delayed cord clamping (DCC)
• Increases neonatal blood volume and placental transfusion (up to ~30% higher blood volume, ~30 mL/kg or more depending on timing).
• Improves iron stores and reduces iron-deficiency anemia in infancy (a benefit that persists for several months).
• Reduces the incidence of intraventricular hemorrhage (IVH) and need for blood transfusion in preterm infants.
• Facilitates a smoother cardiopulmonary transition — allows ongoing placental gas exchange/blood flow while the lungs aerate, supporting hemodynamic stability and reducing the risk of hypotension.
• Reduces the incidence of necrotizing enterocolitis (NEC) in some studies of preterm infants.
• No proven increase in postpartum hemorrhage risk to the mother.
Downsides balanced against these benefits: slightly higher rates of phototherapy-requiring jaundice from the higher red-cell mass/bilirubin load — considered an acceptable trade-off given the other benefits, and manageable with routine bilirubin monitoring.

B) Current recommendations for term and preterm infants
For both term AND preterm infants who do not require immediate resuscitation (i.e., are breathing/crying, with reasonable tone), current guidelines (WHO, ACOG, ILCOR/NRP) recommend delaying cord clamping for at least 30-60 seconds after birth (some protocols extend to 60-180 seconds), holding the infant at or below the level of the introitus/placenta if vaginal, or at a comparable level for cesarean, before clamping.
For infants requiring resuscitation, initiating resuscitation should not be delayed for cord clamping — most protocols favor early clamping in this situation, though some units are exploring "intact-cord resuscitation" (starting resuscitative steps with the cord still attached) where facilities/training allow.
Umbilical cord milking is NOT recommended for very preterm infants (<28-32 weeks gestation, varies by guideline) due to an observed increased risk of severe IVH in this group, even though it may still be considered in some term/late-preterm scenarios where DCC isn't feasible.`,

  Q000111: `A) Diagnostic criteria for MIS-N (Multisystem Inflammatory Syndrome in Neonates)
This is a recently described entity (post-COVID-19 pandemic literature) resulting from transplacental transfer of maternal SARS-CoV-2 antibodies/inflammatory mediators following maternal COVID-19 infection in pregnancy. Proposed diagnostic elements (criteria have varied slightly across case series/proposed definitions, but generally include):
• History of maternal SARS-CoV-2 infection during pregnancy (often in the second/third trimester).
• Neonate negative for active SARS-CoV-2 infection by RT-PCR.
• Evidence of passively-acquired antibody: initially negative neonatal IgM with positive IgG against SARS-CoV-2 (reflecting transplacental maternal IgG rather than the infant's own active/recent infection, since IgM does not cross the placenta).
• Involvement of ≥2 organ systems, most prominently cardiac (very common — arrhythmia, AV block, myocardial dysfunction, coronary artery dilation, cardiogenic shock), plus variable respiratory distress, gastrointestinal symptoms (feeding intolerance), mucocutaneous findings, hematologic abnormalities (thrombocytopenia, elevated inflammatory markers), and renal involvement.
• Fever is not a required/consistent feature in neonates (unlike MIS-C in older children).
• No other identified cause for the presentation (e.g., sepsis, another explained cardiac lesion) — a diagnosis of exclusion supported by elevated inflammatory markers (CRP, ferritin, D-dimer, pro-BNP/troponin if cardiac involvement).

B) Management
Largely extrapolated from MIS-C management given limited neonatal-specific data:
• Supportive/intensive care — hemodynamic support (inotropes for cardiogenic shock), respiratory support as needed, continuous cardiac monitoring (arrhythmia surveillance) and serial echocardiography.
• Immunomodulatory therapy — IVIG (as in MIS-C/Kawasaki-like management) ± corticosteroids for significant inflammation/cardiac involvement, guided by pediatric cardiology/rheumatology/infectious disease input.
• Anticoagulation/antiplatelet therapy (e.g., low-dose aspirin) if coronary artery involvement is present, similar to Kawasaki disease management principles.
• Treat any concurrent/alternative diagnosis (e.g., rule out and treat bacterial sepsis empirically until excluded, given overlapping presentation).
• Close follow-up including serial echocardiography for coronary artery changes, given the Kawasaki-like pathophysiology.`,

  Q000112: `First- and second-trimester prenatal tests for diagnosis of fetal aneuploidy

First trimester (typically 11-13+6 weeks):
• Nuchal translucency (NT) ultrasound — increased NT thickness is associated with trisomy 21, 18, 13, and other chromosomal/structural anomalies.
• Combined first-trimester screening: NT + maternal serum free β-hCG (elevated in trisomy 21) + PAPP-A (pregnancy-associated plasma protein-A, decreased in trisomy 21, 18, and with placental insufficiency/growth restriction) — combined into a risk score with maternal age.
• Additional soft markers sometimes included: nasal bone (absent/hypoplastic in trisomy 21), tricuspid regurgitation, ductus venosus Doppler (abnormal a-wave).
• Cell-free fetal DNA (NIPT/NIPS) — can be performed from ~10 weeks onward, analyzes cell-free placental DNA in maternal blood; high sensitivity/specificity for trisomy 21, 18, 13 and sex-chromosome aneuploidies — it is a screening test (not diagnostic), and a positive result requires confirmation by invasive testing.
• Chorionic villus sampling (CVS, ~11-14 weeks) — invasive diagnostic test (placental tissue sampling) giving a definitive fetal karyotype; carries a small procedure-related miscarriage risk.

Second trimester (typically 15-20 weeks):
• Quadruple ("quad") screen: maternal serum AFP (low in trisomy 21/18, high in neural tube defects), hCG (high in trisomy 21, low in trisomy 18), unconjugated estriol/uE3 (low in both trisomy 21 and 18), and inhibin A (high in trisomy 21) — combined into a risk score; a triple screen (without inhibin A) is an older variant.
• Detailed/targeted ultrasound (18-20 weeks) — looks for structural anomalies and "soft markers" of aneuploidy (echogenic intracardiac focus, choroid plexus cysts, echogenic bowel, renal pyelectasis, shortened femur/humerus, nuchal fold thickening).
• Amniocentesis (typically ≥15 weeks) — invasive diagnostic test (amniotic fluid sampling) for definitive fetal karyotype/chromosomal microarray, offered after a high-risk screening result or on request; carries a small miscarriage risk, lower than CVS.

General principle: NT/combined first-trimester screening and NIPT/quad screen are all SCREENING tests giving a risk estimate, not a diagnosis; CVS and amniocentesis are the DIAGNOSTIC (invasive) tests that provide a definitive karyotype, offered when screening is high-risk or diagnostic certainty is desired.`,

  Q000113: `A) Mechanism of Bilirubin-Induced Neurologic Dysfunction (BIND)
Unconjugated (indirect) bilirubin, when present in excess of the binding capacity of serum albumin, exists as free/unbound bilirubin that can cross the blood-brain barrier (more easily crossed in sick, preterm, acidotic, or hypoalbuminemic infants). Free bilirubin is neurotoxic — it disrupts mitochondrial function, interferes with neurotransmission, and induces oxidative stress and apoptosis in neurons, with particular affinity for metabolically active, densely-packed neuronal areas — especially the basal ganglia (globus pallidus, subthalamic nucleus), hippocampus, brainstem auditory and oculomotor nuclei, and cerebellum. The risk of BIND depends not just on total serum bilirubin level but on the free/unbound bilirubin fraction, which is increased by hypoalbuminemia, prematurity, sepsis, acidosis, hemolysis, and drugs that displace bilirubin from albumin (e.g., sulfonamides, ceftriaxone).

B) Clinical syndrome
Acute bilirubin encephalopathy evolves in phases:
• Early phase: lethargy, hypotonia, poor suck/feeding, high-pitched cry.
• Intermediate phase: moderate stupor/irritability alternating with lethargy, increasing tone (can show retrocollis-opisthotonus — arching of neck and trunk), fever, high-pitched cry — this phase may still be reversible with prompt exchange transfusion.
• Advanced/severe phase: pronounced retrocollis-opisthotonus, shrill cry, apnea, seizures, coma, sometimes death — changes at this stage are largely irreversible.
Chronic bilirubin encephalopathy (kernicterus) — the permanent sequelae, classically presenting later in infancy/childhood with: choreoathetoid cerebral palsy (extrapyramidal movement disorder from basal ganglia damage), sensorineural hearing loss/auditory neuropathy (often the earliest and most sensitive finding), upward-gaze palsy (limitation of upward gaze), and dental enamel dysplasia; cognition is often relatively preserved in "pure" kernicterus (a hallmark distinguishing it from many other causes of cerebral palsy).

C) MRI findings
Acute phase: T1-weighted hyperintensity/increased signal in the globus pallidus and subthalamic nucleus bilaterally and symmetrically (the most characteristic finding), which is transient and typically resolves.
Chronic phase (established kernicterus): T2-weighted (and later, more persistent) hyperintensity in the same bilateral, symmetric globus pallidus/subthalamic nuclei distribution, sometimes with associated volume loss — the bilateral symmetry and specific basal-ganglia/subthalamic localization is the key distinguishing imaging feature from hypoxic-ischemic injury (which more typically also affects the thalami/perirolandic cortex/watershed regions depending on the pattern) or other metabolic causes.`,

  Q000114: `A) Role of point-of-care ultrasound (POCUS) in neonatology
• Cardiac (functional echocardiography): assessing PDA size/hemodynamic significance and shunt direction, myocardial contractility/cardiac output, superior vena cava flow, pulmonary hypertension assessment, and guiding inotrope/fluid management in shock — allowing real-time bedside decisions without waiting for formal echocardiography.
• Cranial ultrasound: screening for and grading intraventricular hemorrhage, assessing for periventricular leukomalacia, ventricular size/hydrocephalus.
• Lung ultrasound: diagnosing/differentiating RDS, transient tachypnea of the newborn, pneumothorax (absence of "lung sliding"/"lung point" sign), pleural effusion, and guiding surfactant administration decisions and extubation readiness — increasingly replacing chest x-ray for many indications, avoiding radiation.
• Abdominal ultrasound: assessing for NEC (bowel wall thickness, free fluid/air, portal venous gas), evaluating renal/urinary tract anomalies.
• Procedural guidance: real-time ultrasound guidance for vascular access (umbilical/peripheral lines, PICC tip location), lumbar puncture, and pericardial/pleural fluid drainage, improving success rates and reducing complications.
• Assessing IVC/vascular filling status and guiding fluid resuscitation in the hemodynamically unstable infant.

B) Parameters of a hemodynamically significant PDA (hsPDA)
Echocardiographic: ductal diameter >1.5-2 mm (or indexed to weight), left atrium-to-aortic root ratio (LA:Ao) >1.4-1.5 (indicating left heart volume overload), left ventricular diastolic dimension enlargement, retrograde/reversed diastolic flow in the descending aorta, celiac, or middle cerebral artery (indicating a "steal" phenomenon), pulsatile/low-resistance ductal flow pattern, and elevated left ventricular output.
Clinical: bounding peripheral pulses, wide pulse pressure, hyperactive/hyperdynamic precordium, systolic (or continuous "machinery") murmur, tachycardia, increasing ventilatory or oxygen requirement/failure to wean from respiratory support, poor feeding tolerance, and unexplained metabolic acidosis — from pulmonary overcirculation combined with systemic hypoperfusion ("ductal steal").`,

  Q000115: `A) Phases of fetal lung development
1. Embryonic stage (~3-7 weeks): the lung bud forms from the foregut endoderm and begins branching into the primitive bronchial tree.
2. Pseudoglandular stage (~5-17 weeks): continued dichotomous branching forms the conducting airways down to the level of terminal bronchioles; the lung resembles a gland histologically — no gas exchange is possible yet; a fetus born in this stage cannot survive.
3. Canalicular stage (~16-26 weeks): respiratory bronchioles and early alveolar ducts develop, the capillary network proliferates and moves closer to the developing airway epithelium, and type II pneumocytes appear and begin producing surfactant (from ~20-24 weeks) — this stage marks the threshold of potential extrauterine viability as primitive gas-exchange surfaces form.
4. Saccular stage (~24-38 weeks): terminal saccules (primitive alveoli) form with further thinning of the air-blood barrier and increasing surfactant production — most preterm infants are born during this stage.
5. Alveolar stage (~36 weeks to term, continuing for years after birth): true alveoli form via septation of the saccules, with a dramatic increase in surface area for gas exchange; alveolarization continues well into early childhood.

B) Role of antenatal steroids in late preterm delivery
See the ALPS-trial evidence: a single course of betamethasone given to women at risk of delivery between 34 0/7 and 36 6/7 weeks (who haven't already received a course) significantly reduces short-term neonatal respiratory morbidity — less need for respiratory support, and reduced rates of transient tachypnea of the newborn and severe RDS — reflecting accelerated surfactant production/lung maturation and fluid clearance even at this later gestational window. This evidence changed practice (endorsed by ACOG and similar bodies) to now offer steroids in this specific late-preterm scenario, whereas previously antenatal steroids were reserved mainly for <34 weeks. Caveat: increased risk of neonatal hypoglycemia after exposure warrants glucose monitoring, and long-term neurodevelopmental follow-up (ALPS follow-up study) has so far shown no significant difference from placebo — steroids should still be reserved for those genuinely at risk of imminent (within 7 days) late-preterm delivery, not given electively without an obstetric indication.`,

  Q000116: `A) Forest plot
A standard graphical way of displaying the results of a meta-analysis. Each horizontal line represents one individual study's effect estimate (e.g., relative risk, odds ratio, mean difference) with its 95% confidence interval (the length of the line reflects the CI width/precision); a square or box marks the point estimate, often sized proportionally to that study's weight in the overall pooled analysis. A vertical "line of no effect" (RR/OR = 1, or mean difference = 0) is drawn — if a study's CI crosses this line, that individual study's result is not statistically significant. A diamond at the bottom represents the pooled/summary effect estimate across all included studies, with its width representing the pooled 95% CI; if the diamond doesn't cross the line of no effect, the overall pooled result is statistically significant.

B) Bias
Systematic (non-random) error in the design, conduct, or analysis of a study that leads to a distorted (over- or under-) estimate of the true effect/association. Distinguished from random error (chance), which affects precision but not systematically skews the direction of results. Major types include:
• Selection bias — systematic differences in how subjects are selected/allocated to groups (e.g., inadequate randomization/allocation concealment).
• Information/measurement bias — systematic errors in how outcome or exposure data are collected (e.g., recall bias, observer/detection bias, differential measurement between groups).
• Confounding — a third factor associated with both exposure and outcome that distorts the apparent association (technically a distinct concept from bias, though often discussed alongside it).
• Publication bias — studies with positive/significant results are more likely to be published than negative/null studies, distorting the evidence base seen in a systematic review (assessed using tools like a funnel plot).
Minimizing bias is central to good study design — randomization, allocation concealment, blinding (of participants, assessors, and analysts), and intention-to-treat analysis are key safeguards.

C) PICO
A structured framework for formulating a clear, focused, and answerable clinical/research question, especially for evidence-based practice and literature searching:
P — Population/Patient (who is being studied — e.g., preterm infants <32 weeks with RDS)
I — Intervention (the exposure/treatment being evaluated — e.g., early surfactant via LISA)
C — Comparison (the alternative/control being compared against — e.g., standard intubated surfactant administration)
O — Outcome (the outcome of interest being measured — e.g., need for mechanical ventilation, BPD incidence, mortality)
(Some versions extend this to PICOT, adding Time frame, or PICOS, adding Study design.) A well-formed PICO question underlies a focused literature search strategy and forms the basis for framing systematic reviews and clinical trials.`,

  Q000117: `A) Causes of postnatal growth failure in a preterm infant after discharge
This baby (32 weeks, discharged at 1.64 kg at 34 weeks corrected age, now 1.4 kg two weeks after discharge) has lost weight post-discharge — a red flag requiring systematic evaluation. Causes include:
• Inadequate caloric/nutrient intake: insufficient breast milk volume/inadequate fortification after stopping in-hospital fortifier, poor feeding technique/latch, incorrect formula reconstitution (over-diluted), infrequent feeds, or a caregiver's misunderstanding of feeding volume/frequency needs.
• Feeding difficulty/incoordination: persistent immature suck-swallow-breathe coordination, oromotor dysfunction, gastroesophageal reflux causing feed refusal/vomiting.
• Underlying illness: occult infection/sepsis, urinary tract infection, undiagnosed cardiac lesion (e.g., missed hsPDA or CHD), anemia of prematurity, chronic lung disease with increased metabolic demand, undiagnosed metabolic/endocrine disorder (e.g., hypothyroidism).
• Psychosocial/environmental factors: parental stress, anxiety, or lack of support/education after a stressful NICU stay, financial constraints affecting formula purchase, missed follow-up appointments, or postpartum maternal depression affecting feeding routine.
• Measurement/recording error: inconsistent weighing technique/scale calibration should be excluded before assuming true weight loss.

B) Management
• Take a detailed feeding history (volume, frequency, technique, formula preparation/dilution, any vomiting/reflux/stooling pattern) and observe a feed directly if possible.
• Full clinical examination for signs of illness, dehydration, cardiac murmur, dysmorphism; check for interval infection/sepsis workup if indicated.
• Investigations as guided by findings: complete blood count (anemia, infection), electrolytes/renal function, urine routine/culture, thyroid function tests, echocardiogram if cardiac cause suspected.
• Optimize nutrition: increase feeding frequency/volume as tolerated, continue or reintroduce human milk fortification for a longer post-discharge period (post-discharge/preterm formula or fortified breast milk is generally continued at least until term-corrected age or later based on growth), correct any feeding-technique or reflux issues, treat any identified underlying illness.
• Closer follow-up: more frequent weight checks (e.g., twice weekly until reliable catch-up growth resumes) with a low threshold for re-admission if growth failure is severe, persistent, or if the infant appears unwell/dehydrated.
• Involve a multidisciplinary team as needed — lactation consultant, dietitian, and social support services — and ensure caregivers are confident and well-supported with feeding before/at each follow-up visit.`,
};

async function upsertModelAnswer(questionId: string, body: string) {
  await db.answer.upsert({
    where: { masterQuestionId: questionId },
    create: { masterQuestionId: questionId, correctLetter: null, confidenceStatus: "EXTERNAL_VERIFICATION", sourcedFrom: "external_research" },
    update: { confidenceStatus: "EXTERNAL_VERIFICATION", sourcedFrom: "external_research" },
  });
  await db.explanation.upsert({
    where: { masterQuestionId: questionId },
    create: { masterQuestionId: questionId, body },
    update: { body },
  });
}

async function main() {
  for (const [id, body] of Object.entries(ANSWERS)) {
    await upsertModelAnswer(id, body);
    console.log(`Wrote model answer for ${id}`);
  }
  await db.$disconnect();
}
main().catch((e) => { console.error(e); process.exit(1); });
