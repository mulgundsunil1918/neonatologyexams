# DM/DrNB topic taxonomy — shared vocabulary for priority tagging

Used by every tagging batch (agent or manual) so the same clinical theme always gets the
*same* tag string — priority counting is exact-string on `DmQuestionItem.topicTag`, so
inconsistent naming (e.g. "PPHN" vs "Persistent Pulmonary Hypertension" for the same thing)
would silently fragment a genuinely high-yield topic into several low-count ones.

Sunil's instruction, verbatim: "it need not be exact word to word match, any nearer topic to
similar question also to be considered for prioritising" — so these are deliberately BROAD,
thematic buckets (coarser than the NNF Theory tag set), meant to catch a pathophysiology
question, a management question, and a drug question about the same condition all under one
tag, not three.

A tagger should pick the closest-fitting entry below for every item. Only mint a new tag if a
question genuinely doesn't fit any of these — and if so, keep it at this same granularity
(a clinical theme, not a single question's exact subject).

## Paper I — Basic sciences / research methods
PPHN & pulmonary vasculature, Surfactant biology, Lung development, Fetal circulation &
transition, Cardiac embryology & CHD development, CNS & neural tube development, Renal
development & function, Placental physiology & transport, Bilirubin metabolism & kernicterus,
Retina & ROP pathophysiology, Thermoregulation, Calcium & bone metabolism, Genetics &
dysmorphology, Hematology & hemoglobin synthesis, Endocrine (thyroid/adrenal), Host defense
& immunity, Antimicrobial resistance mechanisms, Respiratory physiology, Skin development,
Apnea of prematurity, Amniotic fluid & fetal wellbeing, IUGR & fetal growth, Biostatistics &
study design (RCT/CONSORT/randomization/bias), Diagnostic test statistics (ROC/likelihood
ratio/sensitivity-specificity), Evidence synthesis (meta-analysis/systematic review/forest
plot/funnel plot), Sample size & study types, Pharmacology (methylxanthines, other drugs),
Fluid, electrolyte & acid-base physiology, GI & hepatic development, Cardiovascular
physiology & hemodynamics, Preterm labour prediction & prevention.

## Paper II/III — Clinical neonatology & NICU
HIE & therapeutic hypothermia, NEC, RDS & surfactant therapy, PDA, BPD / chronic lung disease,
IVH / PVL / neonatal neuroimaging, ROP screening & management, Neonatal sepsis & infection
control, Congenital heart disease & neonatal shock, DSD / ambiguous genitalia, Inborn errors
of metabolism, Neonatal seizures, Jaundice & hyperbilirubinemia management, Anemia &
transfusion, Thrombocytopenia & bleeding disorders, Acute kidney injury, GI surgical
conditions, TPN & neonatal nutrition, Ventilation strategies & modes, CPAP / non-invasive
respiratory support, Neonatal transport & stabilization, Hypoglycemia, Congenital anomalies
& syndromes, Neonatal skin conditions, Ethics & palliative/compassionate care, Developmental
dysplasia of hip, Vascular thrombosis, Cardiac arrhythmia, Neonatal pain, Fever & neonatal
infection workup, Congenital infections (TORCH/HIV/syphilis/varicella), Metabolic bone
disease of prematurity, Late preterm & early term morbidity, Neonatal cholestasis, Hydrops
fetalis & hemolytic disease of the newborn, Neuromuscular disorders & floppy infant, Birth
trauma & injuries, Infant of diabetic mother, Neonatal abstinence syndrome, Newborn discharge
planning & criteria, NICU developmental care & family support, Meconium aspiration syndrome,
NICU monitoring & bedside procedures, Postnatal growth failure & faltering growth, Neonatal
hypertension, Extreme prematurity & periviable birth, Pleural effusion & chylothorax.

## Paper IV — Community neonatology, MCH programmes, recent advances
National MCH programmes (JSY/JSSK/RBSK/DEIC/HBNC/MAA/LaQshya/MusQan), Neurodevelopmental
follow-up & assessment tools, Kangaroo mother care, Human milk, lactation & donor milk
banking, Newborn screening, Neonatal resuscitation guidelines & updates, Quality improvement
& patient safety (NQAS/PDSA/medication error/root cause analysis), Levels of neonatal care &
health systems, Cord blood banking, Digital health & recent technology (AI/telemedicine/
POCUS), Congenital malformation prevention & registries, Growth monitoring & charts,
Hospital-acquired infection prevention, Fetal therapy & surgery, Perinatal mortality & audit,
Home-based newborn care, Workforce burnout & healthcare worker safety.

(Not an exhaustive final list — extend it, at this same granularity, when a batch genuinely
needs a new bucket, and record the addition here so later batches see it too.)
