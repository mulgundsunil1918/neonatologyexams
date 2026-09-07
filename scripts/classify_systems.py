#!/usr/bin/env python3
"""
Phase 5 (partial): assign a primary System + Topic to every master question.

This is a keyword-driven FIRST PASS, not expert curation — every assignment is honest about
that via `classification_confidence: "heuristic"`. Order matters: more specific systems (ROP,
Ventilation, Resuscitation, Neuroimaging, Neonatal Equipment, Thermoregulation, Transport,
Quality Improvement, Research/Statistics) are checked BEFORE their broader parent (Respiratory,
Neurology) so a PIP/PEEP ventilator-mechanics question lands in Ventilation, not Respiratory,
matching the spec's explicit 24-system list rather than collapsing it back to organ systems.
Questions matching no rule stay "Unclassified" rather than being forced somewhere wrong.
"""
import sys, os, json, re
sys.path.insert(0, os.path.dirname(__file__))
from normalize import fold

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

SYSTEMS_ORDERED = [
    "Resuscitation", "Ventilation", "Neonatal Equipment", "ROP", "Neuroimaging",
    "Thermoregulation", "Transport", "Quality Improvement", "Research/Statistics",
    "Neonatal Procedures", "Neonatal Pharmacology", "Genetics", "Fetal Medicine",
    "Developmental Physiology", "Metabolic", "Endocrinology", "Nutrition",
    "Hematology", "Infectious Disease", "Renal", "Gastrointestinal",
    "Cardiovascular", "Neurology", "Respiratory",
]

