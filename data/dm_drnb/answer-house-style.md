# DM/DrNB model answer house style

Same standard as the NNF/IAP Theory model answers in this app (`src/lib/theory-topics.ts`'s
sibling content, written across several earlier passes) — DM-superspeciality depth, not a
basic postgraduate answer. Every writing batch must follow this exactly.

## Depth, calibrated to marks (the actual `marks` field on each item)

**The heuristic: an examiner awards ~1 mark per distinct correct clinical point.** A 15-mark
item needs ~14-18 distinct points; a 7-mark item needs ~6-9.

- **15 marks** ("I. Elaborate on" items): ~700-1000 words, organized under 4-6 named
  sub-headings appropriate to the question (typically some subset of: Definition/
  Classification, Etiology/Pathophysiology, Clinical features, Investigations, Management
  — with real doses/protocols/monitoring parameters, not just drug names — Complications/
  Prognosis). A two-part question ("(a)... (b)...") gets both halves covered with this same
  total depth, not half each.
- **7 marks** ("II. Write notes on" items): ~350-500 words, 3-4 named sub-headings, same
  "distinct point per mark" discipline — don't pad, don't skip real clinical content either.
- A very short prompt (e.g. "MRSA.", "Forest plot.") still gets full 7-mark depth — the
  brevity of the prompt is just the exam's phrasing, not a signal to write less.

## Format

Markdown, rendered through the app's existing `MarkdownBody` component (same as NNF Theory) —
`##`/`###` headings, `**bold**` for key terms/named entities, tables (GFM pipe syntax) for
genuine comparisons (e.g. old vs new criteria, drug dose tables, staging systems), bullet
lists where the content is really a list. Write real prose under headings, not just bullet
fragments — this is a superspeciality exam answer, not flashcard notes.

## Citations — verified only, never fabricated

Cite a real named trial/guideline only where it genuinely applies (a definition or basic
mechanism question usually cites nothing). **DM/DrNB has no uploaded source library at all**
(unlike the main NNF/IAP question bank) — every citation here is by construction external/
current-knowledge, verified via web search if you are not already certain of the exact
authors/year/journal, never invented. If uncertain whether a specific number or trial name is
right, either verify it or state the concept without the specific attribution — a correct
uncited fact beats a confident wrong citation every time.

**Reuse this already-verified library directly (no need to re-verify these specific ones)**,
maintained across the NNF Theory rewrite:
Thornton PES 2015 hypoglycemia; McKinlay CHYLD *NEJM* 2015; Beardsall NIRTURE *NEJM* 2008;
Franz ETTNO *JAMA* 2020; Kirpalani TOP *NEJM* 2020 / PINT 2006; Shankaran NICHD *NEJM* 2005;
Azzopardi TOBY *NEJM* 2009; Gluckman CoolCap *Lancet* 2005; Thayyil HELIX *Lancet Glob Health*
2021 (LMIC cooling — did NOT show benefit, don't present cooling as unconditionally beneficial
in the Indian context); Jobe & Bancalari 2001 / Jensen *AJRCCM* 2019 BPD definitions; Schmidt
CAP trial *NEJM* 2006/2007 caffeine; Doyle DART *Pediatrics* 2006 low-dose dexamethasone;
Clyman PDA-TOLERATE *J Pediatr* 2019; Schmidt TIPP *NEJM* 2001; Papile 1978 *J Pediatr* IVH
grading; de Vries sonographic PVL grading; Walsh & Kliegman 1986 modified Bell's NEC staging;
AlFaleh & Anabrees Cochrane 2014 probiotics; Jani/Antenatal-CDH-Registry O/E LHR; Doyle &
Crowther Cochrane 2009 antenatal MgSO4 (NNT 63 for CP); Einspieler & Prechtl 2005 General
Movements Assessment; Kimberlin 2001/2011 neonatal HSV; Anand NEOPAIN *Lancet* 2004; Stevens
PIPP-R 2014; JCIH 2019 "1-3-6" hearing benchmark; WHO Immediate KMC Study Group *NEJM* 2021;
Göpel AMV/LISA *Lancet* 2011; Dorling SIFT *NEJM* 2019; Gyamfi-Bannerman ALPS *NEJM* 2016; WHO
ACTION-I *NEJM* 2020; Thangaratinam pulse-ox meta-analysis *Lancet* 2012; Tyson Vitamin A/BPD
*NEJM* 1999; Kraft buprenorphine NAS *NEJM* 2017; Mullany chlorhexidine cord care *Lancet*
2006; INIS/Brocklehurst IVIG *NEJM* 2011; Vain 2014 placental-transfusion-position *Lancet*;
SUPPORT/BOOST-II/COT oxygen-target trials; Kaiser Permanente EOS sepsis calculator; Quintero
TTTS staging; Moher PRISMA; Banker & Larroche PVL neuropathology. New Ballard: popliteal angle
reaches a score of 5, breast never does (max 4) — a recurring fact worth getting right.
India-specific programmes (verified in Updates 13/14): MAA (breastfeeding promotion, Aug
2016), DEIC (RBSK referral/management hub for the "4 Ds"), LaQshya (labour-room QI, 2017),
MusQan (child-friendly services QI, 2021).

Paper I is heavy on **research methods/biostatistics** — a different citation flavor from the
clinical list above: cite the actual statistical concept correctly (CONSORT statement
components, ROC curve/AUC interpretation, sensitivity/specificity/PPV/NPV formulas, forest
plot/funnel plot/meta-analysis mechanics, sample size determinants, types of bias) rather than
reaching for a clinical trial — these questions test methodology, not clinical trial recall.

## Content integrity — the same standing rule as everywhere else in this app

Never fill a gap with confident-sounding but unverified general knowledge. Never present an
uncited claim as if it were textbook-sourced (there is no textbook here). If a question is
genuinely ambiguous or the "correct" framing is disputed in the literature, say so briefly
rather than picking one answer and hiding the disagreement — matches how the NNF MCQ rewrite
flagged ~20 genuine answer-key disputes rather than silently forcing an answer.

## What NOT to do

Don't pad short prompts with restated question text. Don't invent a numbered dose/protocol you
aren't sure of — either verify it or describe the approach without the exact number. Don't
cite the same one or two "famous" trials on every single answer regardless of fit — a
definition question doesn't need a citation, and reaching for one anyway is exactly the kind
of overclaiming this house style exists to avoid.