# each entry: (system, [keyword substrings checked against folded stem+options text])
RULES = {
    "Resuscitation": [
        "positive pressure ventilation", "ppv", "chest compression", "mrsopa", "apgar",
        "nrp", "endotracheal adrenaline", "delivery room", "heart rate of 50", "heart rate below",
        "meconium stained", "resuscitation", "bag and mask", "t piece resuscitator",
        "cord clamping", "cord milking", "golden minute",
    ],
    "Ventilation": [
        "peep", "pip", "tidal volume", "mean airway pressure", "hfov", "time constant",
        "pendelluft", "ventilator", "ventilation mode", "synchronized intermittent",
        "volume targeted", "nasal cpap", "bubble cpap", "compliance", "fio2", "extubat",
        "high frequency oscillat", "nava", "trigger sensitivity", "flow rate",
        "endotracheal tube", "insertion of ett", "ett size",
    ],
    "Neonatal Equipment": [
        "incubator", "radiant warmer", "phototherapy unit", "pulse oximeter", "infusion pump",
        "double wall incubator", "servo control", "warming device",
    ],
    "ROP": [
        "retinopathy of prematurity", "rop screening", "vegf", "avascular retina",
        "plus disease", "zone 1", "zone 2", "zone 3", "a-rop", "aggressive posterior rop",
        "anti-vegf", "bevacizumab", "laser photocoagulation",
    ],
    "Neuroimaging": [
        "cranial ultrasound", "cranial usg", "ventricular index", "germinal matrix",
        "periventricular", "mri shows", "mri findings", "basal ganglia", "white matter injury",
        "head ultrasound", "resistive index", "ultrasound of the neonatal head",
    ],
    "Thermoregulation": [
        "hypothermia", "radiant heat", "thermal management", "axillary temperature",
        "heat loss", "kangaroo mother care", "kmc", "servo controlled", "plastic wrap",
        "cold stress", "therapeutic hypothermia", "target temperature",
    ],
    "Transport": [
        "transport of neonate", "transport incubator", "inter-hospital transfer", "referral transport",
        "stable prior to transport", "during transport",
    ],
    "Quality Improvement": [
        "root cause analysis", "quality improvement", "pdsa", "fishbone", "quintero staging",
        "number needed to treat", "audit", "nnfi", "level iii", "level ii nicu",
    ],
    "Research/Statistics": [
        "forest plot", "funnel plot", "p-value", "p value", "odds ratio", "risk ratio",
        "confidence interval", "meta-analys", "prisma", "strobe", "consort", "cohort study",
        "case control", "sensitivity and specificity", "roc curve", "kaplan meier",
        "publication bias", "randomized controlled", "systematic review", "pico",
    ],
    "Neonatal Procedures": [
        "exchange transfusion", "lumbar puncture", "umbilical catheter", "umbilical venous",
        "umbilical arterial", "chest tube", "thoracocentesis", "paracentesis",
        "central line", "picc", "intraosseous",
    ],
    "Neonatal Pharmacology": [
        "mechanism of action of", "drug of choice for", "dose of", "mcg/kg/min", "half life",
        "adverse effect of", "milrinone", "sildenafil", "adenosine", "indomethacin",
        "caffeine citrate", "surfactant therapy", "dopamine", "dobutamine", "morphine",
        "midazolam", "phenobarbitone", "vancomycin dosing", "gentamicin", "gir",
        "glucose infusion rate",
    ],
    "Genetics": [
        "trisomy", "karyotype", "pedigree", "autosomal", "x-linked", "mitochondrial inheritance",
        "chromosomal", "inborn error of metabolism", "microdeletion", "syndrome" ,
        "dysmorphic", "chromosome analysis",
    ],
    "Fetal Medicine": [
        "antenatal", "prenatal test", "aneuploidy screen", "nuchal translucency", "amniocentesis",
        "chorionic villous sampling", "nipt", "non invasive prenatal", "fetal growth restriction",
        "biophysical profile", "non-stress test", "doppler", "twin pregnancy", "twin-twin transfusion",
        "oligohydramnios", "polyhydramnios", "quadruple marker", "papp-a", "msafp",
        "functional unit of placenta", "spirochete", "fetal bradycardia",
        "sexual differentiation", "infants of diabetic mother", "quad screen",
        "growth hormone in fetal life",
    ],
    "Developmental Physiology": [
        "walking reflex", "moro reflex", "grasp reflex", "developmental milestone",
        "developmental screening", "quickening", "reflex normally disappear",
        "gestational age assessment", "new ballard", "developmental dysplasia",
        "growth chart", "intergrowth", "postmenstrual age", "physiological weight loss",
        "small for gestational age", "large for gestational age",
        "appropriate for gestational age", "head growth", "pupillary light",
        "unfusing of eye lid", "postnatal follow up",
    ],
    "Metabolic": [
        "hypoglycemia", "hyperglycemia", "metabolic acidosis", "metabolic alkalosis",
        "osteopenia of prematurity", "electrolyte", "hyponatremia", "hypernatremia",
        "hypocalcemia", "hypercalcemia", "hypomagnesemia", "acid base", "blood gas",
        "fatty acid oxidation", "organic acidemia", "maple syrup urine", "galactosemia",
        "ammonia", "calcium and phosphorus", "insensible water loss", "glucose production",
        "kcl", "potassium content", "hyperkalemia", "intra cellular and extra cellular fluid",
        "renal concentrating ability",
    ],
    "Endocrinology": [
        "congenital hypothyroid", "congenital adrenal hyperplasia", "thyroid hormone",
        "hypothyroxinemia", "adrenal insufficiency", "thyroid stimulating hormone",
        "ambiguous genitalia", "disorders of sex differentiation",
    ],
    "Nutrition": [
        "breast milk", "breastfeeding", "human milk fortif", "colostrum", "parenteral nutrition",
        "total parenteral", "vitamin d", "iron deficiency", "enteral feed", "feed intolerance",
        "extra-uterine growth", "eugr", "vitamin k", "milk bank", "lactogenesis", "weaning",
        "complementary feeding", "protein content", "disaccaridase", "disaccharidase",
        "macronutrient", "copper deficiency", "poorly digested",
    ],
    "Hematology": [
        "polycythemia", "anemia of prematurity", "thrombocytopenia", "hemolytic disease",
        "abo incompatibility", "rh isoimmunization", "prbc transfusion", "exchange transfusion",
        "coagulation", "platelet count", "hemoglobin", "hematocrit", "petechiae",
        "disseminated intravascular",
    ],
    "Infectious Disease": [
        "sepsis", "meningitis", "toxoplasm", "cytomegalovirus", "herpes simplex", "syphilis",
        "rubella", "hepatitis b", "hepatitis c", "tuberculosis", "congenital infection",
        "torch", "chorioamnionitis", "antibiotic", "candida", "fungal infection", "hiv positive",
        "chlamydia", "group b strep", "gbs",
    ],
    "Renal": [
        "acute kidney injury", "aki", "fena", "fractional excretion", "renal tubular acidosis",
        "urine output", "hydronephrosis", "posterior urethral valve", "multicystic dysplastic",
        "renal vein thrombosis", "oliguria", "creatinine clearance",
    ],
    "Gastrointestinal": [
        "necrotizing enterocolitis", " nec ", "nec is", "biliary atresia", "cholestasis",
        "bilious vomiting", "duodenal atresia", "gastroschisis", "omphalocele",
        "hirschsprung", "tracheoesophageal fistula", "meconium ileus", "pyloric stenosis",
        "jaundice", "hyperbilirubinemia", "kernicterus", "bind score", "phototherapy",
    ],
    "Cardiovascular": [
        "patent ductus arteriosus", "pda", "congenital heart disease", "cyanotic heart",
        "transposition of great", "tetralogy of fallot", "coarctation of aorta",
        "hypoplastic left heart", "pphn", "pulmonary hypertension", "pulse oximetry screening",
        "svt", "supraventricular tachycardia", "shock", "cardiac output", "ecg",
        "vein of galen",
    ],
    "Neurology": [
        "seizure", "encephalopathy", "hypoxic ischemic", "hie", "sarnat", "intraventricular hemorrhage",
        "ivh", "microcephaly", "hydrocephalus", "neural tube defect", "spina bifida",
        "brachial plexus", "erb", "cerebral palsy", "cerebral blood flow", "ptosis",
        "hypotonia", "cranial nerve", "neuronal migration", "periventricular leukomalacia",
        "pvl", "facial nerve palsy", "phenytoin", "scaphocephaly", "suture", "vein of galen",
        "klumpke", "vacuum extraction", "cephalhematoma", "caput succedaneum", "subgaleal",
    ],
    "Respiratory": [
        "respiratory distress", "hyaline membrane", "bronchopulmonary dysplasia", "bpd",
        "apnea of prematurity", "pneumothorax", "stridor", "laryngomalacia", "choanal atresia",
        "diaphragmatic hernia", "downes score", "silverman anderson", "surfactant",
        "lung development", "pierre robin",
    ],
}


def classify(text_folded: str):
    for system in SYSTEMS_ORDERED:
        for kw in RULES[system]:
            if fold(kw) in text_folded:
                return system, kw
    return "Unclassified", None


def main():
    mq = json.load(open(os.path.join(ROOT, "data", "master", "master_questions.json")))
    counts = {}
    for m in mq:
        opt_text = " ".join(x["text"] for x in (m["options"] or m["sub_parts"]))
        full = fold(m["stem"] + " " + opt_text)
        system, matched_kw = classify(full)
        m["primary_system"] = system
        m["classification_confidence"] = "unclassified" if system == "Unclassified" else "heuristic"
        m["classification_matched_keyword"] = matched_kw
        counts[system] = counts.get(system, 0) + 1

    out_path = os.path.join(ROOT, "data", "master", "master_questions_classified.json")
    json.dump(mq, open(out_path, "w"), indent=2)

    print(f"{'SYSTEM':<26}{'COUNT':<8}%")
    print("-" * 45)
    total = len(mq)
    for s in SYSTEMS_ORDERED + ["Unclassified"]:
        c = counts.get(s, 0)
        if c:
            print(f"{s:<26}{c:<8}{100*c/total:.1f}%")
    print("-" * 45)
    print(f"TOTAL: {total}   Unclassified: {counts.get('Unclassified',0)} ({100*counts.get('Unclassified',0)/total:.1f}%)")


if __name__ == "__main__":
    main()
